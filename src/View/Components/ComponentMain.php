<?php

namespace RoroForm\View\Components;

use Illuminate\View\Component;

abstract class ComponentMain extends Component
{

    public string $theme;

    /** Per-request CSP nonce for the injected <script>/<style> tags (or null). */
    public ?string $cspNonce;

    public function __construct()
    {
        $this->theme = config('roroform.theme');

        if(!in_array(config('roroform.theme'),['tailwind', 'bootstrap', 'raw'])){
            throw new \InvalidArgumentException('Invalid theme specified in configuration. Available themes are: tailwind, bootstrap, raw.');

        }

        $this->cspNonce = $this->resolveNonce();
    }

    /** Resolve the CSP nonce from config: null | string | Closure returning a string. */
    protected function resolveNonce(): ?string
    {
        $nonce = config('roroform.nonce');

        if ($nonce instanceof \Closure) {
            $nonce = $nonce();
        }

        return ($nonce === null || $nonce === '') ? null : (string) $nonce;
    }

    abstract public function render();

    public function getJsPath():string
    {
        return __DIR__ . '/../../../resources/js/dist/';
    }

}
