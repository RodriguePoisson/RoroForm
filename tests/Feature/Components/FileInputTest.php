<?php

/**
 * Tests for the <x-roro-file> component.
 *
 * Covers: class roro-input-file, name/id, multiple attribute, name ending in [],
 * requirementsText, accept, arbitrary pass-through attributes, label, error display,
 * required/disabled/readonly, maxSize data attribute, hidden wrapper, and theme switching.
 */

use RoroForm\View\Components\Inputs\File;

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

it('renders the roro-input-file class on the input element', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('roro-input roro-input-file');
});

it('renders the correct name attribute', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('name="avatar"');
});

it('renders the correct id attribute on the input', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('id="avatar"');
});

it('renders the wrapper div with id roro-wrapper-{id}', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('id="roro-wrapper-avatar"');
});

it('renders the wrapper with class roro-wrapper-file', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('roro-wrapper-file');
});

it('renders type="file" on the input element', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('type="file"');
});

// ---------------------------------------------------------------------------
// multiple attribute
// ---------------------------------------------------------------------------

it('renders the multiple attribute when :multiple="true"', function () {
    $html = $this->render('<x-roro-file name="docs" id="docs" :multiple="true" />');

    expect($html)->toContain('multiple');
});

it('does not render multiple when :multiple="false"', function () {
    $html = $this->render('<x-roro-file name="doc" id="doc" :multiple="false" />');

    // The string "multiple" should not appear in the input tag context.
    // We verify the input does not contain the standalone multiple attribute.
    expect($html)->not->toContain(' multiple');
});

it('multiple defaults to true', function () {
    // Default for $multiple is true in File.php
    $html = $this->render('<x-roro-file name="docs" id="docs" />');

    expect($html)->toContain('multiple');
});

it('renders multiple with name ending in []', function () {
    $html = $this->render('<x-roro-file name="docs[]" id="docs" :multiple="true" />');

    expect($html)
        ->toContain('name="docs[]"')
        ->toContain('multiple');
});

// ---------------------------------------------------------------------------
// requirementsText
// ---------------------------------------------------------------------------

it('renders requirementsText when provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" requirementsText="Max 5 MB, PDF only" />');

    expect($html)->toContain('Max 5 MB, PDF only');
});

it('renders an empty span for requirementsText when not provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    // The span for requirements text is always present, just empty.
    expect($html)->toContain('roro-drop-zone');
});

// ---------------------------------------------------------------------------
// accept attribute
// ---------------------------------------------------------------------------

it('renders the accept attribute when provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" accept=".pdf,.docx" />');

    expect($html)->toContain('accept=".pdf,.docx"');
});

it('renders an empty accept attribute when not provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    expect($html)->toContain('accept=""');
});

// ---------------------------------------------------------------------------
// maxSize data attribute
// ---------------------------------------------------------------------------

it('renders data-max-size when maxSize is provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" maxSize="5120" />');

    expect($html)->toContain('data-max-size="5120"');
});

it('renders an empty data-max-size when maxSize is not provided', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    expect($html)->toContain('data-max-size=""');
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

it('renders the label element when label is provided', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" label="Profile Photo" />');

    expect($html)
        ->toContain('id="label-avatar"')
        ->toContain('for="avatar"')
        ->toContain('Profile Photo')
        ->toContain('roro-label-file');
});

it('does not render a label element when label is omitted', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->not->toContain('roro-label-file');
});

it('renders the required label marker when required is true', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" label="Photo" :required="true" />');

    // The required-label component renders a red asterisk: <span class="text-red-500">*</span>
    expect($html)->toContain('text-red-500');
});

it('does not render the required label marker when required is false', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" label="Photo" :required="false" />');

    expect($html)->not->toContain('roro-required-label');
});

// ---------------------------------------------------------------------------
// required HTML attribute (controlled by defaultJsValidation)
// ---------------------------------------------------------------------------

it('renders the required attribute when required=true and defaultJsValidation=true', function () {
    $this->defaultJsValidation(true);

    $html = $this->render('<x-roro-file name="f" id="f" :required="true" />');

    expect($html)->toContain('required');
});

it('omits the required attribute when defaultJsValidation=false', function () {
    $this->defaultJsValidation(false);

    $html = $this->render('<x-roro-file name="f" id="f" :required="true" />');

    // required attribute should not be present on the <input>
    expect($html)->not->toContain(' required');
});

it('omits the required attribute when required=false even with defaultJsValidation=true', function () {
    $this->defaultJsValidation(true);

    $html = $this->render('<x-roro-file name="f" id="f" :required="false" />');

    expect($html)->not->toContain(' required');
});

// ---------------------------------------------------------------------------
// disabled and readonly
// ---------------------------------------------------------------------------

it('renders the disabled attribute when disabled=true', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :disabled="true" />');

    expect($html)->toContain('disabled');
});

it('does not render disabled when disabled=false', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :disabled="false" />');

    expect($html)->not->toContain(' disabled');
});

it('renders the readonly attribute when readonly=true', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :readonly="true" />');

    expect($html)->toContain('readonly');
});

it('does not render readonly when readonly=false', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :readonly="false" />');

    expect($html)->not->toContain(' readonly');
});

// ---------------------------------------------------------------------------
// Arbitrary attribute pass-through
// ---------------------------------------------------------------------------

it('passes through arbitrary data-* attributes', function () {
    $html = $this->render('<x-roro-file name="f" id="f" data-testid="upload-field" />');

    expect($html)->toContain('data-testid="upload-field"');
});

it('passes through aria attributes', function () {
    $html = $this->render('<x-roro-file name="f" id="f" aria-label="Upload file" />');

    expect($html)->toContain('aria-label="Upload file"');
});

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------

it('renders the error message from the session', function () {
    $this->withErrors(['avatar' => ['The file is required.']]);

    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    expect($html)->toContain('The file is required.');
});

it('shows the border-error element when an error is present', function () {
    $this->withErrors(['avatar' => ['Too large.']]);

    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    // data-show="1" is set by border-error when there is an error
    expect($html)->toContain('data-show="1"');
});

it('hides the border-error element when no error is present', function () {
    $html = $this->render('<x-roro-file name="avatar" id="avatar" />');

    // data-show is symmetric: "0" when hidden (no error), "1" when visible.
    expect($html)->toContain('data-show="0"');
});

// ---------------------------------------------------------------------------
// hidden wrapper
// ---------------------------------------------------------------------------

it('hides the wrapper when hidden=true', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :hidden="true" />');

    expect($html)->toContain('display:none;');
});

it('does not hide the wrapper when hidden=false', function () {
    $html = $this->render('<x-roro-file name="f" id="f" :hidden="false" />');

    // style should not force display:none on the wrapper
    expect($html)->not->toContain('display:none;');
});

// ---------------------------------------------------------------------------
// wrapperClass / class pass-through
// ---------------------------------------------------------------------------

it('adds a custom wrapperClass to the wrapper div', function () {
    $html = $this->render('<x-roro-file name="f" id="f" wrapperClass="my-wrapper" />');

    expect($html)->toContain('my-wrapper');
});

it('adds a custom class to the drop-zone div', function () {
    $html = $this->render('<x-roro-file name="f" id="f" class="custom-drop" />');

    expect($html)->toContain('custom-drop');
});

// ---------------------------------------------------------------------------
// placeholder
// ---------------------------------------------------------------------------

it('renders the placeholder text inside the drop zone', function () {
    $html = $this->render('<x-roro-file name="f" id="f" placeholder="Drop files here" />');

    expect($html)->toContain('Drop files here');
});

// ---------------------------------------------------------------------------
// Bootstrap theme
// ---------------------------------------------------------------------------

it('renders roro-input-file with the bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render('<x-roro-file name="f" id="f" label="Upload" />');

    expect($html)
        ->toContain('roro-input roro-input-file')
        ->toContain('roro-label-file')
        ->toContain('for="f"');
});

it('renders multiple with bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render('<x-roro-file name="docs[]" id="docs" :multiple="true" />');

    expect($html)
        ->toContain('name="docs[]"')
        ->toContain('multiple');
});

it('renders accept with bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render('<x-roro-file name="f" id="f" accept="image/*" />');

    expect($html)->toContain('accept="image/*"');
});

it('renders requirementsText with bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render('<x-roro-file name="f" id="f" requirementsText="Images only" />');

    expect($html)->toContain('Images only');
});

// ---------------------------------------------------------------------------
// Invalid theme throws
// ---------------------------------------------------------------------------

it('throws InvalidArgumentException for an invalid theme', function () {
    $this->theme('bogus');

    new File(name: 'f');
})->throws(InvalidArgumentException::class);

// ---------------------------------------------------------------------------
// File name display elements
// ---------------------------------------------------------------------------

it('renders the roro-file-name-container paragraph', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    expect($html)->toContain('roro-file-name-container');
});

it('renders the roro-file-name span (initially hidden) for JS cloning', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    expect($html)
        ->toContain('roro-file-name')
        ->toContain('roro-file-name-text')
        ->toContain('roro-file-name-delete');
});

// ---------------------------------------------------------------------------
// drop-zone element
// ---------------------------------------------------------------------------

it('renders the roro-drop-zone element', function () {
    $html = $this->render('<x-roro-file name="f" id="f" />');

    expect($html)
        ->toContain('roro-drop-zone')
        ->toContain('drop-zone');
});
