<?php

namespace RoroForm\View\Components\Inputs;

use RoroForm\View\Components\ComponentMain;

abstract class InputMain extends ComponentMain
{
    /** Blade view to render (relative to the theme), set by each leaf. */
    protected string $view;

    /** Validation error message, computed at construction time. */
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

    /** old() values (after a failed validation), always normalized to an array. */
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

    /** Overridable hook: called when a non-empty value has been repopulated. */
    protected function onPopulated(string $item): void {}

    protected function getError(): void
    {
        $errors = session('errors');
        $this->error = $errors ? $errors->first($this->normalizeOldName($this->name)) : '';
    }
}
