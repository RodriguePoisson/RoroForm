<?php

namespace RoroForm\View\Components\Inputs;

abstract class SelectableMain extends InputMain
{
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
        ?bool $disableJsValidation = null,
        string $value = '',
        string $placeholder = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        public array $options = [],
        public bool $searchBar = true,
        public bool $clearButton = true,
        public bool $optionsOpen = false,
        public array $values = [],
    ) {
        parent::__construct(
            id: $id,
            class: $class,
            hasTopMargins: $hasTopMargins,
            label: $label,
            labelClass: $labelClass,
            wrapperClass: $wrapperClass,
            required: $required,
            hidden: $hidden,
            disabled: $disabled,
            readonly: $readonly,
            populate: $populate,
            disableJsValidation: $disableJsValidation,
            value: $value,
            placeholder: $placeholder,
            name: $name,
            enableError: $enableError,
            tooltip: $tooltip,
        );
    }
}
