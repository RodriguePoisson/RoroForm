<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

abstract class InputMain extends ComponentMain
{
    /** Vue Blade rendue (relative au theme). Definie par chaque feuille. */
    protected string $view;

    /** Message d'erreur de validation, calcule a la construction. */
    public ?string $error = null;

    public function __construct(
        public ?string $id = null,
        public string $class = '',
        public bool $hasTopMargins = true,
        public ?string $label = null,
        public string $labelClass = '',
        public string $wrapperClass = '',
        public bool $required = false,
        public bool $hidden = false,
        public bool $disabled = false,
        public bool $readonly = false,
        public array $populate = [],
        public ?bool $disableJsValidation = null,
        public string $value = '',
        public string $placeholder = '',
        public string $name = '',
        public bool $enableError = true,
        public ?string $tooltip = null,
        public bool $noPopulate = false,
    ) {
        parent::__construct();

        $this->id ??= uniqid();
        $this->disableJsValidation ??= !config('roroform.defaultJsValidation');

        $this->getError();

        if (!$this->noPopulate) {
            $this->populateValue();
        }
    }

    public function render()
    {
        return view("roroform::components.{$this->theme}.{$this->view}");
    }

    protected function normalizeOldName(string $name): string
    {
        $name = preg_replace('/\[(\w*)\]/', '.$1', $name);

        return rtrim($name, '.');
    }

    /** Valeurs `old()` (apres echec de validation), toujours normalisees en tableau. */
    protected function resolveOld(): array
    {
        $old = old($this->normalizeOldName($this->name), []);

        return is_array($old) ? $old : [$old];
    }

    protected function populateValue(): void
    {
        $this->populate = array_merge($this->resolveOld(), $this->populate);

        foreach ($this->populate as $item) {
            if ($item) {
                $this->value = $item;
                $this->onPopulated($item);
                break;
            }
        }
    }

    /** Hook surchargeable : appele quand une valeur non vide a ete repeuplee. */
    protected function onPopulated(string $item): void {}

    protected function getError(): void
    {
        $errors = session('errors');
        $this->error = $errors ? $errors->first($this->normalizeOldName($this->name)) : '';
    }
}
