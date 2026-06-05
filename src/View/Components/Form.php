<?php

namespace RoroForm\View\Components;

class Form extends ComponentMain
{
    public string $method;
    public bool $csrf;

    public function __construct(
        public string $action = '',
        string $method = 'POST',
        public ?string $id = null,
        public string $class = '',
        public bool $multipart = false,
        public ?string $enctype = null,
        public bool $overlay = true,
    ) {
        parent::__construct();

        $this->method = strtoupper($method);
        $this->csrf = in_array($this->method, ['POST', 'PUT', 'PATCH', 'DELETE']);

        $this->id ??= uniqid();

        // Un enctype explicite prend le pas sur le raccourci multipart.
        if ($this->enctype) {
            $this->multipart = false;
        }
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.form");
    }
}
