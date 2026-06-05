<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class BorderError extends ComponentMain
{
    public function __construct(
        public ?string $id = null,
        public bool $hidden = false,
        public string $wrapperClass = '',
        public ?string $padding = null,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.border-error");
    }
}
