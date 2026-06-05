<?php

namespace RoroForm\View\Components;

class Spinner extends ComponentMain
{
    public function __construct(
        public bool $visible = false,
        public ?string $id = null,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.spinner");
    }
}
