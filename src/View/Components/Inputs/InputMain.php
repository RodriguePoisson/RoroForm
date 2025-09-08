<?php

namespace RoroForm\View\Components\Inputs;

use Illuminate\Support\MessageBag;
use RoroForm\View\Components\ComponentMain;

abstract class InputMain extends ComponentMain
{
    public ?string $id;
    public string $class;
    public bool $hasTopMargins;
    public ?string $label;
    public string $labelClass;
    public string $name;
    public string $value;
    public bool $required;
    public bool $hidden;
    public string $wrapperClass;
    public array $populate;
    public bool $disableJsValidation;
    public string $placeholder;
    public ?string $error = null;
    public bool $noPopulate;
    public bool $enableError;
    public bool $disabled;
    public bool $readonly;
    public ?string $tooltip;

    /**
     * Create a new component instance.
     *
     * @param  string|null  $id
     * @param  string  $class
     * @param  bool  $hasTopMargins
     * @param  string|null  $label
     * @param  string  $labelClass
     * @param  string  $wrapperClass
     * @param  string  $name
     * @param  string  $value
     * @param  bool  $required
     * @param  bool  $hidden
     * @param  bool  $disabled
     * @param  bool  $readonly
     * @param  array  $populate
     * @param  bool  $disableJsValidation
     * @param  bool  $noPopulate
     * @param  string  $placeholder
     * @param string|null $tooltip
     * @param  bool  $enableError
     */

    public function __construct(
        ?string $id = null,
        string $class = '',
        bool $hasTopMargins = true,
        ?string $label = null,
        string $labelClass = '',
        string $wrapperClass = '',
        bool $required = false,
        bool $hidden = false,
        bool $disabled = false,
        bool $readonly = false,
        array $populate = [],
        ?bool $disableJsValidation = null,
        string $value = '',
        string $placeholder = '',
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        bool $noPopulate = false,
    ) {
        parent::__construct();
        $this->disableJsValidation = $disableJsValidation ?? !config('roroform.defaultJsValidation');
        $this->id = $id;
        if (!$this->id) {
            $this->id = uniqid();
        }
        $this->class = $class;
        $this->hasTopMargins = $hasTopMargins;
        $this->label = $label;
        $this->name = $name;
        $this->required = $required;
        $this->hidden = $hidden;
        $this->value = $value;
        $this->placeholder = $placeholder;
        $this->labelClass = $labelClass;
        $this->populate = $populate;
        $this->wrapperClass = $wrapperClass;
        $this->readonly = $readonly;
        $this->disabled = $disabled;
        $this->enableError = $enableError;
        $this->tooltip = $tooltip;
        $this->getError();

        $this->noPopulate = $noPopulate;
        if (!$this->noPopulate) {
            $this->populateValue();
        }
    }

    protected function normalizeOldName(string $name): string
    {
        $name = preg_replace('/\[(\w*)\]/', '.$1', $name);
        $name = rtrim($name, '.');
        return $name;
    }

    private function populateValue(): void
    {
        $key = $this->normalizeOldName($this->name);

        $oldValue = old($key, []);
        if (!is_array($oldValue)) {
            $oldValue = [$oldValue];
        }

        $this->populate = array_merge($oldValue, $this->populate);

        foreach ($this->populate as $item) {
            if ($item) {
                $this->value = $item;
                break;
            }
        }
    }

    private function getError(): void
    {
        $errors = session('errors');
        $key = $this->normalizeOldName($this->name);
        $this->error = $errors ? $errors->first($key) : '';
    }
}
