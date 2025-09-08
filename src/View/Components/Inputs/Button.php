<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

class Button extends ComponentMain
{
    public string $type;
    public string $wrapperClass='';
    public ?string $id;
    public string $class;
    public bool $hasTopMargins;
    public bool $disabled;
    public string $buttonColor;
    public string $buttonHoverColor;
    public string $buttonTextColor;
    public ?string $formId;
    public bool $ajax;
    public bool $enableAjaxErrors;

    /**
     * Create a new component instance.
     *
     * @param string|null $id
     * @param string $class
     * @param bool $hasTopMargins
     * @param string|null $formId
     * @param string $buttonColor
     * @param string $buttonHoverColor
     * @param string $buttonTextColor
     * @param bool $disabled
     * @param bool $enableAjaxErrors;
     * @param bool $ajax
     */

    public function __construct(
        string $type = 'submit',
        ?string $id = null,
        string $class = '',
        ?string $formId = null,
        string $buttonColor = 'bg-blue-600',
        string $buttonHoverColor = 'bg-blue-700',
        string $buttonTextColor = 'text-white',
        bool $disabled = false,
        bool $hasTopMargins = true,
        bool $enableAjaxErrors = true,
        bool $ajax = false)
    {
        parent::__construct();
        $this->type = $type;
        $this->ajax = $ajax;
        $this->buttonColor = $buttonColor;
        $this->buttonTextColor = $buttonTextColor;
        $this->buttonHoverColor = $buttonHoverColor;
        $this->formId = $formId;
        $this->hasTopMargins = $hasTopMargins;
        $this->disabled = $disabled;
        $this->id = $id;
        if (!$this->id) {
            $this->id = uniqid();
        }
        $this->class = $class;
        $this->enableAjaxErrors = $enableAjaxErrors;
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.inputs.button");
    }
}
