<?php

/**
 * Renders one of every component inside a full form. Doubles as (1) a smoke
 * test — the documented kitchen-sink form compiles and renders without error —
 * and (2) a warm-up that compiles every shared Blade partial into the view
 * cache, so the rest of the suite can run in parallel without racing the
 * Blade compiler on the same files.
 */

function kitchenSink(): string
{
    return <<<'BLADE'
    <x-roro-form id="demo" action="/x" :multipart="true">
        <x-roro-text name="first_name" label="First name" :required="true"/>
        <x-roro-email name="email" label="Email"/>
        <x-roro-password name="password" label="Password"/>
        <x-roro-url name="website" label="Website"/>
        <x-roro-tel name="phone" label="Phone"/>
        <x-roro-number name="age" label="Age"/>
        <x-roro-hidden name="token" value="abc"/>
        <x-roro-date name="dob" label="DOB"/>
        <x-roro-time name="t" label="Time"/>
        <x-roro-datetime-local name="dt" label="When"/>
        <x-roro-month name="m" label="Month"/>
        <x-roro-week name="w" label="Week"/>
        <x-roro-range name="sat" label="Satisfaction" step="5"/>
        <x-roro-color name="c" label="Colour"/>
        <x-roro-checkbox name="newsletter" label="Subscribe" position="right"/>
        <x-roro-radio-container name="plan" label="Plan">
            <x-roro-radio name="plan" value="free" label="Free"/>
            <x-roro-radio name="plan" value="pro" label="Pro"/>
        </x-roro-radio-container>
        <x-roro-select name="country" label="Country"
            :options="['Europe' => ['fr' => 'France', 'es' => 'Spain']]" value="fr"/>
        <x-roro-multi-select name="tags[]" label="Tags" :values="['a']"
            :options="['a' => 'Alpha', 'b' => 'Beta']"/>
        <x-roro-file name="docs[]" :multiple="true" label="Documents"/>
        <x-roro-repeatable name="contacts" label="Contacts" item-label="Contact"
            :min="1" :max="5" :reorder="true">
            <x-roro-text name="name" label="Name" :required="true"/>
            <x-roro-select name="type" :options="['mobile' => 'Mobile', 'home' => 'Home']" label="Type"/>
        </x-roro-repeatable>
        <x-roro-button :ajax="true" form-id="demo">Submit</x-roro-button>
    </x-roro-form>
    BLADE;
}

it('renders the full kitchen-sink form without error (tailwind)', function () {
    $html = $this->theme('tailwind')->render(kitchenSink());

    expect($html)
        ->toContain('id="demo"')
        ->toContain('roro-wrapper-')
        ->toContain('roro-wrapper-repeatable')
        ->toContain('roro-btn-submit')
        // the form view inlines the JS runtime
        ->toContain('window.roro');
});

it('renders the full kitchen-sink form without error (bootstrap)', function () {
    $html = $this->theme('bootstrap')->render(kitchenSink());

    expect($html)
        ->toContain('id="demo"')
        ->toContain('roro-wrapper-repeatable');
});
