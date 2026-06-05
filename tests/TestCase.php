<?php

namespace RoroForm\Tests;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\MessageBag;
use Illuminate\Support\ViewErrorBag;
use Orchestra\Testbench\TestCase as Orchestra;
use RoroForm\RoroFormServiceProvider;

abstract class TestCase extends Orchestra
{
    /** Register the package so the <x-roro-*> components resolve. */
    protected function getPackageProviders($app): array
    {
        return [RoroFormServiceProvider::class];
    }

    /**
     * The service provider does not merge the package config, so a real app
     * must publish it. Tests provide it explicitly (and can swap the theme).
     */
    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('roroform.theme', 'tailwind');
        $app['config']->set('roroform.defaultJsValidation', true);
    }

    /** Render a Blade string against the registered RoroForm components. */
    protected function render(string $template, array $data = []): string
    {
        return Blade::render($template, $data);
    }

    /** Switch the active theme for the duration of a test. */
    protected function theme(string $theme): static
    {
        config()->set('roroform.theme', $theme);

        return $this;
    }

    /** Toggle the package-wide default for the HTML `required` attribute. */
    protected function defaultJsValidation(bool $enabled): static
    {
        config()->set('roroform.defaultJsValidation', $enabled);

        return $this;
    }

    /**
     * Simulate Laravel's old() input (the repopulation source after a failed
     * validation). The session is bound to the current request so old() resolves.
     */
    protected function withOld(array $old): static
    {
        $session = $this->app['session']->driver();
        $session->put('_old_input', $old);
        $this->app['request']->setLaravelSession($session);

        return $this;
    }

    /** Simulate a validation error bag, as read by InputMain::getError(). */
    protected function withErrors(array $errors): static
    {
        $session = $this->app['session']->driver();
        $bag = new ViewErrorBag();
        $bag->put('default', new MessageBag($errors));
        $session->put('errors', $bag);
        $this->app['request']->setLaravelSession($session);

        return $this;
    }
}
