<?php

namespace RoroForm\View\Components;

class Overlay extends ComponentMain
{
    public bool $spinner;
    public bool $visible;

    /**
     * Create a new component instance.
     *
     * @param bool $spinner
     */

    public function __construct(bool $spinner = true, bool $visible = false)
    {
        parent::__construct();
        $this->spinner = $spinner;
        $this->visible = $visible;
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.overlay");
    }
}
