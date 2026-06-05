<?php

namespace RoroForm\View\Components;

/**
 * Injects the framework-free "raw" theme stylesheet inline (once per page,
 * CSP-nonce aware). Only the raw form view renders it, so the Tailwind and
 * Bootstrap themes are unaffected.
 */
class RawStyles extends ComponentMain
{
    public function render()
    {
        return view('roroform::components.raw-styles');
    }

    public function getCssPath(): string
    {
        return __DIR__ . '/../../../resources/css/';
    }
}
