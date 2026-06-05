<?php

namespace RoroForm\View\Components\Inputs;

class RadioContainer extends InputMain
{
    protected string $view = 'inputs.radio-container';

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
        string $value = '1',
        string $placeholder = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        public ?string $subtitle = null,
        public string $subtitleClass = '',
        public string $fieldsetClass = '',
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
            noPopulate: true,
        );
    }
}
