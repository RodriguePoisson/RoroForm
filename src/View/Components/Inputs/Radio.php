<?php

namespace RoroForm\View\Components\Inputs;

class Radio extends CheckableMain
{
    protected string $view = 'inputs.radio';

    /**
     * Un radio est coche uniquement si la valeur repeuplee correspond a SA propre
     * valeur (on ne touche pas a $this->value, contrairement a un checkbox).
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
