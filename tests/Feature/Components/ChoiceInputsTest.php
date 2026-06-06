<?php

// -------------------------------------------------------------------------
// Choice input tests: checkbox, radio, radio-container (tailwind + bootstrap)
// -------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Checkbox – basic rendering
// ---------------------------------------------------------------------------

it('checkbox renders name and type attributes', function () {
    $html = $this->render('<x-roro-checkbox name="newsletter" id="newsletter"/>');

    expect($html)
        ->toContain('type="checkbox"')
        ->toContain('name="newsletter"')
        ->toContain('id="newsletter"');
});

it('checkbox renders the roro classes on the input and wrapper', function () {
    $html = $this->render('<x-roro-checkbox name="tos" id="tos"/>');

    expect($html)
        ->toContain('roro-wrapper roro-wrapper-checkbox')
        ->toContain('roro-input roro-input-checkbox');
});

it('checkbox wrapper id follows convention', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree"/>');

    expect($html)->toContain('id="roro-wrapper-agree"');
});

// ---------------------------------------------------------------------------
// Checkbox – label rendering and position
// ---------------------------------------------------------------------------

it('checkbox renders a label when the label prop is provided', function () {
    $html = $this->render('<x-roro-checkbox name="newsletter" id="nl" label="Subscribe"/>');

    expect($html)
        ->toContain('id="label-nl"')
        ->toContain('for="nl"')
        ->toContain('roro-label roro-label-checkbox')
        ->toContain('Subscribe');
});

it('checkbox omits the label element when no label is given', function () {
    $html = $this->render('<x-roro-checkbox name="newsletter" id="nl"/>');

    expect($html)->not->toContain('id="label-nl"');
});

it('checkbox label appears AFTER the input in the DOM (default layout — label right of input)', function () {
    $html = $this->render('<x-roro-checkbox name="newsletter" id="nl" label="Subscribe"/>');

    // The input element must come before the label element in the output.
    $inputPos = strpos($html, 'type="checkbox"');
    $labelPos = strpos($html, 'id="label-nl"');

    expect($inputPos)->toBeLessThan($labelPos);
});

// ---------------------------------------------------------------------------
// Checkbox – checked state
// ---------------------------------------------------------------------------

it('checkbox is not checked by default', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree"/>');

    expect($html)->not->toContain('checked');
});

it('checkbox is checked when :checked="true" is passed explicitly', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" :checked="true"/>');

    expect($html)->toContain('checked');
});

it('checkbox is checked when a truthy old() value is present for its name', function () {
    $html = $this->withOld(['newsletter' => '1'])
        ->render('<x-roro-checkbox name="newsletter" id="nl"/>');

    expect($html)->toContain('checked');
});

it('checkbox is not checked when old() value is empty/falsy for its name', function () {
    $html = $this->withOld(['newsletter' => ''])
        ->render('<x-roro-checkbox name="newsletter" id="nl"/>');

    expect($html)->not->toContain('checked');
});

it('checkbox is checked when populate array contains a truthy value', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" :populate="[\'1\']"/>');

    expect($html)->toContain('checked');
});

// ---------------------------------------------------------------------------
// Checkbox – value attribute
// ---------------------------------------------------------------------------

it('checkbox emits value="1" by default', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree"/>');

    expect($html)->toContain('value="1"');
});

it('checkbox emits a custom value attribute when provided', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" value="yes"/>');

    expect($html)->toContain('value="yes"');
});

// ---------------------------------------------------------------------------
// Checkbox – required / disabled / hidden
// ---------------------------------------------------------------------------

it('checkbox emits required attribute when defaultJsValidation is on and :required is true', function () {
    $html = $this->defaultJsValidation(true)
        ->render('<x-roro-checkbox name="agree" id="agree" :required="true" label="Agree"/>');

    expect($html)->toContain('required');
});

it('checkbox omits required attribute when defaultJsValidation is off', function () {
    $html = $this->defaultJsValidation(false)
        ->render('<x-roro-checkbox name="agree" id="agree" :required="true" label="Agree"/>');

    // The input itself must not carry the native HTML required attribute.
    // aria-required is fine; the label may also show a required marker via x-roro-required-label.
    $inputBlock = substr($html, strpos($html, 'type="checkbox"'), 300);
    expect($inputBlock)->not->toMatch('/(?<!\w)required(?!=)/');
});

it('checkbox emits disabled attribute when :disabled is true', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" :disabled="true"/>');

    expect($html)->toContain('disabled');
});

it('checkbox wrapper is hidden when :hidden is true', function () {
    $html = $this->render('<x-roro-checkbox name="agree" id="agree" :hidden="true"/>');

    expect($html)->toContain('display:none');
});

// ---------------------------------------------------------------------------
// Checkbox – Bootstrap theme
// ---------------------------------------------------------------------------

it('checkbox renders bootstrap classes in bootstrap theme', function () {
    $html = $this->theme('bootstrap')
        ->render('<x-roro-checkbox name="agree" id="agree" label="Agree"/>');

    expect($html)
        ->toContain('roro-wrapper roro-wrapper-checkbox')
        ->toContain('roro-input roro-input-checkbox')
        ->toContain('form-check-input')
        ->toContain('form-check-label');
});

it('checkbox label appears AFTER the input in bootstrap theme too', function () {
    $html = $this->theme('bootstrap')
        ->render('<x-roro-checkbox name="agree" id="agree" label="Agree"/>');

    $inputPos = strpos($html, 'type="checkbox"');
    $labelPos = strpos($html, 'id="label-agree"');

    expect($inputPos)->toBeLessThan($labelPos);
});

// ---------------------------------------------------------------------------
// Radio – basic rendering
// ---------------------------------------------------------------------------

it('radio renders type, name, value and id attributes', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free"/>');

    expect($html)
        ->toContain('type="radio"')
        ->toContain('name="plan"')
        ->toContain('value="free"')
        ->toContain('id="plan-free"');
});

it('radio renders roro classes on input and wrapper', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free"/>');

    expect($html)
        ->toContain('roro-wrapper roro-wrapper-radio')
        ->toContain('roro-input roro-input-radio');
});

it('radio wrapper id follows convention', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free"/>');

    expect($html)->toContain('id="roro-wrapper-plan-free"');
});

it('radio renders its label when provided', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free" label="Free plan"/>');

    expect($html)
        ->toContain('id="label-plan-free"')
        ->toContain('for="plan-free"')
        ->toContain('roro-label roro-label-radio')
        ->toContain('Free plan');
});

// ---------------------------------------------------------------------------
// Radio – checked state via :checked prop
// ---------------------------------------------------------------------------

it('radio is not checked by default', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free"/>');

    // ' checked ' (space on both sides) distinguishes the HTML attribute from
    // the Tailwind utility classes that start with 'checked:' in the class attr.
    expect($html)->not->toContain(' checked ');
});

it('radio is checked when :checked="true" is passed explicitly', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free" :checked="true"/>');

    expect($html)->toContain(' checked ');
});

// ---------------------------------------------------------------------------
// Radio – checked state via old() (value matching)
// ---------------------------------------------------------------------------

it('radio with matching old() value is checked', function () {
    $html = $this->withOld(['plan' => 'pro'])
        ->render('<x-roro-radio name="plan" value="pro" id="plan-pro"/>');

    expect($html)->toContain(' checked ');
});

it('radio with non-matching old() value is not checked', function () {
    $html = $this->withOld(['plan' => 'pro'])
        ->render('<x-roro-radio name="plan" value="free" id="plan-free"/>');

    expect($html)->not->toContain(' checked ');
});

it('radio with matching old() value is checked while sibling is not (full group)', function () {
    $blade = <<<'BLADE'
        <x-roro-radio name="plan" value="free" id="plan-free"/>
        <x-roro-radio name="plan" value="pro"  id="plan-pro"/>
    BLADE;

    $html = $this->withOld(['plan' => 'pro'])->render($blade);

    // The pro radio wrapper must contain the checked attribute; free one must not.
    // Use ' checked ' to distinguish from Tailwind's 'checked:' utility classes.
    $freeWrapperEnd = strpos($html, 'id="roro-wrapper-plan-pro"');
    $freeSection    = substr($html, 0, $freeWrapperEnd);
    $proSection     = substr($html, $freeWrapperEnd);

    expect($freeSection)->not->toContain(' checked ');
    expect($proSection)->toContain(' checked ');
});

// ---------------------------------------------------------------------------
// Radio – checked state via :populate prop
// ---------------------------------------------------------------------------

it('radio is checked when populate matches its value', function () {
    $html = $this->render('<x-roro-radio name="plan" value="pro" id="plan-pro" :populate="[\'pro\']"/>');

    expect($html)->toContain(' checked ');
});

it('radio is not checked when populate does not match its value', function () {
    $html = $this->render('<x-roro-radio name="plan" value="free" id="plan-free" :populate="[\'pro\']"/>');

    expect($html)->not->toContain(' checked ');
});

// ---------------------------------------------------------------------------
// Radio – bootstrap theme
// ---------------------------------------------------------------------------

it('radio renders bootstrap classes in bootstrap theme', function () {
    $html = $this->theme('bootstrap')
        ->render('<x-roro-radio name="plan" value="free" id="plan-free" label="Free"/>');

    expect($html)
        ->toContain('roro-input roro-input-radio')
        ->toContain('form-check-input')
        ->toContain('form-check-label');
});

// ---------------------------------------------------------------------------
// RadioContainer – basic rendering
// ---------------------------------------------------------------------------

it('radio-container renders a fieldset with roro-wrapper-radio-container class', function () {
    $html = $this->render('<x-roro-radio-container name="plan" label="Pick a plan"/>');

    expect($html)
        ->toContain('<fieldset')
        ->toContain('roro-wrapper-radio-container');
});

it('radio-container renders its legend label', function () {
    $html = $this->render('<x-roro-radio-container name="plan" label="Subscription plan"/>');

    expect($html)->toContain('Subscription plan');
});

it('radio-container renders an optional subtitle paragraph', function () {
    $html = $this->render(
        '<x-roro-radio-container name="plan" label="Plan" subtitle="Choose wisely"/>'
    );

    expect($html)->toContain('Choose wisely');
});

it('radio-container omits the subtitle element when subtitle is not provided', function () {
    $html = $this->render('<x-roro-radio-container name="plan" label="Plan"/>');

    // No <p> tag for subtitle should be present.
    expect($html)->not->toContain('Choose wisely');
});

it('radio-container renders slotted radios inside its inner div', function () {
    $blade = <<<'BLADE'
        <x-roro-radio-container name="plan" label="Plan">
            <x-roro-radio name="plan" value="free"  id="plan-free"  label="Free"/>
            <x-roro-radio name="plan" value="basic" id="plan-basic" label="Basic"/>
            <x-roro-radio name="plan" value="pro"   id="plan-pro"   label="Pro"/>
        </x-roro-radio-container>
    BLADE;

    $html = $this->render($blade);

    expect($html)
        ->toContain('name="plan"')
        ->toContain('value="free"')
        ->toContain('value="basic"')
        ->toContain('value="pro"');
});

it('radio-container passes no checked state to radios (noPopulate is true)', function () {
    // RadioContainer sets noPopulate=true; old() should not make radios inside
    // the container automatically checked — each radio handles its own old().
    $blade = <<<'BLADE'
        <x-roro-radio-container name="plan" label="Plan" :populate="['pro']">
            <x-roro-radio name="plan" value="free" id="plan-free"/>
            <x-roro-radio name="plan" value="pro"  id="plan-pro"/>
        </x-roro-radio-container>
    BLADE;

    // The container itself should not emit a checked attribute.
    $html = $this->render($blade);

    // The container's fieldset should not carry "checked"; radios do their own.
    expect($html)->toContain('roro-wrapper-radio-container');
});

it('radio-container applies a custom fieldsetClass to the fieldset element', function () {
    $html = $this->render(
        '<x-roro-radio-container name="plan" label="Plan" fieldsetClass="border-special"/>'
    );

    expect($html)->toContain('border-special');
});

it('radio-container renders bootstrap classes in bootstrap theme', function () {
    $html = $this->theme('bootstrap')
        ->render('<x-roro-radio-container name="plan" label="Plan"/>');

    expect($html)
        ->toContain('roro-wrapper-radio-container')
        ->toContain('<fieldset');
});

// ---------------------------------------------------------------------------
// RadioContainer + Radio – integrated old() repopulation
// ---------------------------------------------------------------------------

it('the correct radio is checked via old() when rendered inside a container', function () {
    $blade = <<<'BLADE'
        <x-roro-radio-container name="color" label="Colour">
            <x-roro-radio name="color" value="red"   id="color-red"/>
            <x-roro-radio name="color" value="green" id="color-green"/>
            <x-roro-radio name="color" value="blue"  id="color-blue"/>
        </x-roro-radio-container>
    BLADE;

    $html = $this->withOld(['color' => 'green'])->render($blade);

    // Locate each radio's wrapper section to scope the assertion.
    $redEnd   = strpos($html, 'id="roro-wrapper-color-green"');
    $greenEnd = strpos($html, 'id="roro-wrapper-color-blue"');

    $redSection   = substr($html, 0, $redEnd);
    $greenSection = substr($html, $redEnd, $greenEnd - $redEnd);
    $blueSection  = substr($html, $greenEnd);

    // Use ' checked ' to distinguish the HTML attribute from Tailwind 'checked:' classes.
    expect($redSection)->not->toContain(' checked ');
    expect($greenSection)->toContain(' checked ');
    expect($blueSection)->not->toContain(' checked ');
});
