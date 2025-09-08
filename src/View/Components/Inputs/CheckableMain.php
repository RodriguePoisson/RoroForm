<?php

namespace RoroForm\View\Components\Inputs;

abstract class CheckableMain extends InputMain
{
    public bool $checked = false;

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
     * @param string|null $tooltip
     * @param  bool  $checked
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
        bool $checked = false,
    ) {
        parent::__construct($id, $class, $hasTopMargins, $label, $labelClass, $wrapperClass, $required, $hidden,
            $disabled, $readonly, $populate, $disableJsValidation, $value, $placeholder, $name, $enableError,$tooltip,true);

        $this->checked = $checked;
        $this->populateValue();
    }

    private function populateValue(): void
    {
        $key = $this->normalizeOldName($this->name);

        $oldValue = old($key, []);
        if (!is_array($oldValue)) {
            $oldValue = [$oldValue];
        }

        $this->populate = array_merge($oldValue, $this->populate);

        foreach ($this->populate as $item) {
            if ($item) {
                $this->value = $item;
                $this->checked = true;
                break;
            }
        }
    }

    abstract public function render();
}
