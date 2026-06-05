# Roro Form Package

Roro Form is a **Laravel package** for building forms using Blade components.  
It supports multiple input types, AJAX submission, dynamic selects, validation, and more.

For the moment it's only available with tailwind and JQuery.

---

## Installation

Install via Composer:

```bash
composer require roro/roroform
```

```bash
php artisan vendor:publish --tag=roro-config
```

---

## Basic Usage

Here’s an example of a fully functional form using Roro Form components:

```blade
<x-roro-form id="form-tutorial" :multipart="true">
    <!-- Text Inputs -->
    <x-roro-text id="test-error" value="John Doe" name="user[26][name]" label="First Name" placeholder="Enter your first name" :required="true"/>
    <x-roro-text value="Jane Smith" name="user[29][name]" label="Full Name" placeholder="Enter your full name" :required="true"/>
    <x-roro-text value="Michael Brown" name="user[1][name]" label="User Name" placeholder="Enter your username" :required="true"/>
    <x-roro-text :disabled="true" value="Disabled Field" name="user[40][name]" label="Disabled Input"/>
    <x-roro-text :readonly="true" value="Read Only Value" name="user[6][name]" label="Read Only"/>

    <!-- Other Inputs -->
    <x-roro-email value="john@example.com" name="email" label="Email" placeholder="Enter your email" :required="true"/>
    <x-roro-checkbox name="newsletter" label="Subscribe to newsletter" position="right"/>
    <x-roro-password value="secret123" name="password" label="Password" placeholder="Enter your password"/>
    <x-roro-url value="https://example.com" name="url" label="Website"/>
    <x-roro-tel value="+1234567890" name="tel" label="Phone"/>

    <!-- Date & Time -->
    <x-roro-date name="date" value="2025-09-08" label="Date"/>
    <x-roro-time name="time" value="14:30" label="Time"/>
    <x-roro-datetime-local name="datetime-local" value="2025-09-08T14:30" label="Date & Time"/>
    <x-roro-week name="week" value="2025-W36" label="Week"/>
    <x-roro-month name="month" value="2025-09" label="Month"/>

    <!-- Number, Hidden, Range, Color -->
    <x-roro-number name="age" value="30" label="Age"/>
    <x-roro-hidden name="user_id" value="12345"/>
    <x-roro-range name="satisfaction" value="75" list="satisfaction-list" step="5" label="Satisfaction Level"/>
    <x-roro-color name="favorite_color" :hide-text-input="true" value="#00ff00" label="Favorite Color"/>

    <!-- Radio Group -->
    <x-roro-radio-container label="Choose an Option" subtitle="You must select one" name="choice">
        <x-roro-radio name="choice" value="option1" label="Option A"/>
        <x-roro-radio name="choice" value="option2" label="Option B"/>
        <x-roro-radio name="choice" value="option3" label="Option C"/>
        <x-roro-radio name="choice" value="option4" label="Option D"/>
    </x-roro-radio-container>

    <!-- Select and Multi-select -->
    <x-roro-select id="select" name="select" :options="['Group 1'=>['a'=>'Option A','b'=>'Option B'],'Group 2'=>['c'=>'Option C']]" value="b" label="Select an option"/>
    <x-roro-multi-select :values="['a','b']" id="select23" name="select23[]" :options="['Group 1'=>['a'=>'Option A','b'=>'Option B'],'Group 2'=>['c'=>'Option C']]" label="Select multiple options"/>
    <x-roro-select id="select2" name="select2" :options="['fr'=>'France','en'=>'English','es'=>'Spain']" value="fr" label="Select a country"/>

    <!-- File Upload -->
    <x-roro-file :multiple="true" id="file-upload" name="file[]" label="Upload Files" placeholder="Choose files" requirements-text="Accepted formats: jpg, gif"/>

    <!-- Submit Button -->
    <x-roro-button :ajax="true" form-id="form-tutorial">Send</x-roro-button>
</x-roro-form>

<script>
$(document).ready(function () {
    // Handle AJAX success
    $('#form-tutorial').on('roro:ajax:success', function (event, response) {
        console.log('Form submitted successfully!', response);
    });

    // Show an error message on input change
    $('#test-error').on('change', function () {
        roroShowError('test-error', 'This is a test error message');
    });

    // Dynamically add options to selects
    roroAddOption('select', 'Option D', 'd', 'Group 1');
    roroAddOption('select2', 'Canada', 'ca', 'Group 2');

    // Disable / readonly examples
    roroDisableSelect('select2', true);
    roroReadonlySelect('select', false);
});

</script>

```

---

## Passing custom HTML attributes

Every input forwards **arbitrary HTML attributes** (the Blade attribute bag) onto the
underlying `<input>` / `<button>` element — no need to declare them in PHP. Handy for
`data-*`, `aria-*`, `autocomplete`, `maxlength`, Alpine `x-` directives, etc.

```blade
<x-roro-text name="email" label="Email" data-testid="email" autocomplete="email" maxlength="120"/>
```

renders `... data-testid="email" autocomplete="email" maxlength="120">` on the input.
Custom CSS classes still go through the dedicated `class` attribute and are merged with the
component's own `roro-*` classes.

---

## Dynamic select options

Select options are rendered **server-side** — pass them and they're already in the dropdown,
no JavaScript or network round-trip needed:

```blade
<x-roro-select name="country" :options="['fr' => 'France', 'es' => 'Spain']"/>
<x-roro-select name="city" :options="['Europe' => ['par' => 'Paris', 'mad' => 'Madrid']]"/>
```

To add options **after** load:

```js
// One option, instantly (client-side, no request). Optional 4th arg = category:
roroAddOption('country', 'Germany', 'de', 'Europe');

// Or fetch a batch from YOUR own JSON endpoint:
//   GET /api/countries  ->  [{ "label": "Germany", "value": "de", "category": "Europe" }, ...]
//   ("category" is optional)
roroAddOptionsAjax('country', '/api/countries', { q: 'ge' });
```

`roroAddOptionsAjax` returns a promise resolved with the options it received.

---

## JavaScript helpers

Roro Form ships a small, dependency-free (jQuery-based) facade so you can drive
any field or form from JavaScript without caring about its underlying markup.
Everything is **chainable** and **type-aware** — the same call works on a text
input, a select, a checkbox or a file field.

### The `roro()` facade

```js
roro('email')                 // -> handle, auto-detecting the field type
    .value('john@example.com') // set (chainable) ; roro('email').value() to read
    .required()                // toggle the HTML required flag
    .focus();

roro('age').disable();         // works on every input type
roro('age').error('Too young'); roro('age').clearError();
roro('newsletter').value(true);            // checkbox  -> boolean
roro('satisfaction').value(80);            // range
roro('file-upload').value();               // file      -> ['a.png', ...]
```

`value()` is universal: it reads/writes the right thing per type — text for
inputs, the selected option for a `select`, an **array** for a multi-select, the
checked state for a checkbox, the checked value for a radio group, file names for
a file input.

| Group   | Methods |
|---------|---------|
| Value   | `value(v?)` · `val(v?)` · `clear()` · `reset()` |
| State   | `disable(b=true)` · `enable()` · `readonly(b=true)` · `editable()` · `required(b=true)` · `optional()` · `isDisabled()` · `isReadonly()` · `isRequired()` |
| Display | `show()` · `hide()` · `toggle(b?)` · `isVisible()` · `label(t?)` · `placeholder(t?)` |
| Error   | `error(msg)` · `clearError()` |
| Events  | `on(ev, fn)` · `off(ev, fn)` · `trigger(ev)` · `change(fn)` · `input(fn)` · `click(fn)` · `focus()` · `blur()` |
| Misc    | `type()` · `name()` · `exists()` · `$el()` · `$control()` · `$wrapper()` · `attr()` · `prop()` · `addClass()` / `removeClass()` / `toggleClass()` |

### Selects

The handle exposes the full select API and a real **`change` event** (fired only
on actual user/programmatic changes, never on page load):

```js
roro('country')
    .addOption('France', 'fr', 'Europe')          // one option (client-side)
    .addOptions([{ label: 'Spain', value: 'es' }])// batch
    .value('fr')                                  // select it
    .change(value => console.log('picked', value));

roro('country').addOptionsAjax('/api/countries', { q: 'fr' }); // returns a promise
roro('country').setOptions([...]);   // replace every option
roro('country').removeOption('fr');
roro('country').options();           // -> [{label, value, category}, ...]
roro('country').open();  roro('country').close();
```

### The `roro.form()` facade

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

`fill()` matches keys against field **names** first (so it maps straight onto
your server payload / `old()` data) and falls back to element **ids** for
convenience.

### One-liner helpers

Every facade method also has a flat `window.roro*` shortcut, handy for quick
inline calls:

```js
roroValue('email', 'a@b.c');     roroValue('email');      // get/set
roroDisable('age');  roroEnable('age');  roroReadonly('age');  roroRequired('age');
roroShow('age');     roroHide('age');    roroFocus('email');  roroClearError('age');
roroOnChange('country', v => ...);
roroAddOptions('country', [...]);  roroSetOptions('country', [...]);  roroClearOptions('country');
roroRemoveOption('country', 'fr'); roroOptions('country');

roroFormData('signup');          roroFillForm('signup', data);
roroSubmit('signup');            roroValidateForm('signup');   roroResetForm('signup');
roroFormErrors('signup', errs);  roroClearFormErrors('signup');
roroOnSuccess('signup', fn);     roroOnError('signup', fn);
```

> All the previous globals (`roroAddOption`, `roroShowError`, `roroShowOverlay`,
> `roroDisableSelect`, …) keep working unchanged — the facade is purely additive.

---

## Publishing Assets

After installing **Roro Form**, you may want to customize its views or configuration.

### Publish Views

To publish the Blade views for customization:

```bash
php artisan vendor:publish --tag=roro-views


