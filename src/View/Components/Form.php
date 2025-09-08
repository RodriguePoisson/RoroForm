<?php

namespace RoroForm\View\Components;

class Form extends ComponentMain
{
    public string $action;
    public string $method;
    public ?string $id;
    public string $class;
    public bool $multipart;
    public ?string $enctype;
    public bool $csrf;
    public bool $overlay;

    /**
     * Create a new component instance.
     *
     * @param string $action
     * @param string $method
     * @param string|null $id
     * @param string $class
     * @param bool $multipart
     * @param string|null $enctype
     * @param bool $csrf
     */
    public function __construct(string $action = '', string $method = 'POST', ?string $id = null, string $class = '',bool $multipart = false,string $enctype = null,$overlay=true,)
    {
        parent::__construct();
        $this->action = $action;
        $this->method = strtoupper($method);
        if($this->method == 'POST' || $this->method == 'PUT' || $this->method == 'PATCH' || $this->method == 'DELETE') {
            $this->csrf = true;
        }else{
            $this->csrf = false;
        }
        $this->multipart = $multipart;
        $this->id = $id;
        if(!$this->id){
            $this->id = uniqid();
        }

        $this->enctype = $enctype;
        if($this->enctype){
            $this->multipart = false;
        }
        $this->class = $class;
        $this->overlay = $overlay;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return view("roroform::components.{$this->theme}.form");
    }
}
