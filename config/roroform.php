<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Form Components Style Mode
    |--------------------------------------------------------------------------
    |
    | This option controls the default CSS framework or style mode used by
    | the form components in your package. You can switch between the
    | available modes depending on your project's frontend setup.
    |
    | Available modes:
    | - 'tailwind'  : Uses TailwindCSS classes for styling.
    | - 'bootstrap' : Uses Bootstrap classes for styling.
    | - 'raw'       : Uses plain CSS (no framework) for maximum flexibility.
    |
    | You can change this value to adjust the default look of all
    | form components across your application.
    |
    */

    'theme' => 'tailwind',

    /*
    |--------------------------------------------------------------------------
    | Default js Validation
    |--------------------------------------------------------------------------
    |
    | This option controls by default if the js validation to inputs are enabled.
    | | You can set this to false if you want to disable js validation
    | for all inputs by default. Individual components can still override this
    |
    */
    'defaultJsValidation' => true,

    /*
    |--------------------------------------------------------------------------
    | Content-Security-Policy nonce
    |--------------------------------------------------------------------------
    |
    | RoroForm injects its runtime as inline <script> (and one inline <style>)
    | blocks. Under a strict CSP (script-src without 'unsafe-inline') those need
    | a nonce. Set this to the per-request nonce so the injected tags carry it.
    |
    | A CSP nonce must rotate per response, so do NOT hard-code one in this file
    | (it would also break `config:cache`). Instead set it at runtime from your
    | CSP middleware, e.g.:
    |
    |     config(['roroform.nonce' => $request->attributes->get('csp-nonce')]);
    |     // or, with spatie/laravel-csp:  config(['roroform.nonce' => csp_nonce()]);
    |
    | Accepts: null (no nonce) | a string | a Closure returning a string.
    |
    | Note: inline `style="display:none"` *attributes* on toggled elements can't
    | carry a nonce (nonces only apply to <script>/<style> elements). Allow
    | `style-src 'unsafe-inline'` for those, or treat it as a known limitation.
    |
    */
    'nonce' => null,

];
