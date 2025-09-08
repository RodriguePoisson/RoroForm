<?php

namespace RoroForm\View\Components;

class SelectCategory extends ComponentMain
{

    public bool $hidden;
    public ?string $id;
    public ?string $category;
    public string $class;

    /**
     * Create a new component instance.
     *
     */

    public function __construct(
        string $category = '',
        string $class = '',
        bool $hidden = false,
        ?string $id = null
    ) {
        parent::__construct();
        $this->category = $category;
        $this->class = $class;
        $this->hidden = $hidden;
        $this->id = $id;
        if (!$this->id) {
            $this->id = uniqid();
        }
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.select-category");
    }
}
