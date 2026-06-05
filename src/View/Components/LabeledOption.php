<?php

namespace RoroForm\View\Components;

/**
 * Shared base for the small "label + value" components (select option,
 * multi-select tag). Only the view differs.
 */
abstract class LabeledOption extends ComponentMain
{
    protected string $view;

    public function __construct(
        public string $label = '',
        public string $value = '',
        public string $class = '',
        public bool $hidden = false,
        public ?string $id = null,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.{$this->view}");
    }
}
