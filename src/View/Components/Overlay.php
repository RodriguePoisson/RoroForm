<?php

namespace RoroForm\View\Components;

class Overlay extends ComponentMain
{
    public function __construct(
        public bool $spinner = true,
        public bool $visible = false,
    ) {
        parent::__construct();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.overlay");
    }
}
