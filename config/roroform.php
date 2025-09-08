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

];
