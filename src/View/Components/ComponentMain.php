<?php

namespace RoroForm\View\Components;

use Illuminate\View\Component;

abstract class ComponentMain extends Component
{

    public string $theme;

    public function __construct()
    {
        $this->theme = config('roroform.theme');

        if(!in_array(config('roroform.theme'),['tailwind', 'bootstrap', 'raw'])){
            throw new \InvalidArgumentException('Invalid theme specified in configuration. Available themes are: tailwind, bootstrap, raw.');

        }
    }

    abstract public function render();

    public function getJsPath():string
    {
        return '/var/www/packages/RoroForm/resources/js/dist/';
    }

}
