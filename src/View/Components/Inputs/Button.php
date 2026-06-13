<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class Button extends ComponentMain
{
    public string $wrapperClass = '';

    public function __construct(
        public string $type = 'submit',
        public ?string $id = null,
        public string $class = '',
        public ?string $formId = null,
        public string $buttonColor = 'bg-indigo-600',
        public string $buttonHoverColor = 'bg-indigo-500',
        public string $buttonTextColor = 'text-white',
        public bool $disabled = false,
        public bool $hasTopMargins = true,
        public bool $enableAjaxErrors = true,
        public bool $ajax = false,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.button");
    }
}
