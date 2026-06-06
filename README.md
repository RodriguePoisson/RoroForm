<h1 align="center">RoroForm</h1>

<p align="center">
  <strong>Build full Laravel forms out of Blade components — and drive every field from JavaScript like it's 2026.</strong>
</p>

<p align="center">
  25+ input components · searchable selects · repeatable groups that actually work · a chainable, type-aware JS API · fully responsive &amp; accessible · Tailwind, Bootstrap &amp; framework-free themes — wired into Laravel's <code>old()</code>, validation errors and CSRF out of the box.
</p>

<p align="center">
  <a href="https://github.com/RodriguePoisson/RoroForm/actions/workflows/tests.yml"><img src="https://github.com/RodriguePoisson/RoroForm/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
  <img src="https://img.shields.io/badge/tests-870%20passing-3fb950" alt="870 tests passing">
  <img src="https://img.shields.io/badge/JS-zero%20dependencies-f7df1e?logo=javascript&logoColor=black" alt="Zero JS dependencies">
  <img src="https://img.shields.io/badge/PHP-%5E8.0-777BB4?logo=php&logoColor=white" alt="PHP ^8.0">
  <img src="https://img.shields.io/badge/Laravel-9%20%E2%86%92%2013-FF2D20?logo=laravel&logoColor=white" alt="Laravel 9 to 13">
  <img src="https://img.shields.io/badge/themes-Tailwind%20%7C%20Bootstrap%20%7C%20none-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind | Bootstrap | none">
  <img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="Apache-2.0">
</p>

---

## Why RoroForm?

Most Laravel form helpers stop at rendering an `<input>`. RoroForm goes the whole way — from the Blade tag to the runtime behaviour in the browser.

- **🧩 One tag per field, zero boilerplate.** `<x-roro-text>`, `<x-roro-select>`, `<x-roro-file>`… 25+ components that render label, input, validation border, error message and required marker — consistently, in your theme.
- **🔁 Repeatable groups that *just work*.** Nest **anything** (including searchable selects, multi-selects and file inputs), add/remove/reorder rows, and submit a clean `contacts[0][name]` array. Old input is restored after a failed validation with **zero extra wiring**. This is the feature other packages don't ship.
- **🎛️ A real JavaScript API.** A chainable, **type-aware** facade: `roro('email').value('a@b.c').required().focus()`. The *same* `.value()` call reads/writes a text input, a select, a multi-select array, a checkbox boolean, a radio group or a list of file names. Most form packages ship **no** runtime API at all.
- **🪶 Zero dependencies.** The runtime is **vanilla JavaScript** — no jQuery, no framework, nothing to load on the page. Drop it into any stack (Livewire, Alpine, Inertia, Vue, React or plain Blade) without conflicts.
- **🔎 Smart selects, server-rendered.** Searchable single & multi-selects with tags, option groups, and dynamic options — added client-side instantly or fetched from *your* JSON endpoint. Options render server-side, so there's no flash and no mandatory round-trip.
- **🪄 Laravel-native by default.** Auto-repopulation from `old()`, per-field error messages pulled straight from `session('errors')`, CSRF, AJAX submit with server-side validation errors mapped back onto the right fields.
- **🎨 Three themes — including no framework at all.** Ships **Tailwind**, **Bootstrap**, and a **framework-free `raw`** theme that brings its own stylesheet, so you get a clean modern look with **zero CSS framework** on the page. Switch with one config line; publish the views or the CSS to own them.
- **♿ Accessible out of the box.** Every theme ships real labels, `aria-describedby` error wiring, `aria-invalid` / `aria-required`, fieldset/legend radio groups, and a full **ARIA combobox** for the custom selects — keyboard-navigable (↑↓, Enter, Escape, Home/End, search box) and screen-reader friendly. Most packages' custom selects are mouse-only.
- **📱 Responsive & touch-friendly — the *same* UI on every device.** Components flow from desktop to mobile out of the box: full-width controls, dropdowns and search bars that fit small screens, tags and radio groups that wrap, and comfortable tap targets. There's **one custom UI everywhere** — no device-specific `<select>` fallback to second-guess, so what you test is what every visitor gets.
- **📦 No build step for you.** The vanilla-JS runtime is injected inline the first time a form renders. No npm, no Vite config, no bundler in *your* app.

---

## Quick start

> **Requirements:** PHP `^8.0` · Laravel `9 → 13` · Tailwind **or** Bootstrap CSS present (depending on the theme you pick). **No JavaScript dependencies** — the runtime is vanilla JS.

**1. Install**

```bash
composer require roro/roroform
```

**2. Publish the config** (optional but recommended)

```bash
php artisan vendor:publish --tag=roro-config
```

This creates `config/roroform.php`:

```php
return [
    // 'tailwind' (default) | 'bootstrap' | 'raw'
    'theme' => 'tailwind',

    // Add the HTML `required` attribute on required fields by default.
    'defaultJsValidation' => true,
];
```

**3. Drop a form** in any Blade view — no scripts to add:

```blade
<x-roro-form action="/subscribe" :multipart="true" id="signup">
    <x-roro-text  name="name"  label="Full name" :required="true"/>
    <x-roro-email name="email" label="Email"     :required="true"/>
    <x-roro-select name="country" label="Country"
                   :options="['fr' => 'France', 'es' => 'Spain']"/>

    <x-roro-button :ajax="true" form-id="signup">Send</x-roro-button>
</x-roro-form>
```

That's it. Label, validation, error display, CSRF and the AJAX submit are all handled — and the assets are injected automatically. No `<script src>`, no `@vite`, nothing else to add.

---

## A real form in 30 seconds

A taste of the breadth — every field below is a single tag:

```blade
<x-roro-form id="demo" :multipart="true">
    {{-- Text-like inputs --}}
    <x-roro-text     name="first_name" label="First name" :required="true"/>
    <x-roro-email    name="email"      label="Email"      :required="true"/>
    <x-roro-password name="password"   label="Password"/>
    <x-roro-url      name="website"    label="Website"/>
    <x-roro-tel      name="phone"      label="Phone"/>

    {{-- Dates, numbers, ranges, colors --}}
    <x-roro-date     name="dob"          label="Date of birth"/>
    <x-roro-number   name="age"          label="Age"/>
    <x-roro-range    name="satisfaction" label="Satisfaction" step="5"/>
    <x-roro-color    name="color"        label="Favourite colour"/>

    {{-- Choices --}}
    <x-roro-checkbox name="newsletter" label="Subscribe" position="right"/>

    <x-roro-radio-container name="plan" label="Plan">
        <x-roro-radio name="plan" value="free" label="Free"/>
        <x-roro-radio name="plan" value="pro"  label="Pro"/>
    </x-roro-radio-container>

    {{-- Searchable selects --}}
    <x-roro-select       name="country"   label="Country"
                         :options="['Europe' => ['fr' => 'France', 'es' => 'Spain']]"/>
    <x-roro-multi-select name="tags[]"    label="Tags" :values="['a']"
                         :options="['a' => 'Alpha', 'b' => 'Beta']"/>

    {{-- File upload --}}
    <x-roro-file name="docs[]" :multiple="true" label="Documents"
                 requirements-text="Accepted: jpg, pdf"/>

    {{-- Repeatable group → submits as contacts[0][name], contacts[1][name], … --}}
    <x-roro-repeatable name="contacts" label="Contacts" item-label="Contact"
                       :min="1" :max="5" :reorder="true">
        <x-roro-text   name="name"  label="Name" :required="true"/>
        <x-roro-email  name="email" label="Email"/>
        <x-roro-select name="type"  label="Type"
                       :options="['mobile' => 'Mobile', 'home' => 'Home']"/>
    </x-roro-repeatable>

    <x-roro-button :ajax="true" form-id="demo">Submit</x-roro-button>
</x-roro-form>
```

```js
// Drive it from JavaScript — the same API, whatever the field type.
roro.form('demo')
    .fill({ first_name: 'Ada', country: 'fr', tags: ['a', 'b'] })
    .onSuccess(res => console.log('Saved!', res));

roro('contacts').addRow({ name: 'Grace', type: 'home' });
```

---

## 📚 Documentation

Everything below is collapsed to keep this page scannable. Open the part you need.

<details>
<summary><strong>🧱 The component catalog — every input type</strong></summary>

<br>

Every component renders a full field: wrapper, optional label, the control, a validation border and an error slot — all themed. Names map onto Laravel's request payload exactly as you'd expect, including nested array names like `user[26][name]`.

| Component | Renders | Notable props |
|-----------|---------|---------------|
| `<x-roro-text>` | `<input type=text>` | `value` `placeholder` `required` `disabled` `readonly` |
| `<x-roro-email>` `<x-roro-password>` `<x-roro-url>` `<x-roro-tel>` | typed text inputs | same as text |
| `<x-roro-number>` | `<input type=number>` | `min` `max` `step` |
| `<x-roro-hidden>` | `<input type=hidden>` | `value` |
| `<x-roro-date>` `<x-roro-time>` `<x-roro-datetime-local>` `<x-roro-week>` `<x-roro-month>` | native date/time pickers | `value` |
| `<x-roro-range>` | slider | `min` `max` `step` `list` |
| `<x-roro-color>` | colour picker | `hide-text-input` |
| `<x-roro-checkbox>` | checkbox | `label` `position` (`left`/`right`) |
| `<x-roro-radio-container>` + `<x-roro-radio>` | a radio group | `subtitle`; radios wrap responsively |
| `<x-roro-select>` | searchable single select | `:options` `value` |
| `<x-roro-multi-select>` | searchable multi-select with tags | `:options` `:values` (name ends with `[]`) |
| `<x-roro-file>` | styled file input | `:multiple` `requirements-text` |
| `<x-roro-repeatable>` | repeatable group of any of the above | see its section below |
| `<x-roro-button>` | submit button | `:ajax` `form-id` `:ajax-errors` |
| `<x-roro-form>` | the `<form>` + asset injection + overlay | `action` `method` `:multipart` `enctype` `:overlay` |

**Shared field props** (from `InputMain`): `id` · `name` · `label` · `value` · `placeholder` · `:required` · `:disabled` · `:readonly` · `:hidden` · `class` · `wrapperClass` · `labelClass` · `tooltip` · `:enableError` · `:hasTopMargins` · `:populate` · `:disableJsValidation`.

</details>

<details>
<summary><strong>🧾 Every attribute, every component — the full reference</strong></summary>

<br>

**Conventions.** Write string attributes plainly (`label="Email"`); add a **`:` prefix** to bind booleans, numbers, arrays and PHP expressions (`:required="true"`, `:options="[...]"`). camelCase props are written in **kebab-case** in Blade — `wrapperClass` → `wrapper-class`, `hasTopMargins` → `:has-top-margins`, `requirementsText` → `requirements-text`. Any attribute *not* listed below lands on the underlying element as a plain HTML attribute (see *Arbitrary HTML attributes pass-through*).

#### Shared — every field input (from `InputMain`)

Applies to **all** field components below (text, number, date, select, file, checkbox, radio, repeatable…) unless noted.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | `string` | auto (`uniqid()`) | Element id; auto-generated when omitted. |
| `name` | `string` | `''` | Field name — maps onto the request payload (supports nested `user[26][name]`). |
| `label` | `string` | `null` | Label text rendered above/beside the control. |
| `value` | `string` | `''` | Initial value (overridden by `old()` after a failed validation). |
| `placeholder` | `string` | `''` | Placeholder text. |
| `:required` | `bool` | `false` | Adds `required` + `aria-required`. |
| `:disabled` | `bool` | `false` | Disables the control. |
| `:readonly` | `bool` | `false` | Marks the control read-only. |
| `:hidden` | `bool` | `false` | Renders the field's wrapper hidden (`display:none`). |
| `class` | `string` | `''` | Extra classes on the **control** (merged with the `roro-*` classes). |
| `wrapper-class` | `string` | `''` | Extra classes on the field **wrapper**. |
| `label-class` | `string` | `''` | Extra classes on the **label**. |
| `tooltip` | `string` | `null` | Tooltip text shown next to the label. |
| `:enable-error` | `bool` | `true` | Render the inline error slot for this field. |
| `:has-top-margins` | `bool` | `true` | Apply the default top margin to the field. |
| `:populate` | `array` | `[]` | Candidate values for repopulation (first truthy wins; `old()` takes precedence). |
| `:disable-js-validation` | `bool` | config | Drop the HTML validation attributes for this field. Defaults to the inverse of `defaultJsValidation`. |

#### Text-like — `<x-roro-text>` `<x-roro-email>` `<x-roro-password>` `<x-roro-url>` `<x-roro-tel>` `<x-roro-hidden>`

No extra attributes — **shared only**. They differ purely by their HTML `type` (`text`/`email`/`password`/`url`/`tel`/`hidden`).

#### Numeric & date/time — `<x-roro-number>` `<x-roro-range>` `<x-roro-date>` `<x-roro-time>` `<x-roro-datetime-local>` `<x-roro-week>` `<x-roro-month>` (from `NumericMain`)

Shared **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `min` | `string` | `null` | Minimum value (a number, or a date/time bound for the date inputs). |
| `max` | `string` | `null` | Maximum value. |
| `step` | `string` | `null` | Step increment. |
| `list` | `string` | `null` | Id of a `<datalist>` to attach (handy on `range`). |

#### Color — `<x-roro-color>`

Shared **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `:hide-text-input` | `bool` | `false` | Hide the hex text field, leaving just the colour swatch. |

#### Checkbox — `<x-roro-checkbox>` (from `CheckableMain`)

Shared (with `value` defaulting to `'1'`) **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `:checked` | `bool` | `false` | Whether the box is checked (auto-set to `true` when a non-empty value is repopulated). |

#### Radio group — `<x-roro-radio-container>` + `<x-roro-radio>`

`<x-roro-radio-container>` wraps the group in a `<fieldset>`/`<legend>`; each `<x-roro-radio>` is one option (it's a `CheckableMain`, so its `value` is the option value and `:checked` flags the default).

**`<x-roro-radio-container>`** — shared **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `subtitle` | `string` | `null` | Helper text shown under the group legend. |
| `subtitle-class` | `string` | `''` | Extra classes on the subtitle. |
| `fieldset-class` | `string` | `''` | Extra classes on the `<fieldset>`. |

**`<x-roro-radio>`** — shared (with `value` = the option value) **plus** `:checked` (`bool`, `false`).

#### Selects — `<x-roro-select>` `<x-roro-multi-select>` (from `SelectableMain`)

Shared **plus** (for the multi-select, end the `name` with `[]`):

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `:options` | `array` | `[]` | Options — flat `['fr' => 'France']` or grouped `['Europe' => ['fr' => 'France']]`. |
| `:values` | `array` | `[]` | Pre-selected values (multi-select; single-select uses `value`). |
| `:search-bar` | `bool` | `true` | Show the in-dropdown search field. |
| `:clear-button` | `bool` | `true` | Show the clear (✕) button. |
| `:options-open` | `bool` | `false` | Render with the dropdown initially open. |

#### File — `<x-roro-file>`

Shared **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `:multiple` | `bool` | `true` | Allow selecting multiple files (end the `name` with `[]`). |
| `accept` | `string` | `''` | The native `accept` filter (e.g. `image/*,.pdf`). |
| `max-size` | `string` | `''` | Max size hint shown to the user. |
| `requirements-text` | `string` | `''` | Free-text requirements line under the control. |

#### Repeatable — `<x-roro-repeatable>`

Forwards the shared field props (except `value`/`placeholder` — a repeatable holds rows, not one value) **plus**:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `string` | `''` | Array prefix the rows submit under (e.g. `contacts`). |
| `:rows` | `array` | `[]` | Initial dataset: an array of rows (maps, or scalars in token mode). |
| `:min` | `int` | `1` | Minimum number of rows (can't remove below it). |
| `:max` | `int` | `null` | Maximum number of rows (`null` = unlimited). |
| `:reorder` | `bool\|string` | `false` | `false`, `true`/`'buttons'` (▲▼), `'drag'` (handle), or `'both'`. |
| `item-label` | `string` | `null` | Per-row heading prefix, numbered automatically (`Contact 1`…). |
| `key-field` | `string` | `null` | Inner field whose value uniquely identifies a row (e.g. `id`) — target rows by stable key. |
| `add-label` | `string` | `'+ Add'` | Text/markup of the add button. |
| `remove-label` | `string` | `null` | Text/markup of the per-row remove button (theme default when `null`). |
| `index-token` | `string` | `''` | If set (e.g. `#`), replaces the token in inner names instead of auto-prefixing. |
| `:indexed` | `bool` | `true` | Set to `false` to leave inner names **verbatim** (no `prefix[i]`/token). |
| `row-class` | `string` | `''` | Extra classes applied to every row. |

#### Button — `<x-roro-button>`

A standalone `ComponentMain` (not an `InputMain`):

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `string` | `'submit'` | The button `type` (`submit`/`button`/`reset`). |
| `id` | `string` | auto | Element id. |
| `class` | `string` | `''` | Extra classes on the button. |
| `form-id` | `string` | `null` | The form this button submits (required for AJAX submit). |
| `button-color` | `string` | `'bg-blue-600'` | Base colour class. |
| `button-hover-color` | `string` | `'bg-blue-700'` | Hover colour class. |
| `button-text-color` | `string` | `'text-white'` | Text colour class. |
| `:disabled` | `bool` | `false` | Disable the button. |
| `:has-top-margins` | `bool` | `true` | Apply the default top margin. |
| `:ajax` | `bool` | `false` | Submit the form over AJAX (FormData, overlay, events). |
| `:enable-ajax-errors` | `bool` | `true` | Map a `422` response's `errors` back onto the matching fields. |

#### Form — `<x-roro-form>`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | `string` | `''` | Form action URL. |
| `method` | `string` | `'POST'` | HTTP method (set on the `<form>`); `@csrf` is injected for `POST`/`PUT`/`PATCH`/`DELETE`. |
| `id` | `string` | auto | Form id (used by `roro.form(id)` and the button's `form-id`). |
| `class` | `string` | `''` | Extra classes on the `<form>`. |
| `:multipart` | `bool` | `false` | Shortcut for `enctype="multipart/form-data"` (for file uploads). |
| `enctype` | `string` | `null` | Explicit enctype — takes precedence over `:multipart`. |
| `:overlay` | `bool` | `true` | Render the loading overlay used during AJAX submits. |

</details>

<details>
<summary><strong>🔎 Smart selects — searchable, grouped, dynamic</strong></summary>

<br>

Options are rendered **server-side**, then read and enhanced by JS. No flash of an empty dropdown, no mandatory network round-trip — and the basic value is present even before JS runs.

```blade
{{-- flat options --}}
<x-roro-select name="country" :options="['fr' => 'France', 'es' => 'Spain']" value="fr"/>

{{-- grouped options --}}
<x-roro-select name="city" label="City"
    :options="['Europe' => ['par' => 'Paris', 'mad' => 'Madrid'],
               'Asia'   => ['tok' => 'Tokyo']]"/>

{{-- multi-select with pre-selected tags (note the [] in the name) --}}
<x-roro-multi-select name="tags[]" :values="['a', 'b']"
    :options="['a' => 'Alpha', 'b' => 'Beta', 'c' => 'Gamma']"/>
```

**Add options after load** — instantly, or from your own endpoint:

```js
// One option, client-side, no request. Optional 4th arg = category.
roro('country').addOption('Germany', 'de', 'Europe');

// A batch:
roro('country').addOptions([{ label: 'Italy', value: 'it', category: 'Europe' }]);

// Or fetch from YOUR JSON endpoint:
//   GET /api/countries?q=ge  ->  [{ "label": "Germany", "value": "de", "category": "Europe" }, ...]
roro('country').addOptionsAjax('/api/countries', { q: 'ge' });   // returns a Promise

roro('country').setOptions([...]);  // replace every option
roro('country').removeOption('fr');
roro('country').options();          // -> [{ label, value, category }, ...]
roro('country').open();  roro('country').close();
```

Selects emit a real **`roro:change`** event — fired only on actual user/programmatic changes, never on initial population:

```js
roro('country').change(value => console.log('picked', value));
```

> The legacy globals (`roroAddOption`, `roroAddOptionsAjax`, `roroDisableSelect`, …) still work unchanged — the `roro()` facade is purely additive on top of them.

</details>

<details>
<summary><strong>⭐ Repeatable groups — the headline feature</strong></summary>

<br>

`<x-roro-repeatable>` repeats **whatever you nest inside it** — one field or many, of any type, including searchable selects, multi-selects and file inputs. Users add, remove and (optionally) reorder rows; everything submits as a clean array.

```blade
<x-roro-repeatable name="contacts" label="Contacts" :min="1" :max="5">
    <x-roro-text   name="name"  label="Name" :required="true"/>
    <x-roro-email  name="email" label="Email"/>
    <x-roro-select name="type"  :options="['mobile' => 'Mobile', 'home' => 'Home']" label="Type"/>
</x-roro-repeatable>
```

Inner field names are **relative to the row** (`name`, `email`, `type`) — the component prefixes them automatically, so the form posts:

```php
$request->input('contacts');
// [
//   ['name' => 'Alice', 'email' => 'alice@x.com', 'type' => 'mobile'],
//   ['name' => 'Bob',   'email' => 'bob@x.com',   'type' => 'home'],
// ]
```

#### Prefilling (edit forms) & validation

Pass an array of rows via `:rows`. After a failed validation, the re-submitted `old()` input is restored automatically — **no extra wiring**:

```blade
<x-roro-repeatable name="contacts" :rows="$user->contacts->toArray()">
    <x-roro-text   name="name" label="Name" :required="true"/>
    <x-roro-select name="type" :options="$types"/>
</x-roro-repeatable>
```

`required` (and any HTML constraint) on inner fields is enforced per row; the hidden blueprint is inert, so it never blocks submission.

#### Flat lists of scalars

For a plain list (`tags[]`), use the `index-token` (default `#`) where the index should go:

```blade
<x-roro-repeatable name="tags" index-token="#" :rows="['red', 'green']">
    <x-roro-text name="tags[#]" placeholder="Tag"/>
</x-roro-repeatable>
{{-- posts: tags => ['red', 'green'] --}}
```

Or turn indexing off entirely with `:indexed="false"` and keep your own names
(`<x-roro-text name="tags[]"/>` → posts the same flat `tags` array).

#### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `name` | — | Array prefix the rows submit under (e.g. `contacts`). |
| `:rows` | `[]` | Initial dataset: an array of rows (objects, or scalars in token mode). |
| `:min` | `1` | Minimum number of rows (can't remove below it). |
| `:max` | `null` | Maximum number of rows (`null` = unlimited; *Add* disables at the cap). |
| `:reorder` | `false` | Show up/down buttons to reorder rows. |
| `item-label` | `null` | Per-row heading prefix, numbered automatically (`Contact 1`, `Contact 2`…). |
| `key-field` | `null` | Inner field whose value uniquely identifies a row (e.g. `id`) — lets JS target a row by a **stable key** instead of position. |
| `add-label` | `+ Add` | Text/markup of the add button. |
| `remove-label` | `✕` | Text/markup of the per-row remove button. |
| `index-token` | `''` | If set (e.g. `#`), replaces the token in inner names instead of auto-prefixing — use for flat lists or full control. |
| `:indexed` | `true` | Set to `false` to leave inner names **verbatim** (no `prefix[i]`/token) — you control the naming. |
| `row-class` | `''` | Extra classes applied to every row. |

Selects, multi-selects and file inputs added in new rows are wired up **exactly** like on page load (regenerated ids, registered instances) — nothing extra to call.

</details>

<details>
<summary><strong>🎛️ The <code>roro()</code> facade — one chainable, type-aware API</strong></summary>

<br>

A small, **dependency-free** facade so you can drive any field without caring about its underlying markup. Everything is **chainable** and **type-aware** — the same call works on a text input, a select, a checkbox or a file field.

```js
roro('email')                  // -> handle, auto-detecting the field type
    .value('john@example.com') // set (chainable); roro('email').value() to read
    .required()                // toggle the HTML required flag
    .focus();

roro('age').disable();                 // works on every input type
roro('age').error('Too young');  roro('age').clearError();
roro('newsletter').value(true);        // checkbox  -> boolean
roro('satisfaction').value(80);        // range
roro('file-upload').value();           // file      -> ['a.png', ...]
```

`value()` is universal: text for inputs, the selected option for a `select`, an **array** for a multi-select, the checked state for a checkbox, the checked value for a radio group, file names for a file input.

| Group | Methods |
|-------|---------|
| Value | `value(v?)` · `val(v?)` · `clear()` · `reset()` |
| State | `disable(b=true)` · `enable()` · `readonly(b=true)` · `editable()` · `required(b=true)` · `optional()` · `isDisabled()` · `isReadonly()` · `isRequired()` |
| Display | `show()` · `hide()` · `toggle(b?)` · `isVisible()` · `label(t?)` · `placeholder(t?)` |
| Error | `error(msg)` · `clearError()` |
| Events | `on(ev, fn)` · `off(ev, fn)` · `trigger(ev)` · `change(fn)` · `input(fn)` · `click(fn)` · `focus()` · `blur()` |
| Misc | `type()` · `name()` · `exists()` · `$el()` · `$control()` · `$wrapper()` · `attr()` · `prop()` · `addClass()` / `removeClass()` / `toggleClass()` |

**Select-only methods** (no-op elsewhere): `addOption` · `addOptions` · `addOptionsAjax` · `setOptions` · `removeOption` · `clearOptions` · `options` · `open` · `close`.

#### Repeatables from JS

```js
roro('contacts').addRow();                                  // append empty row
roro('contacts').addRow({ name: 'Ada', type: 'home' });     // append prefilled row
roro('contacts').removeRow(0);                              // remove first row
roro('contacts').rowsCount();                               // -> 2
roro('contacts').value();                                   // -> [{name, email, type}, ...]
roro('contacts').value([{ name: 'Ada' }, { name: 'Bob' }]); // replace every row
roro('contacts').change(rows => console.log('changed', rows));
```

Need one **specific row**? Prefer a **stable key** over a position — add `key-field="id"` to the component (with an `id` field, often hidden, per row):

```js
const row = roro('contacts').row(12);    // the row whose id is 12 — stable across reorder/remove
row.field('email').value('a@b.c');       // drive one field of that row
row.field('type').disable();             // works on nested selects too
row.lockRemoval();                       // disable its remove button (front-end lock)
row.disable();                           // disable every field in the row
row.value({ name: 'Ada', type: 'home' }); // set the whole row; row.value() to read it
row.moveUp();  row.moveDown();  row.remove();  row.key();  row.index();

roro('contacts').rowAt(0);                            // by position, explicitly
roro('contacts').rowWhere(r => r.email === 'a@b.c');  // by predicate (row data)
roro('contacts').rowHandles();                        // every row as a handle
```

</details>

<details>
<summary><strong>📨 The <code>roro.form()</code> facade — drive the whole form</strong></summary>

<br>

```js
const form = roro.form('signup');

form.data();                       // -> plain object of every field value
form.fill({ name: 'Ada', country: 'fr', tags: ['a', 'b'] }); // prefill (edit flows)
form.onSuccess(res => console.log('saved', res))
    .onError(xhr  => console.log('failed', xhr));
form.validate();                   // native reportValidity()
form.errors({ email: ['Already taken'] });  // show server-side errors
form.clearErrors();
form.submit();                     // honours the AJAX <x-roro-button> if present
form.disable();  form.enable();    // every field at once
form.reset();    form.overlay(true);
form.field('email').focus();       // resolve a field by name **or** id
```

`fill()` matches keys against field **names** first (so it maps straight onto your server payload / `old()` data) and falls back to element **ids**. It even understands repeatable groups and custom selects, not just native inputs.

</details>

<details>
<summary><strong>📋 Complete helper reference</strong></summary>

<br>

Every flat `roro*(id, …)` global is a one-liner shortcut for the matching `roro(id).method(…)` call — use whichever reads better. `id` is the component's `id` (or, for forms, the form id). Below is the **full** list.

#### Entry points & introspection

| Helper | What it returns / does | Example |
|--------|------------------------|---------|
| `roro(target)` | A type-aware handle (field or form); `target` is an id or a DOM element | `roro('email').focus()` |
| `roro.field(id)` | A field handle (explicit) | `roro.field('email')` |
| `roro.form(id)` | A form handle | `roro.form('signup')` |
| `roro.select(id)` | The underlying `RoroSelect`/`RoroMultiSelect` instance | `roro.select('country')` |
| `roro.repeatable(id)` | The underlying `RoroRepeatable` instance | `roro.repeatable('contacts')` |
| `roro.exists(target)` | `true` if the field/form is in the DOM | `if (roro.exists('email')) …` |
| `roro.all(root?)` | Handles for every field under `root` (default: document) | `roro.all().forEach(h => h.clear())` |
| `roro.ready(fn)` | Run `fn` on DOM ready | `roro.ready(() => …)` |
| `roro.version` | The runtime version string | `roro.version // '2.0.0'` |
| `roroGetSelect(id)` | Same as `roro.select(id)` | `roroGetSelect('country')` |
| `roroGetRepeatable(id)` | Same as `roro.repeatable(id)` | `roroGetRepeatable('contacts')` |

#### Field value & state

| Helper | Does | Example |
|--------|------|---------|
| `roroValue(id, v?)` | Get (omit `v`) or set the value — type-aware | `roroValue('email', 'a@b.c')` · `roroValue('email')` |
| `roroClear(id)` | Clear / reset the field | `roroClear('email')` |
| `roroDisable(id, b=true)` | Disable (or enable with `false`) | `roroDisable('age')` |
| `roroEnable(id)` | Enable | `roroEnable('age')` |
| `roroReadonly(id, b=true)` | Toggle readonly | `roroReadonly('age')` |
| `roroRequired(id, b=true)` | Toggle the HTML `required` flag | `roroRequired('email')` |
| `roroShow(id)` / `roroHide(id)` | Show / hide the whole field (wrapper) | `roroHide('coupon')` |
| `roroToggleVisibility(id, b?)` | Toggle visibility | `roroToggleVisibility('coupon', true)` |
| `roroFocus(id)` | Focus the control | `roroFocus('email')` |
| `roroLabel(id, text?)` | Get or set the label text | `roroLabel('email', 'E-mail')` |
| `roroField(id)` | Get the field handle | `roroField('email').value()` |

#### Errors

| Helper | Does | Example |
|--------|------|---------|
| `roroClearError(id)` | Hide the field's error | `roroClearError('email')` |
| `roroShowError(id, msg, show=true)` | Show (or hide) an inline error + set `aria-invalid` | `roroShowError('email', 'Already taken')` |

#### Events

| Helper | Does | Example |
|--------|------|---------|
| `roroOnChange(id, fn)` | Run `fn(value, event)` when the field changes | `roroOnChange('country', v => …)` |
| `roroTrigger(id, event='change')` | Dispatch an event on the control | `roroTrigger('email', 'input')` |
| `roroTriggerChangeAll()` | Fire `change` on every field | `roroTriggerChangeAll()` |

#### Selects

| Helper | Does | Example |
|--------|------|---------|
| `roroAddOption(id, label, value, category?)` | Add one option (client-side) | `roroAddOption('c', 'France', 'fr', 'EU')` |
| `roroAddOptions(id, list)` | Add a batch `[{label,value,category?}]` | `roroAddOptions('c', [{label:'Spain',value:'es'}])` |
| `roroAddOptionsAjax(id, url, params?)` | Fetch options from your JSON endpoint → Promise | `roroAddOptionsAjax('c', '/api/countries', {q:'fr'})` |
| `roroSetOptions(id, list)` | Replace **all** options | `roroSetOptions('c', list)` |
| `roroRemoveOption(id, value)` | Remove one option | `roroRemoveOption('c', 'fr')` |
| `roroClearOptions(id)` | Remove every option | `roroClearOptions('c')` |
| `roroOptions(id)` | Read options `[{label,value,category}]` | `roroOptions('c')` |
| `roroDisableSelect(id, b=true)` | Disable a custom select | `roroDisableSelect('c')` |
| `roroReadonlySelect(id, b=true)` | Make a custom select readonly | `roroReadonlySelect('c')` |
| `roroShowDropDown(id, show=true)` | Open / close the dropdown | `roroShowDropDown('c', true)` |

#### Repeatables

| Helper | Does | Example |
|--------|------|---------|
| `roroAddRow(id, data?)` | Append a row (optionally prefilled) | `roroAddRow('contacts', {name:'Ada'})` |
| `roroRemoveRow(id, index)` | Remove the row at a position | `roroRemoveRow('contacts', 0)` |
| `roroClearRows(id)` | Remove every row | `roroClearRows('contacts')` |
| `roroRows(id)` | Read all rows as data | `roroRows('contacts')` |
| `roroRowsCount(id)` | Number of rows | `roroRowsCount('contacts')` |
| `roroRow(id, target)` | A single-row handle (by key or position) | `roroRow('contacts', 12)` |
| `roroRowField(id, target, name)` | A field handle inside one row | `roroRowField('contacts', 12, 'email')` |
| `roroLockRow(id, target, b=true)` | Lock/unlock a row's remove button | `roroLockRow('contacts', 12)` |

Row handles (`roroRow(...)` / `roro('contacts').row(...)`) expose: `field(name)` · `fields()` · `value(data?)` · `key()` · `index()` · `remove()` · `lockRemoval(b?)` · `allowRemoval()` · `isRemovable()` · `disable(b?)` · `enable()` · `moveUp()` · `moveDown()`.

#### Forms

| Helper | Does | Example |
|--------|------|---------|
| `roroFormData(formId)` | Serialize the form to a plain object | `roroFormData('signup')` |
| `roroFillForm(formId, data)` | Prefill fields (by name, then id) | `roroFillForm('signup', user)` |
| `roroSubmit(formId)` | Submit (honours the AJAX button) | `roroSubmit('signup')` |
| `roroResetForm(formId)` | Native reset + clear custom selects | `roroResetForm('signup')` |
| `roroClearForm(formId)` | Clear every field | `roroClearForm('signup')` |
| `roroValidateForm(formId)` | `reportValidity()` → bool | `roroValidateForm('signup')` |
| `roroFormErrors(formId, errors)` | Show server-side errors `{field:[msg]}` | `roroFormErrors('signup', {email:['Taken']})` |
| `roroClearFormErrors(formId)` | Clear all form errors | `roroClearFormErrors('signup')` |
| `roroOnSuccess(formId, fn)` | AJAX success → `fn(response, event)` | `roroOnSuccess('signup', r => …)` |
| `roroOnError(formId, fn)` | AJAX error → `fn(xhr, event)` | `roroOnError('signup', x => …)` |

#### Overlay & low-level

| Helper | Does |
|--------|------|
| `roroShowOverlay(show=true)` | Show/hide the form's loading overlay |
| `roroSubmitButton(buttonId, formId)` | Programmatically run a submit button's flow |
| `roroRegisterButtonOnClick(buttonId)` | Wire a `.roro-btn-submit` (done automatically on load) |
| `roroGetWrapper(id)` | The field's wrapper element |
| `populateFormErrors(form, errors)` · `clearFormErrors(form)` | The error helpers `roroFormErrors`/`roroClearFormErrors` wrap |
| `addSelect(el)` · `addMultiSelect(el)` · `addRepeatable(el)` | Register a freshly-inserted component (done automatically) |

> All of the above are plain `window.*` globals — no import, no namespace. The chainable equivalents live on `roro(id)` (see the previous two sections).

</details>

<details>
<summary><strong>🪄 Laravel-native validation, <code>old()</code> &amp; AJAX</strong></summary>

<br>

RoroForm is wired into the framework, so the usual controller flow needs no front-end glue:

- **Repopulation.** Every field reads `old()` automatically after a failed validation — including nested array names and repeatable rows.
- **Error display.** Each field pulls its first message from `session('errors')` and shows it inline, with a red border on the control.
- **CSRF.** `<x-roro-form>` injects `@csrf` for `POST`/`PUT`/`PATCH`/`DELETE`.
- **AJAX submit.** `<x-roro-button :ajax="true">` posts via `FormData` (file uploads included), shows a loading overlay, and fires events:

```js
// Native events — the payload is on event.detail:
const form = document.getElementById('signup');
form.addEventListener('roro:ajax:success', e => { const response = e.detail; /* ... */ });
form.addEventListener('roro:ajax:error',   e => { const xhr      = e.detail; /* ... */ });

// …or the facade shortcut (payload first):
roro.form('signup')
    .onSuccess(response => { /* ... */ })
    .onError(xhr => { /* ... */ });
```

Add `:ajax-errors="true"` to the button and a `422` response's `errors` payload is mapped **straight back onto the matching fields** — no manual error handling:

```php
// Your controller just validates as usual.
$request->validate([
    'email'            => 'required|email',
    'contacts.*.name'  => 'required',
]);
```

</details>

<details>
<summary><strong>🎨 Theming &amp; publishing the views</strong></summary>

<br>

Pick a theme once in `config/roroform.php`:

```php
'theme' => 'tailwind', // 'bootstrap' | 'raw'
```

Three themes ship complete, **accessible**, and component-for-component identical:

| Theme | Styling |
|-------|---------|
| `tailwind` | TailwindCSS utility classes |
| `bootstrap` | Bootstrap 5 classes |
| `raw` | **Framework-free** — no Tailwind, no Bootstrap. Injects its own small stylesheet automatically, so you get a clean, modern look on **any** page with **zero CSS framework**. |

The `raw` theme is themed with CSS custom properties — override `--roro-accent`, `--roro-radius`, `--roro-border`, … to restyle it, or publish the stylesheet:

```bash
php artisan vendor:publish --tag=roro-styles   # -> public/vendor/roroform/roroform.css
```

Every theme is accessible: proper `<label>`s, `aria-describedby` error association, `aria-invalid` / `aria-required`, `<fieldset>`/`<legend>` radio groups, and a keyboard-navigable **ARIA combobox** for the custom selects.

Need to own the markup? Publish the Blade views and edit them in place:

```bash
php artisan vendor:publish --tag=roro-views
# -> resources/views/vendor/roroform/...
```

</details>

<details>
<summary><strong>🔧 Arbitrary HTML attributes pass-through</strong></summary>

<br>

Every input forwards **arbitrary HTML attributes** (the Blade attribute bag) onto the underlying element — no need to declare them in PHP. Great for `data-*`, `aria-*`, `autocomplete`, `maxlength`, Alpine `x-` directives, etc.

```blade
<x-roro-text name="email" label="Email"
    data-testid="email" autocomplete="email" maxlength="120"/>
```

renders `... data-testid="email" autocomplete="email" maxlength="120">` on the `<input>`. Custom CSS classes go through the dedicated `class` attribute and are merged with the component's own `roro-*` classes.

</details>

---

## Requirements

| | |
|---|---|
| **PHP** | `^8.0` |
| **Laravel** | `9`, `10`, `11`, `12`, `13` |
| **JavaScript** | none — the runtime is dependency-free vanilla JS |
| **CSS** | Tailwind, Bootstrap, **or none** — the `raw` theme ships its own stylesheet |

## Installation recap

```bash
composer require roro/roroform
php artisan vendor:publish --tag=roro-config   # config/roroform.php
php artisan vendor:publish --tag=roro-views    # (optional) own the Blade markup
```

## Upgrading

**Coming from the 1.x (jQuery) runtime?** 2.0 drops jQuery for dependency-free
vanilla JS. The everyday facade is unchanged; a few front-end event/return
contracts changed — see the [CHANGELOG](CHANGELOG.md) for the short migration
guide.

## License

[Apache-2.0](LICENSE).
