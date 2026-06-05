<?php

namespace RoroForm\View\Components\Inputs;

class Radio extends CheckableMain
{
    protected string $view = 'inputs.radio';

    /**
     * A radio is checked only when the repopulated value matches ITS own value
     * (unlike a checkbox, $this->value is left untouched).
     */
    protected function populateValue(): void
    {
        foreach (array_merge($this->resolveOld(), $this->populate) as $item) {
            if ($item) {
                $this->checked = ($item == $this->value);
                break;
            }
        }
    }
}
