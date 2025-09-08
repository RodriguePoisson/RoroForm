<?php

namespace RoroForm\View\Components;

class Spinner extends ComponentMain
{

    public bool $visible;
    public ?string $id;
    /**
     * Create a new component instance.
     *
     */

    public function __construct(bool $visible = false, ?string $id = null)
    {
        parent::__construct();
        $this->visible = $visible;
        $this->id = $id;
        if(!$this->id) {
            $this->id = uniqid();
        }
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.spinner");
    }
}
