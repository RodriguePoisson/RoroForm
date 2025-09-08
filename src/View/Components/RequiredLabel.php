<?php

namespace RoroForm\View\Components;

class RequiredLabel extends ComponentMain
{
    public function render()
    {
        return view("roroform::components.{$this->theme}.required-label");
    }
}
