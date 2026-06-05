<?php

namespace RoroForm\View\Components;

class SelectCategory extends ComponentMain
{
    public function __construct(
        public string $category = '',
        public string $class = '',
        public bool $hidden = false,
        public ?string $id = null,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.select-category");
    }
}
