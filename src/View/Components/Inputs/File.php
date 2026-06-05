<?php

namespace RoroForm\View\Components\Inputs;

class File extends InputMain
{
    public string $type = 'file';
    protected string $view = 'inputs.file';

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
        public bool $multiple = true,
        public string $accept = '',
        public string $maxSize = '',
        public string $requirementsText = '',
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
