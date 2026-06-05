<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class Error extends ComponentMain
{
    public function __construct(
        public ?string $error = null,
        public ?string $id = null,
        public bool $hidden = false,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.error");
    }
}
