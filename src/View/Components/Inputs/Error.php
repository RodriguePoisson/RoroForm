<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class Error extends ComponentMain
{

    public ?string $error;
    public ?string $id;
    public bool $hidden;

    public function __construct($error = null,$id = null,$hidden = false)
    {
        parent::__construct();
        $this->error = $error;
        $this->id = $id;
        if(!$this->id){
            $this->id = uniqid();
        }
        $this->hidden = $hidden;
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.error");
    }
}
