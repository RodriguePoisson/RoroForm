<?php

namespace RoroForm\View\Components;

class SelectOption extends ComponentMain
{

    public bool $hidden;
    public ?string $id;
    public ?string $value;
    public ?string $label;
    public string $class;

    /**
     * Create a new component instance.
     *
     */

    public function __construct(
        string $label = '',
        string $value = '',
        string $class = '',
        bool $hidden = false,
        ?string $id = null
    ) {
        parent::__construct();
        $this->label = $label;
        $this->value = $value;
        $this->class = $class;
        $this->hidden = $hidden;
        $this->id = $id;
        if (!$this->id) {
            $this->id = uniqid();
        }
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.select-option");
    }
}
