<?php

namespace RoroForm\View\Components;

/**
 * Base commune des petits composants "label + valeur" rendus a la demande
 * (option de select, tag de multi-select). Seule la vue change.
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
