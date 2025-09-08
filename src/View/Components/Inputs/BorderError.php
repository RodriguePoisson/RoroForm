<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class BorderError extends ComponentMain
{
    public ?string $id;
    public bool $hidden;
    public ?string $padding;
    public string $wrapperClass;

    public function __construct($id = null,$hidden = false, $wrapperClass = '',?string $padding = null,)
    {
        parent::__construct();
        $this->id = $id;
        if(!$this->id){
            $this->id = uniqid();
        }
        $this->hidden = $hidden;
        $this->padding = $padding;
        $this->wrapperClass = $wrapperClass;
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.border-error");
    }
}
