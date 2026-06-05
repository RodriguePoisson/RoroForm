<?php

// ============================================================
// Selects – x-roro-select and x-roro-multi-select
// ============================================================

// --------------- select: wrapper structure ------------------

it('renders the select wrapper with the correct id and classes (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)
        ->toContain('id="roro-wrapper-country"')
        ->toContain('class="roro-wrapper roro-wrapper-select');
});

it('renders the select wrapper with the correct id and classes (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)
        ->toContain('id="roro-wrapper-country"')
        ->toContain('class="roro-wrapper roro-wrapper-select');
});

it('renders data-id on the select wrapper', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('data-id="country"');
});

// --------------- select: data-value / data-disable / data-readonly --

it('sets data-value on the select wrapper to the given value', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" value="fr" />'
    );

    expect($html)->toContain('data-value="fr"');
});

it('sets data-disable="1" when disabled is true (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :disabled="true" />'
    );

    // PHP true casts to "1" inside Blade {{ }}
    expect($html)->toContain('data-disable="1"');
});

it('sets data-disable="" when disabled is false (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :disabled="false" />'
    );

    expect($html)->toContain('data-disable=""');
});

it('sets data-readonly="1" when readonly is true (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :readonly="true" />'
    );

    expect($html)->toContain('data-readonly="1"');
});

it('sets data-readonly="" when readonly is false (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :readonly="false" />'
    );

    expect($html)->toContain('data-readonly=""');
});

it('sets data-disable="1" when disabled is true (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select name="country" id="country" :disabled="true" />'
    );

    expect($html)->toContain('data-disable="1"');
});

it('sets data-readonly="1" when readonly is true (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select name="country" id="country" :readonly="true" />'
    );

    expect($html)->toContain('data-readonly="1"');
});

// --------------- select: label -----------------------------------

it('renders a label with the correct id when label is provided', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" label="Country" />'
    );

    // The select label uses data-id to link to the field (no for= attribute)
    expect($html)
        ->toContain('id="label-country"')
        ->toContain('data-id="country"')
        ->toContain('Country');
});

it('does not render a label element when label is not provided', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->not->toContain('id="label-country"');
});

// --------------- select: hidden input carries value ----------------

it('renders the roro-select-hidden input with the given name and value', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" value="fr" />'
    );

    expect($html)
        ->toContain('class="roro-input roro-input-hidden roro-select-hidden"')
        ->toContain('name="country"')
        ->toContain('value="fr"');
});

it('renders the roro-select-hidden input with empty value when no value is provided', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)
        ->toContain('class="roro-input roro-input-hidden roro-select-hidden"')
        ->toContain('name="country"')
        ->toContain('value=""');
});

// --------------- select: server-side flat options ------------------

it('renders flat options as .roro-select-option elements with data-value and data-label', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country"
            :options="[\'fr\' => \'France\', \'es\' => \'Spain\']" />'
    );

    expect($html)
        ->toContain('class="roro-select-option')
        ->toContain('data-value="fr"')
        ->toContain('data-label="France"')
        ->toContain('data-value="es"')
        ->toContain('data-label="Spain"');
});

it('renders the option label text inside roro-select-option-label', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country"
            :options="[\'fr\' => \'France\']" />'
    );

    expect($html)
        ->toContain('class="roro-select-option-label')
        ->toContain('France');
});

// --------------- select: grouped (category) options ----------------

it('renders grouped options as .roro-select-category with data-category', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country"
            :options="[\'Europe\' => [\'fr\' => \'France\', \'es\' => \'Spain\']]" />'
    );

    expect($html)
        ->toContain('class="roro-select-category"')
        ->toContain('data-category="Europe"');
});

it('renders options inside the category options container', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country"
            :options="[\'Europe\' => [\'fr\' => \'France\', \'es\' => \'Spain\']]" />'
    );

    expect($html)
        ->toContain('class="roro-select-category-options-container"')
        ->toContain('data-value="fr"')
        ->toContain('data-label="France"')
        ->toContain('data-value="es"')
        ->toContain('data-label="Spain"');
});

it('renders the category label text in roro-select-category-label', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country"
            :options="[\'Europe\' => [\'fr\' => \'France\']]" />'
    );

    expect($html)
        ->toContain('class="roro-select-category-label')
        ->toContain('Europe');
});

it('renders mixed flat and grouped options correctly', function () {
    $html = $this->render(
        '<x-roro-select name="region" id="region"
            :options="[
                \'global\' => \'Global\',
                \'Europe\' => [\'fr\' => \'France\', \'de\' => \'Germany\']
            ]" />'
    );

    expect($html)
        ->toContain('data-value="global"')
        ->toContain('data-label="Global"')
        ->toContain('class="roro-select-category"')
        ->toContain('data-value="fr"')
        ->toContain('data-value="de"');
});

// --------------- select: templates block ---------------------------

it('renders the roro-select-templates block (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('class="roro-select-templates"');
});

it('renders the roro-select-templates block (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('class="roro-select-templates"');
});

it('includes a blank select-option template inside the templates block', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    // The templates block contains a bare select-option (blank label/value)
    expect($html)->toContain('class="roro-select-templates"');
    // After the templates div there must be at least one roro-select-option
    expect($html)->toContain('roro-select-option');
});

// --------------- select: dropdown container ------------------------

it('renders the roro-select-dropdown container', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('class="roro-select-dropdown');
});

// --------------- select: clear button / text-input -----------------

it('renders the roro-select-text-input element', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('class="roro-select-text-input');
});

it('renders the roro-select-clear-button', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('class="roro-select-clear-button');
});

// --------------- select: required attribute with JS validation ------

it('emits required on the text input when required=true and defaultJsValidation=true', function () {
    $html = $this->defaultJsValidation(true)->render(
        '<x-roro-select name="country" id="country" :required="true" />'
    );

    expect($html)->toContain('required');
});

it('does not emit required when defaultJsValidation=false', function () {
    $html = $this->defaultJsValidation(false)->render(
        '<x-roro-select name="country" id="country" :required="true" />'
    );

    // The text input must not carry the required attribute
    // (the hidden input never has it, so checking "required" presence in text-input region only)
    // We check that the roro-select-text-input section does not contain "required"
    // by asserting the whole HTML does not contain the standalone word "required"
    // (it only appears when emitted)
    // The blade outputs `required` or empty string — when false it's just empty
    expect($html)->not->toContain('required');
});

// --------------- select: hidden=true collapses wrapper -------------

it('hides the wrapper when hidden=true', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :hidden="true" />'
    );

    expect($html)->toContain('display:none');
});

// --------------- select: hasTopMargins ----------------------------

it('adds top-margin class when hasTopMargins is true (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :has-top-margins="true" />'
    );

    expect($html)->toContain('mt-6');
});

it('omits top-margin class when hasTopMargins is false (tailwind)', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :has-top-margins="false" />'
    );

    expect($html)->not->toContain('mt-6');
});

// --------------- select: optionsOpen / data-show ------------------

it('sets data-show="1" when optionsOpen is true', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :options-open="true" />'
    );

    expect($html)->toContain('data-show="1"');
});

it('sets data-show="" when optionsOpen is false', function () {
    $html = $this->render(
        '<x-roro-select name="country" id="country" :options-open="false" />'
    );

    expect($html)->toContain('data-show=""');
});

// --------------- select: error display ----------------------------

it('renders the error message text when there is a validation error', function () {
    $html = $this->withErrors(['country' => ['Please select a country.']])->render(
        '<x-roro-select name="country" id="country" />'
    );

    expect($html)->toContain('Please select a country.');
});

it('renders error wrapper as visible when there is an error', function () {
    $html = $this->withErrors(['country' => ['Required.']])->render(
        '<x-roro-select name="country" id="country" />'
    );

    // data-show="1" on the border-error div signals JS to show the red border
    expect($html)->toContain('data-show="1"');
});

// --------------- select: old() repopulates value ------------------

it('repopulates the hidden input value from old() input', function () {
    $html = $this->withOld(['country' => 'de'])->render(
        '<x-roro-select name="country" id="country"
            :options="[\'fr\' => \'France\', \'de\' => \'Germany\']" />'
    );

    // The hidden input should carry the old value
    expect($html)->toContain('value="de"');
    // The wrapper data-value should also reflect it
    expect($html)->toContain('data-value="de"');
});

// ============================================================
// multi-select
// ============================================================

// --------------- multi-select: wrapper structure ----------------

it('renders the multi-select wrapper with correct id and classes (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)
        ->toContain('id="roro-wrapper-tags"')
        ->toContain('class="roro-wrapper roro-wrapper-multi-select');
});

it('renders the multi-select wrapper with correct id and classes (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)
        ->toContain('id="roro-wrapper-tags"')
        ->toContain('class="roro-wrapper roro-wrapper-multi-select');
});

// --------------- multi-select: data-name and data-values -----------

it('exposes data-name on the multi-select wrapper', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)->toContain('data-name="tags[]"');
});

it('exposes data-values as JSON on the multi-select wrapper', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" :values="[\'a\', \'b\']" />'
    );

    expect($html)->toContain('data-values=');
    expect($html)->toContain('"a"');
    expect($html)->toContain('"b"');
});

it('exposes data-values as empty JSON array when no values provided', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)->toContain('data-values=\'[]\'');
});

// --------------- multi-select: data-disable / data-readonly --------

it('sets data-disable="1" on multi-select wrapper when disabled (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" :disabled="true" />'
    );

    expect($html)->toContain('data-disable="1"');
});

it('sets data-readonly="1" on multi-select wrapper when readonly (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" :readonly="true" />'
    );

    expect($html)->toContain('data-readonly="1"');
});

// --------------- multi-select: options ----------------------------

it('renders flat options in multi-select with data-value and data-label', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags"
            :options="[\'a\' => \'Alpha\', \'b\' => \'Beta\']" />'
    );

    expect($html)
        ->toContain('data-value="a"')
        ->toContain('data-label="Alpha"')
        ->toContain('data-value="b"')
        ->toContain('data-label="Beta"');
});

it('renders grouped options in multi-select with .roro-select-category', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags"
            :options="[\'Letters\' => [\'a\' => \'Alpha\', \'b\' => \'Beta\']]" />'
    );

    expect($html)
        ->toContain('class="roro-select-category"')
        ->toContain('data-category="Letters"')
        ->toContain('data-value="a"')
        ->toContain('data-value="b"');
});

// --------------- multi-select: templates block --------------------

it('renders roro-select-templates block in multi-select (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)->toContain('class="roro-select-templates"');
});

it('renders roro-select-templates block in multi-select (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)->toContain('class="roro-select-templates"');
});

// --------------- multi-select: label ------------------------------

it('renders a label for multi-select when label is provided', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" label="Tags" />'
    );

    expect($html)
        ->toContain('id="label-tags"')
        ->toContain('Tags');
});

// --------------- multi-select: contenteditable text-input ---------

it('renders the multi-select text-input as a div with contenteditable', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)
        ->toContain('contenteditable="true"')
        ->toContain('class="roro-select-text-input');
});

// --------------- multi-select: clear button -----------------------

it('renders the roro-select-clear-button in multi-select', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" />'
    );

    expect($html)->toContain('class="roro-select-clear-button');
});

// --------------- multi-select: error ------------------------------

it('renders error text for multi-select on validation failure', function () {
    $html = $this->withErrors(['tags' => ['At least one tag required.']])->render(
        '<x-roro-multi-select name="tags" id="tags" />'
    );

    expect($html)->toContain('At least one tag required.');
});

// --------------- multi-select: top margins ------------------------

it('adds top-margin class to multi-select when hasTopMargins=true (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" :has-top-margins="true" />'
    );

    expect($html)->toContain('mt-6');
});

it('omits top-margin class from multi-select when hasTopMargins=false (tailwind)', function () {
    $html = $this->render(
        '<x-roro-multi-select name="tags[]" id="tags" :has-top-margins="false" />'
    );

    expect($html)->not->toContain('mt-6');
});

// --------------- select-option component standalone ---------------

it('renders a standalone select-option with data-value and data-label', function () {
    $html = $this->render(
        '<x-roro-select-option value="fr" label="France" id="opt-fr" />'
    );

    expect($html)
        ->toContain('data-value="fr"')
        ->toContain('data-label="France"')
        ->toContain('class="roro-select-option');
});

it('renders roro-select-option-label span with the label text', function () {
    $html = $this->render(
        '<x-roro-select-option value="fr" label="France" id="opt-fr" />'
    );

    expect($html)
        ->toContain('class="roro-select-option-label')
        ->toContain('France');
});

it('hides the select-option when hidden=true', function () {
    $html = $this->render(
        '<x-roro-select-option value="fr" label="France" id="opt-fr" :hidden="true" />'
    );

    expect($html)->toContain('display:none');
});

// --------------- select-category component standalone -------------

it('renders a standalone select-category with data-category', function () {
    $html = $this->render(
        '<x-roro-select-category category="Europe" id="cat-eu" />'
    );

    expect($html)
        ->toContain('class="roro-select-category"')
        ->toContain('data-category="Europe"');
});

it('renders roro-select-category-label with the category text', function () {
    $html = $this->render(
        '<x-roro-select-category category="Europe" id="cat-eu" />'
    );

    expect($html)
        ->toContain('class="roro-select-category-label')
        ->toContain('Europe');
});

it('renders roro-select-category-options-container for the slot', function () {
    $html = $this->render(
        '<x-roro-select-category category="Europe" id="cat-eu">
            <x-roro-select-option value="fr" label="France" />
        </x-roro-select-category>'
    );

    expect($html)
        ->toContain('class="roro-select-category-options-container"')
        ->toContain('data-value="fr"');
});

// --------------- bootstrap: select-option and select-category -----

it('renders select-option with correct classes in bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select-option value="fr" label="France" id="opt-fr" />'
    );

    expect($html)
        ->toContain('data-value="fr"')
        ->toContain('data-label="France"')
        ->toContain('class="roro-select-option');
});

it('renders select-category with correct structure in bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render(
        '<x-roro-select-category category="Europe" id="cat-eu" />'
    );

    expect($html)
        ->toContain('class="roro-select-category"')
        ->toContain('data-category="Europe"')
        ->toContain('class="roro-select-category-label');
});
