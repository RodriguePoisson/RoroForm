<?php

// Cross-cutting integration tests: old() repopulation, error display, required
// suppression, theme class differences, and required-label marker rendering.

// ──────────────────────────────────────────────────────────────────────────────
// old() repopulation
// ──────────────────────────────────────────────────────────────────────────────

it('repopulates text input value from old()', function () {
    $this->withOld(['username' => 'john_doe']);

    $html = $this->render('<x-roro-text name="username" id="username" />');

    expect($html)->toContain('value="john_doe"');
});

it('does not show stale value in text input when old() key is absent', function () {
    $this->withOld(['other' => 'nope']);

    $html = $this->render('<x-roro-text name="username" id="username" value="default" />');

    // old() has no "username" key, so the explicit :value fallback is kept
    expect($html)->toContain('value="default"');
});

it('repopulates checkbox as checked when old() value is truthy', function () {
    $this->withOld(['agree' => '1']);

    $html = $this->render('<x-roro-checkbox name="agree" id="agree" />');

    expect($html)->toContain('checked');
});

it('does not check checkbox when old() value is absent', function () {
    // No old input at all — checkbox must not be checked by default.
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" />');

    expect($html)->not->toContain('checked');
});

it('repopulates select hidden input value from old()', function () {
    $this->withOld(['country' => 'fr']);

    $html = $this->render('<x-roro-select name="country" id="country" />');

    // The select wrapper carries data-value; the hidden input holds the value.
    expect($html)
        ->toContain('data-value="fr"');
});

// ──────────────────────────────────────────────────────────────────────────────
// Error display — including dot-notation / bracket-notation normalisation
// ──────────────────────────────────────────────────────────────────────────────

it('shows a simple field error for text input', function () {
    $this->withErrors(['email' => ['The email field is invalid.']]);

    $html = $this->render('<x-roro-text name="email" id="email" />');

    expect($html)->toContain('The email field is invalid.');
});

it('shows a nested dot-notation error for text input (user.2.email)', function () {
    // Blade name uses bracket notation; InputMain::normalizeOldName converts
    // "user[2][email]" → "user.2.email" before looking up the error key.
    $this->withErrors(['user.2.email' => ['bad email']]);

    $html = $this->render('<x-roro-text name="user[2][email]" id="nested-email" />');

    expect($html)->toContain('bad email');
});

it('does not show an error when the error key does not match the field name', function () {
    $this->withErrors(['other_field' => ['Some other error']]);

    $html = $this->render('<x-roro-text name="email" id="email" />');

    expect($html)->not->toContain('Some other error');
});

it('renders error container hidden when there is no error', function () {
    $html = $this->render('<x-roro-text name="email" id="email" />');

    // data-show is symmetric: "0" when hidden, "1" when visible.
    expect($html)->toContain('data-show="0"');
});

it('renders error container visible when there is an error', function () {
    $this->withErrors(['email' => ['Required.']]);

    $html = $this->render('<x-roro-text name="email" id="email" />');

    // data-show="1" (truthy PHP bool cast) means the border is revealed.
    expect($html)->toContain('data-show="1"');
});

// ──────────────────────────────────────────────────────────────────────────────
// required HTML attribute — suppressed by defaultJsValidation(false)
// ──────────────────────────────────────────────────────────────────────────────

it('emits required on text input when defaultJsValidation is true', function () {
    $this->defaultJsValidation(true);

    $html = $this->render('<x-roro-text name="title" id="title" :required="true" />');

    expect($html)->toContain('required');
});

it('suppresses required on text input when defaultJsValidation is false', function () {
    $this->defaultJsValidation(false);

    $html = $this->render('<x-roro-text name="title" id="title" :required="true" />');

    expect($html)->not->toContain('required');
});

it('emits required on select input when defaultJsValidation is true', function () {
    $this->defaultJsValidation(true);

    $html = $this->render('<x-roro-select name="color" id="color" :required="true" />');

    expect($html)->toContain('required');
});

it('suppresses required on select input when defaultJsValidation is false', function () {
    $this->defaultJsValidation(false);

    $html = $this->render('<x-roro-select name="color" id="color" :required="true" />');

    expect($html)->not->toContain('required');
});

it('does not emit required when required is false even with jsValidation on', function () {
    $this->defaultJsValidation(true);

    $html = $this->render('<x-roro-text name="optional" id="optional" :required="false" />');

    // "required" as a standalone attribute must not appear (only disableJsValidation
    // affects it; when $required itself is false there is nothing to emit).
    expect($html)->not->toContain('required');
});

// ──────────────────────────────────────────────────────────────────────────────
// Theme-dependent wrapper / control classes (tailwind vs bootstrap)
// ──────────────────────────────────────────────────────────────────────────────

it('tailwind text input wrapper uses w-full class', function () {
    $this->theme('tailwind');

    $html = $this->render('<x-roro-text name="t" id="t" />');

    expect($html)
        ->toContain('roro-wrapper-text')
        ->toContain('w-full')
        ->not->toContain('w-100');
});

it('bootstrap text input wrapper uses w-100 class instead of w-full', function () {
    $this->theme('bootstrap');

    $html = $this->render('<x-roro-text name="t" id="t" />');

    expect($html)
        ->toContain('roro-wrapper-text')
        ->toContain('w-100')
        ->not->toContain('w-full');
});

it('tailwind text input control uses Tailwind-specific classes', function () {
    $this->theme('tailwind');

    $html = $this->render('<x-roro-text name="t" id="t" />');

    // Tailwind template uses rounded-lg, bootstrap uses form-control.
    expect($html)
        ->toContain('roro-input-text')
        ->toContain('rounded-lg')
        ->not->toContain('form-control');
});

it('bootstrap text input control uses form-control class', function () {
    $this->theme('bootstrap');

    $html = $this->render('<x-roro-text name="t" id="t" />');

    expect($html)
        ->toContain('roro-input-text')
        ->toContain('form-control')
        ->not->toContain('rounded-lg');
});

it('tailwind checkbox wrapper uses flex items-center gap-2 by default', function () {
    $this->theme('tailwind');

    $html = $this->render('<x-roro-checkbox name="cb" id="cb" />');

    expect($html)
        ->toContain('roro-wrapper-checkbox')
        ->toContain('flex items-center gap-2');
});

it('bootstrap checkbox wrapper uses form-check by default', function () {
    $this->theme('bootstrap');

    $html = $this->render('<x-roro-checkbox name="cb" id="cb" />');

    expect($html)
        ->toContain('roro-wrapper-checkbox')
        ->toContain('form-check');
});

it('tailwind select text-input uses Tailwind focus ring classes', function () {
    $this->theme('tailwind');

    $html = $this->render('<x-roro-select name="s" id="s" />');

    expect($html)
        ->toContain('roro-select-text-input')
        ->toContain('focus:ring-blue-200');
});

it('bootstrap select text-input uses form-control class', function () {
    $this->theme('bootstrap');

    $html = $this->render('<x-roro-select name="s" id="s" />');

    expect($html)
        ->toContain('roro-select-text-input')
        ->toContain('form-control');
});

// ──────────────────────────────────────────────────────────────────────────────
// required-label component
// ──────────────────────────────────────────────────────────────────────────────

it('renders the required-label marker in a text label when required is true (tailwind)', function () {
    $this->theme('tailwind');

    $html = $this->render('<x-roro-text name="email" id="email" label="Email" :required="true" />');

    // Tailwind required-label: <span class="text-red-500">*</span>
    expect($html)
        ->toContain('text-red-500')
        ->toContain('*');
});

it('renders the required-label marker in a text label when required is true (bootstrap)', function () {
    $this->theme('bootstrap');

    $html = $this->render('<x-roro-text name="email" id="email" label="Email" :required="true" />');

    // Bootstrap required-label: <span class="text-danger">*</span>
    expect($html)
        ->toContain('text-danger')
        ->toContain('*');
});

it('does not render the required-label marker when required is false', function () {
    $html = $this->render('<x-roro-text name="email" id="email" label="Email" :required="false" />');

    expect($html)->not->toContain('text-red-500');
});

it('renders the required-label component directly', function () {
    $html = $this->render('<x-roro-required-label />');

    expect($html)->toContain('text-red-500')->toContain('*');
});

// ──────────────────────────────────────────────────────────────────────────────
// normalizeOldName — bracket-to-dot conversion used for both old() and errors
// ──────────────────────────────────────────────────────────────────────────────

it('repopulates text input using bracket-notation old() key (user[0][name])', function () {
    // old() stores "user.0.name" internally; component normalises its name to match.
    $this->withOld(['user' => [0 => ['name' => 'Alice']]]);

    $html = $this->render('<x-roro-text name="user[0][name]" id="u0n" />');

    expect($html)->toContain('value="Alice"');
});

it('shows error for deeply nested field via dot notation key', function () {
    $this->withErrors(['order.items.0.qty' => ['Quantity required.']]);

    $html = $this->render('<x-roro-text name="order[items][0][qty]" id="qty" />');

    expect($html)->toContain('Quantity required.');
});

// ──────────────────────────────────────────────────────────────────────────────
// invalid theme throws
// ──────────────────────────────────────────────────────────────────────────────

it('throws InvalidArgumentException for an unknown theme on text component', function () {
    $this->theme('bogus');

    new RoroForm\View\Components\Inputs\Text(name: 'x');
})->throws(InvalidArgumentException::class);

it('throws InvalidArgumentException for an unknown theme on select component', function () {
    $this->theme('bad-theme');

    new RoroForm\View\Components\Inputs\Select(name: 'x');
})->throws(InvalidArgumentException::class);
