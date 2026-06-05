<?php

/**
 * Tests for the text-like input components:
 * text, email, password, url, tel
 *
 * All share the same Blade view (inputs/text.blade.php) and the same
 * InputMain base class; only the `type` attribute differs.
 */

// ---------------------------------------------------------------------------
// type attribute and base CSS class
// ---------------------------------------------------------------------------

it('text: renders type="text" with roro-input-text class', function () {
    $html = $this->render('<x-roro-text name="q" id="q" />');

    expect($html)
        ->toContain('type="text"')
        ->toContain('roro-input-text');
});

it('email: renders type="email" with roro-input-text class', function () {
    // Email extends Text so it inherits the same blade view → still roro-input-text
    $html = $this->render('<x-roro-email name="q" id="q" />');

    expect($html)
        ->toContain('type="email"')
        ->toContain('roro-input-text');
});

it('password: renders type="password" with roro-input-text class', function () {
    $html = $this->render('<x-roro-password name="q" id="q" />');

    expect($html)
        ->toContain('type="password"')
        ->toContain('roro-input-text');
});

it('url: renders type="url" with roro-input-text class', function () {
    $html = $this->render('<x-roro-url name="q" id="q" />');

    expect($html)
        ->toContain('type="url"')
        ->toContain('roro-input-text');
});

it('tel: renders type="tel" with roro-input-text class', function () {
    $html = $this->render('<x-roro-tel name="q" id="q" />');

    expect($html)
        ->toContain('type="tel"')
        ->toContain('roro-input-text');
});

// ---------------------------------------------------------------------------
// name / id / value / placeholder
// ---------------------------------------------------------------------------

it('text: renders name attribute on the input element', function () {
    $html = $this->render('<x-roro-text name="first_name" id="first_name" />');

    expect($html)->toContain('name="first_name"');
});

it('text: renders explicit id on the input element', function () {
    $html = $this->render('<x-roro-text name="x" id="my-id" />');

    expect($html)->toContain('id="my-id"');
});

it('text: renders a value attribute when :value is set', function () {
    $html = $this->render('<x-roro-text name="x" id="x" value="hello" />');

    expect($html)->toContain('value="hello"');
});

it('text: renders an empty value attribute when no value is supplied', function () {
    $html = $this->render('<x-roro-text name="x" id="x" />');

    expect($html)->toContain('value=""');
});

it('text: renders placeholder attribute on the input', function () {
    $html = $this->render('<x-roro-text name="x" id="x" placeholder="Enter text…" />');

    expect($html)->toContain('placeholder="Enter text…"');
});

it('email: renders name and id correctly', function () {
    $html = $this->render('<x-roro-email name="email" id="email" />');

    expect($html)
        ->toContain('name="email"')
        ->toContain('id="email"');
});

it('password: renders value attribute', function () {
    $html = $this->render('<x-roro-password name="pass" id="pass" value="secret" />');

    expect($html)->toContain('value="secret"');
});

// ---------------------------------------------------------------------------
// wrapper element
// ---------------------------------------------------------------------------

it('text: wrapper id is roro-wrapper-{id}', function () {
    $html = $this->render('<x-roro-text name="x" id="my-input" />');

    expect($html)->toContain('id="roro-wrapper-my-input"');
});

it('text: wrapper carries roro-wrapper and roro-wrapper-text classes', function () {
    $html = $this->render('<x-roro-text name="x" id="x" />');

    expect($html)
        ->toContain('roro-wrapper')
        ->toContain('roro-wrapper-text');
});

// ---------------------------------------------------------------------------
// label
// ---------------------------------------------------------------------------

it('text: label is rendered with id="label-{id}" and for="{id}"', function () {
    $html = $this->render('<x-roro-text name="x" id="my-input" label="Full name" />');

    expect($html)
        ->toContain('id="label-my-input"')
        ->toContain('for="my-input"')
        ->toContain('Full name');
});

it('text: label carries roro-label and roro-label-text classes', function () {
    $html = $this->render('<x-roro-text name="x" id="x" label="My label" />');

    expect($html)
        ->toContain('roro-label')
        ->toContain('roro-label-text');
});

it('text: no label element rendered when label prop is omitted', function () {
    $html = $this->render('<x-roro-text name="x" id="x" />');

    expect($html)->not->toContain('id="label-x"');
});

it('email: label rendered correctly', function () {
    $html = $this->render('<x-roro-email name="email" id="email" label="Email address" />');

    expect($html)
        ->toContain('id="label-email"')
        ->toContain('for="email"')
        ->toContain('Email address');
});

it('text: required label marker rendered inside label when :required and label are set', function () {
    $html = $this->render('<x-roro-text name="x" id="x" label="Name" :required="true" />');

    // The required-label component emits a red asterisk
    expect($html)->toContain('text-red-500');
});

it('text: required label marker absent when :required is false', function () {
    $html = $this->render('<x-roro-text name="x" id="x" label="Name" :required="false" />');

    expect($html)->not->toContain('text-red-500');
});

// ---------------------------------------------------------------------------
// required attribute (HTML)
// ---------------------------------------------------------------------------

it('text: required attribute present when :required=true and defaultJsValidation=true', function () {
    $html = $this->defaultJsValidation(true)->render('<x-roro-text name="x" id="x" :required="true" />');

    expect($html)->toContain('required');
});

it('text: required attribute absent when :required=false regardless of defaultJsValidation', function () {
    $html = $this->defaultJsValidation(true)->render('<x-roro-text name="x" id="x" :required="false" />');

    // "required" should not appear as a standalone HTML attribute
    // (it can appear inside class names safely but not as standalone attr in this context)
    expect($html)->not->toContain(' required');
});

it('text: required attribute absent when defaultJsValidation=false even with :required=true', function () {
    $html = $this->defaultJsValidation(false)->render('<x-roro-text name="x" id="x" :required="true" />');

    expect($html)->not->toContain(' required');
});

it('email: required attribute present when :required=true and defaultJsValidation=true', function () {
    $html = $this->defaultJsValidation(true)->render('<x-roro-email name="email" id="email" :required="true" />');

    expect($html)->toContain('required');
});

it('password: required attribute absent when defaultJsValidation=false', function () {
    $html = $this->defaultJsValidation(false)->render('<x-roro-password name="pass" id="pass" :required="true" />');

    expect($html)->not->toContain(' required');
});

// ---------------------------------------------------------------------------
// disabled / readonly
// ---------------------------------------------------------------------------

it('text: disabled attribute is rendered when :disabled=true', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :disabled="true" />');

    expect($html)->toContain('disabled');
});

it('text: disabled attribute is absent when :disabled=false', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :disabled="false" />');

    // Note: Tailwind utility classes like "disabled:cursor-not-allowed" contain the
    // word "disabled", so we assert the HTML disabled *attribute* is not present
    // (as a standalone word not followed by colon or equals).
    // The simplest reliable assertion: the input element does not carry the
    // bare HTML attribute, i.e. " disabled" does not appear as a word boundary
    // after a space (Tailwind variants always have "disabled:" with a colon).
    expect($html)->not->toMatch('/ disabled[^:]/');
});

it('text: readonly attribute is rendered when :readonly=true', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :readonly="true" />');

    expect($html)->toContain('readonly');
});

it('text: readonly attribute is absent when :readonly=false', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :readonly="false" />');

    expect($html)->not->toContain('readonly');
});

it('email: disabled attribute rendered correctly', function () {
    $html = $this->render('<x-roro-email name="email" id="email" :disabled="true" />');

    expect($html)->toContain('disabled');
});

it('url: readonly renders correctly', function () {
    $html = $this->render('<x-roro-url name="site" id="site" :readonly="true" />');

    expect($html)->toContain('readonly');
});

// ---------------------------------------------------------------------------
// hidden wrapper (display:none style)
// ---------------------------------------------------------------------------

it('text: hidden wrapper has display:none when :hidden=true', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :hidden="true" />');

    expect($html)->toContain('display:none');
});

it('text: hidden wrapper does not have display:none when :hidden=false', function () {
    $html = $this->render('<x-roro-text name="x" id="x" :hidden="false" />');

    expect($html)->not->toContain('display:none');
});

it('email: hidden wrapper has display:none', function () {
    $html = $this->render('<x-roro-email name="email" id="email" :hidden="true" />');

    expect($html)->toContain('display:none');
});

it('tel: hidden wrapper has display:none', function () {
    $html = $this->render('<x-roro-tel name="phone" id="phone" :hidden="true" />');

    expect($html)->toContain('display:none');
});

// ---------------------------------------------------------------------------
// arbitrary attribute pass-through
// ---------------------------------------------------------------------------

it('text: data-testid attribute passes through to the input', function () {
    $html = $this->render('<x-roro-text name="x" id="x" data-testid="my-text" />');

    expect($html)->toContain('data-testid="my-text"');
});

it('text: autocomplete attribute passes through', function () {
    $html = $this->render('<x-roro-text name="x" id="x" autocomplete="given-name" />');

    expect($html)->toContain('autocomplete="given-name"');
});

it('text: maxlength attribute passes through', function () {
    $html = $this->render('<x-roro-text name="x" id="x" maxlength="100" />');

    expect($html)->toContain('maxlength="100"');
});

it('email: autocomplete="email" passes through', function () {
    $html = $this->render('<x-roro-email name="email" id="email" autocomplete="email" />');

    expect($html)->toContain('autocomplete="email"');
});

it('password: autocomplete="current-password" passes through', function () {
    $html = $this->render('<x-roro-password name="pass" id="pass" autocomplete="current-password" />');

    expect($html)->toContain('autocomplete="current-password"');
});

it('tel: data-testid passes through', function () {
    $html = $this->render('<x-roro-tel name="phone" id="phone" data-testid="tel-field" />');

    expect($html)->toContain('data-testid="tel-field"');
});

it('url: maxlength attribute passes through', function () {
    $html = $this->render('<x-roro-url name="site" id="site" maxlength="255" />');

    expect($html)->toContain('maxlength="255"');
});

// ---------------------------------------------------------------------------
// custom class merges with roro-* classes
// ---------------------------------------------------------------------------

it('text: custom class is appended alongside roro-input-text', function () {
    $html = $this->render('<x-roro-text name="x" id="x" class="my-custom-class" />');

    expect($html)
        ->toContain('roro-input-text')
        ->toContain('my-custom-class');
});

it('email: custom class merges correctly', function () {
    $html = $this->render('<x-roro-email name="email" id="email" class="email-extra" />');

    expect($html)
        ->toContain('roro-input-text')
        ->toContain('email-extra');
});

it('password: custom class merges correctly', function () {
    $html = $this->render('<x-roro-password name="pass" id="pass" class="pass-extra" />');

    expect($html)
        ->toContain('roro-input-text')
        ->toContain('pass-extra');
});

// ---------------------------------------------------------------------------
// old() repopulation
// ---------------------------------------------------------------------------

it('text: repopulates value from old() on failed validation', function () {
    $this->withOld(['username' => 'jdoe']);

    $html = $this->render('<x-roro-text name="username" id="username" />');

    expect($html)->toContain('value="jdoe"');
});

it('email: repopulates value from old()', function () {
    $this->withOld(['email' => 'old@example.com']);

    $html = $this->render('<x-roro-email name="email" id="email" />');

    expect($html)->toContain('value="old@example.com"');
});

it('text: old() value takes precedence over explicit :value prop', function () {
    $this->withOld(['x' => 'from-old']);

    $html = $this->render('<x-roro-text name="x" id="x" value="from-prop" />');

    // old() is merged first in populateValue(), so it wins
    expect($html)->toContain('value="from-old"');
});

// ---------------------------------------------------------------------------
// error display
// ---------------------------------------------------------------------------

it('text: shows validation error text from session', function () {
    $this->withErrors(['email' => ['The email is required.']]);

    $html = $this->render('<x-roro-text name="email" id="email" />');

    expect($html)->toContain('The email is required.');
});

it('text: error message is inside roro-input-error-message element', function () {
    $this->withErrors(['myfield' => ['Something went wrong.']]);

    $html = $this->render('<x-roro-text name="myfield" id="myfield" />');

    expect($html)
        ->toContain('roro-input-error-message')
        ->toContain('Something went wrong.');
});

it('text: error container is always rendered even without a validation error', function () {
    $html = $this->render('<x-roro-text name="email" id="email" />');

    // The error component is always emitted (with an empty message when no error);
    // it is NOT hidden via display:none — hiding is handled via data-show / JS.
    expect($html)->toContain('roro-input-error-container');
});

it('email: shows validation error from session', function () {
    $this->withErrors(['email' => ['Invalid email address.']]);

    $html = $this->render('<x-roro-email name="email" id="email" />');

    expect($html)->toContain('Invalid email address.');
});

// ---------------------------------------------------------------------------
// invalid theme throws InvalidArgumentException
// ---------------------------------------------------------------------------

it('throws InvalidArgumentException for an invalid theme (direct construction)', function () {
    $this->theme('bogus');

    new RoroForm\View\Components\Inputs\Text(name: 'x');
})->throws(InvalidArgumentException::class);

it('throws InvalidArgumentException for an invalid theme via email component', function () {
    $this->theme('bogus');

    new RoroForm\View\Components\Inputs\Email(name: 'x');
})->throws(InvalidArgumentException::class);
