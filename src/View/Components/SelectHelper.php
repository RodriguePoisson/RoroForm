<?php

namespace RoroForm\View\Components;

class SelectHelper extends ComponentMain
{

    /**
     * Create a new component instance.
     *
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function render()
    {
        return view("roroform::components.select-helper");
    }
}
