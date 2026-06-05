# RoroForm — Testing guide

RoroForm ships **two** test suites, because the package is two things at once:

| Suite | Tooling | What it proves | Tests |
|-------|---------|----------------|-------|
| **PHP** | [Pest](https://pestphp.com) + [Orchestra Testbench](https://github.com/orchestral/testbench) | The Blade components render the right HTML and integrate with Laravel (`old()`, validation errors, CSRF, themes). | **423** |
| **JS** | [Vitest](https://vitest.dev) + [jsdom](https://github.com/jsdom/jsdom) + jQuery | The browser runtime behaves correctly: the `roro()` facade, repeatable groups, selects. | **391** |

**814 tests total.** The two suites are independent — the PHP suite tests what the *server* produces, the JS suite tests what the *browser runtime* does with it.

---

## Running the tests

```bash
# one-time install
composer install        # PHP dev deps (Pest + Testbench)
npm install             # JS dev deps (Vitest + jsdom + jQuery)

# run everything
composer test           # or: vendor/bin/pest          → the PHP suite
npm test                # or: npx vitest run            → the JS suite

# focused runs
vendor/bin/pest tests/Feature/Components/SelectsTest.php
npx vitest run tests/js/repeatable-dom.test.js
npm run test:watch      # vitest in watch mode
```

---

## Layout

```
tests/
├── TestCase.php                     # PHP base class (Testbench) + helpers
├── Pest.php                         # binds TestCase to every PHP test
├── Feature/
│   ├── SmokeTest.php                # renders one of every component (tailwind + bootstrap)
│   ├── ConfigMergeTest.php          # mergeConfigFrom: components work unpublished (3)
│   └── Components/
│       ├── TextInputsTest.php       # text · email · password · url · tel        (54)
│       ├── NumericDateInputsTest.php# number · range · date/time · color · hidden (59)
│       ├── ChoiceInputsTest.php     # checkbox · radio · radio-container          (40)
│       ├── SelectsTest.php          # select · multi-select                       (61)
│       ├── FileInputTest.php        # file                                        (45)
│       ├── FormAndButtonTest.php    # form · button (csrf, enctype, ajax, overlay)(34)
│       ├── RepeatableComponentTest.php # repeatable: data-* attrs, row priority   (57)
│       └── CrossCuttingTest.php     # old() · errors · required · theme switching (31)
├── Unit/
│   └── ComponentLogicTest.php       # pure PHP: Form/Repeatable/InputMain logic   (37)
└── js/
    ├── helpers/roroEnv.js           # loads the runtime into jsdom
    ├── repeatable-logic.test.js     # name math: indexName/deindex/setPath…       (58)
    ├── repeatable-dom.test.js       # add/remove/reindex/serialize rows           (75)
    ├── facade-input.test.js         # roro(id): value()/disable()/error()…        (112)
    ├── facade-form.test.js          # roro.form(id): data()/fill()/errors()…      (62)
    └── selectable.test.js           # RoroSelect / RoroMultiSelect                (84)
```

---

## How the PHP suite works

A Composer package has no Laravel app of its own, so [Testbench](https://github.com/orchestral/testbench) **boots a minimal Laravel app in memory** for each test. Everything hangs off `tests/TestCase.php`:

```php
abstract class TestCase extends Orchestra\Testbench\TestCase
{
    // Registers the package so <x-roro-*> tags resolve.
    protected function getPackageProviders($app): array
    {
        return [RoroFormServiceProvider::class];
    }

    // The provider does NOT merge the package config (see "Gotchas"),
    // so tests supply it explicitly — and can swap the theme.
    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('roroform.theme', 'tailwind');
        $app['config']->set('roroform.defaultJsValidation', true);
    }
}
```

`tests/Pest.php` wires this base into every test file:

```php
uses(RoroForm\Tests\TestCase::class)->in(__DIR__);
```

### The helpers a test uses

| Helper | What it does |
|--------|--------------|
| `$this->render($blade, $data = [])` | Compiles & renders a Blade string with all `<x-roro-*>` components registered. Returns the HTML string. |
| `$this->theme('bootstrap')` | Switches the active theme (`tailwind` \| `bootstrap` \| `raw`). Chainable. |
| `$this->defaultJsValidation(false)` | Toggles whether required fields emit the HTML `required` attribute. |
| `$this->withOld(['email' => 'a@b.c'])` | Simulates Laravel's `old()` input — the repopulation source after a failed validation. |
| `$this->withErrors(['email' => ['Bad']])` | Seeds the session error bag that `InputMain::getError()` reads. |

The last two are the interesting ones. `withOld()` writes to the session's `_old_input` key **and binds the session to the current request**, so the `old()` helper inside a component resolves exactly as it would after a real validation redirect. `withErrors()` builds a real `ViewErrorBag` so `session('errors')->first($name)` returns the message.

### What a test looks like

```php
it('repopulates a select from old() input', function () {
    $this->withOld(['country' => 'es']);

    $html = $this->render(
        '<x-roro-select id="country" name="country"
            :options="[\'fr\' => \'France\', \'es\' => \'Spain\']" />'
    );

    expect($html)->toContain('class="roro-select-hidden"')
                 ->toContain('value="es"');
});
```

Tests assert against the **real rendered markup**. To verify what a component actually produces, read its view under `resources/views/components/tailwind/inputs/<name>.blade.php` — every assertion in the suite was written against a view that was read first, not guessed.

### Testing exceptions

Blade wraps any exception thrown during rendering in a `ViewException`. To assert the *raw* exception (e.g. the invalid-theme guard), **construct the component directly** instead of rendering:

```php
it('rejects an unknown theme', function () {
    $this->theme('bogus');
    new RoroForm\View\Components\Inputs\Text(name: 'x');
})->throws(InvalidArgumentException::class);
```

---

## How the JS suite works

The browser runtime is plain `<script>` files that attach classes to `window` and share globals between files (`RoroElement`, `Input`, `Selectable`, `RoroRepeatable`, the `roro` facade…). In the browser the Blade helpers concatenate them into one inline script. **The test loader reproduces exactly that**, into a jsdom document.

### The loader (`tests/js/helpers/roroEnv.js`)

```js
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());   // run once per file
```

`loadRoro()`:
1. binds jQuery as `window.$` on the jsdom window;
2. reads every runtime source file **in dependency order** (the same order as `build.mjs` / the inline injection);
3. concatenates them into a **single function scope** and runs it once.

The single-scope trick matters: because every file shares one scope, each `class X extends Y` can see the classes declared before it, and every `window.X = X` persists on the jsdom window afterwards — so after `loadRoro()` you have `window.RoroRepeatable`, `window.RoroSelect`, `window.roro`, `window.addSelect`, `window.listOfSelect`, etc., all wired together just like in a real page.

| Helper | What it does |
|--------|--------------|
| `loadRoro()` | Loads the runtime onto `window`. Call once in `beforeAll`. |
| `setBody(html)` | Replaces `document.body` **and** resets `window.listOfSelect` / `listOfRepeatable`, for a clean DOM per test. |
| `tick(ms = 5)` | Awaits the `0ms` timer in `RoroElement.registerElement`. Prefer awaiting an instance's `.ready` promise when one exists. |

### Two kinds of JS test

**Pure logic — no DOM.** The trickiest code (name reindexing, path building) is pure string/object math. Test it by calling a prototype method with a hand-made context, or a static helper directly:

```js
const ctx = { indexed: true, prefix: 'contacts', token: '' };
expect(window.RoroRepeatable.prototype.indexName.call(ctx, 'name', 0))
    .toBe('contacts[0][name]');

expect(window.RoroRepeatable.bracketize('tags[]')).toBe('[tags][]');
```

**DOM-backed — a real fixture.** Build markup that mirrors the Blade view, instantiate, and await `.ready`:

```js
it('serializes rows back to an array', async () => {
    setBody(`
      <div id="roro-wrapper-c" data-id="c" data-name="contacts"
           data-min="1" data-max="5" data-indexed="1"
           data-rows='[{"name":"Alice"},{"name":"Bob"}]'
           class="roro-wrapper roro-wrapper-repeatable">
        <div class="roro-repeatable-rows"></div>
        <button class="roro-repeatable-add"></button>
        <template class="roro-repeatable-template">
          <input class="roro-input" name="name" type="text">
        </template>
        <template class="roro-repeatable-row-template">
          <div class="roro-repeatable-row">
            <div class="roro-repeatable-row-content"></div>
            <button class="roro-repeatable-remove"></button>
          </div>
        </template>
      </div>
    `);

    const r = new window.RoroRepeatable('c');
    await r.ready;

    expect(r.getValue()).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
});
```

### Why these tests outlive the jQuery → vanilla rewrite

They assert the **behavioural contract** — *given this DOM / these inputs, the value or markup is X* — not jQuery call sequences. When the runtime is rewritten in vanilla JS, the implementation changes but the contract must not, so the same tests are the safety net for the migration. Write the rewrite against a green suite and you know nothing silently broke.

---

## Writing a new test

**A component (PHP):** add a case to the matching file in `tests/Feature/Components/`. Read the Blade view first, render with an explicit `id="..."` (so you can assert on it), and assert concrete attribute values.

**Runtime behaviour (JS):** add to the matching `tests/js/*.test.js`. For DOM behaviour, copy the relevant structure from the real Blade view into a `setBody(...)` fixture, instantiate, `await .ready`, then assert.

---

## Bugs the tests surfaced

Writing the suite surfaced several real bugs. **All functional bugs are now fixed**, and the tests assert the correct behaviour.

**Fixed:**

- ~~`roro.form(id).fill({ tags: ['a', 'b'] })` mis-filled array inputs~~ (joined to `"a,b"` on every `name="tags[]"` input). `fillForm()` now assigns one array element per input. — `facade.js` · `facade-form.test.js`.
- ~~Multi-select search never filtered~~ (`MultiSelect.filterOptions` matched the empty `.caret-zone` template node, so every option matched). Now scoped to the text input. — `Selectable.js` · `selectable.test.js`.
- ~~Date/number/range inputs emitted empty `min="" max=""`~~. `NumericMain` now defaults `min`/`max`/`step` to `null` and every blade guards with `@if(!is_null())`, so they render only when provided. — `NumericDateInputsTest.php`.
- ~~`border-error` `data-show` was asymmetric (`""` vs `"1"`)~~. Now symmetric `"0"`/`"1"`. — `CrossCuttingTest.php`.

**By design / environment (not bugs, documented so the assertions read clearly):**

- The error container is always present in the DOM; visibility is toggled by JS via `data-show` (not `display:none`).
- Tailwind `disabled:`/utility variants live in the class string, so the substring `disabled` is always present — tests use a regex to match the bare HTML attribute, not the class.
- `RoroHandle.isVisible()` can't be asserted in jsdom (no layout → `offsetWidth/Height` are `0`); correct at runtime.
- `select` / `multi-select` labels link via `data-id`, not `for=` (the control is a composite, not a single element).

---

## Config defaults

`RoroFormServiceProvider::register()` now calls `mergeConfigFrom()`, so the packaged defaults (`theme => tailwind`, `defaultJsValidation => true`) are always present — **publishing the config is optional**. Before this fix, `config('roroform.theme')` was `null` until the config was published and `ComponentMain` threw *"Invalid theme"*. The behaviour is pinned in `ConfigMergeTest.php`. The test base still sets the config explicitly in `TestCase::getEnvironmentSetUp()` so individual tests can swap the theme.

---

## CI

A minimal GitHub Actions matrix would run both suites:

```yaml
# .github/workflows/tests.yml  (suggested)
- run: composer install --no-interaction
- run: vendor/bin/pest
- run: npm ci
- run: npm test
```
