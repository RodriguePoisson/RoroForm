<?php

namespace RoroForm\View\Components\Inputs;

class Hidden extends InputMain
{
    /**
     * Create a new component instance.
     *
     * @param  string|null  $id
     * @param  string  $class
     * @param  bool  $hasTopMargins
     * @param  string|null  $label
     * @param  string  $labelClass
     * @param  string  $wrapperClass
     * @param  string  $name
     * @param  string  $value
     * @param  bool  $required
     * @param  bool  $hidden
     * @param  bool  $disabled
     * @param  bool  $readonly
     * @param  array  $populate
     * @param  bool  $disableJsValidation
     * @param  string  $placeholder
     * @param  bool  $enableError
     * @param ?string $tooltip
     */

    public function __construct(
        ?string $id = null,
        string $class = '',
        bool $hasTopMargins = true
        ,
        ?string $label = null,
        string $labelClass = '',
        string $wrapperClass = '',
        bool $required = false,
        bool $hidden = false,
        bool $disabled = false,
        bool $readonly = false,
        array $populate = [],
        bool $disableJsValidation = null,
        string $value = '',
        string $placeholder = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
    ) {
        parent::__construct($id, $class, $hasTopMargins, $label, $labelClass, $wrapperClass, $required, $hidden,
            $disabled, $readonly, $populate, $disableJsValidation, $value, $placeholder, $name, $enableError,$tooltip);
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.hidden");
    }
}
