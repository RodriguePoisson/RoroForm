<?php

namespace RoroForm\View\Components\Inputs;

class RadioContainer extends InputMain
{
    public ?string $subtitle;
    public string $subtitleClass;
    public string $fieldsetClass;

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
     * @param  string  $fieldsetClass
     * @param  bool  $disableJsValidation
     * @param  string|null  $subtitle
     * @param  bool  $enableError
     * @param  string|null  $tooltip
     * @param  string  $subtitleClass
     * @param  string  $placeholder
     */

    public function __construct(
        ?string $id = null,
        string $class = '',
        bool $hasTopMargins = true,
        ?string $label = null,
        string $labelClass = '',
        string $wrapperClass = '',
        bool $required = false,
        bool $hidden = false,
        bool $disabled = false,
        bool $readonly = false,
        array $populate = [],
        bool $disableJsValidation = null,
        string $value = '1',
        string $placeholder = '',
        string $fieldsetClass = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        ?string $subtitle = null,
        string $subtitleClass = '',
    ) {
        parent::__construct($id, $class, $hasTopMargins, $label, $labelClass, $wrapperClass, $required, $hidden,
            $disabled, $readonly, $populate, $disableJsValidation, $value, $placeholder, $name, $enableError,$tooltip, true);

        $this->subtitle = $subtitle;
        $this->subtitleClass = $subtitleClass;
        $this->fieldsetClass = $fieldsetClass;
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.radio-container");
    }
}
