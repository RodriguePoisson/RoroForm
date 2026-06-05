<?php

use RoroForm\RoroFormServiceProvider;

it('merges the package config so the defaults exist without publishing', function () {
    // Simulate a fresh app that has no roroform config of its own, then run the
    // provider's register() which calls mergeConfigFrom() to fill the defaults.
    config()->set('roroform', []);

    (new RoroFormServiceProvider($this->app))->register();

    expect(config('roroform.theme'))->toBe('tailwind')
        ->and(config('roroform.defaultJsValidation'))->toBeTrue();
});

it('keeps an app-provided value and only fills the gaps', function () {
    // The app set a theme but nothing else; merge must not clobber it.
    config()->set('roroform', ['theme' => 'bootstrap']);

    (new RoroFormServiceProvider($this->app))->register();

    expect(config('roroform.theme'))->toBe('bootstrap')
        ->and(config('roroform.defaultJsValidation'))->toBeTrue();
});

it('renders a component using the merged default theme', function () {
    config()->set('roroform', []);
    (new RoroFormServiceProvider($this->app))->register();

    $html = $this->render('<x-roro-text name="x" id="x" />');

    expect($html)->toContain('roro-input-text');
});
