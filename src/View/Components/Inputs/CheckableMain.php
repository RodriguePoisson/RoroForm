<?php

namespace RoroForm\View\Components\Inputs;

abstract class CheckableMain extends InputMain
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
        string $value = '1',
        string $placeholder = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        public bool $checked = false,
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

    /** Un champ cochable est coche des qu'une valeur non vide est repeuplee. */
    protected function onPopulated(string $item): void
    {
        $this->checked = true;
    }
}
