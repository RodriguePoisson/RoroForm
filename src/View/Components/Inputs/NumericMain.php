<?php

namespace RoroForm\View\Components\Inputs;

abstract class NumericMain extends InputMain
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
        public string $min = '',
        public string $max = '',
        public string $step = '1',
        public ?string $list = null,
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
