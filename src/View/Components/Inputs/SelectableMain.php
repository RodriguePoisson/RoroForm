<?php

namespace RoroForm\View\Components\Inputs;

abstract class SelectableMain extends InputMain
{
    public array $options;
    public bool $searchBar;
    public bool $clearButton;
    public bool $optionsOpen;

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
     * @param array $options
     * @param  bool  $enableError
     * @param string|null $tooltip
     * @param bool $searchBar
     * @param bool $clearButton
     * @param bool $optionsOpen
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
        bool $enableError =true,
        ?string $tooltip = null,
        array $options = [],
        bool $searchBar = true,
        bool $clearButton = true,
        bool $optionsOpen = false,
    ) {
        parent::__construct($id, $class, $hasTopMargins, $label, $labelClass, $wrapperClass, $required, $hidden,
            $disabled, $readonly, $populate, $disableJsValidation, $value, $placeholder, $name, $enableError,$tooltip);

        $this->options = $options;
        $this->searchBar = $searchBar;
        $this->clearButton = $clearButton;
        $this->optionsOpen = $optionsOpen;
    }

    abstract public function render();
}
