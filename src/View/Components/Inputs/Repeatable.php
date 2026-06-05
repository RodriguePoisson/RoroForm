<?php

namespace RoroForm\View\Components\Inputs;

class Repeatable extends InputMain
{
    protected string $view = 'inputs.repeatable';

    // Note: the full parent parameter list is repeated because Blade maps a
    // component's attributes onto the constructor of the *leaf* class it
    // instantiates — anything not declared here lands in $attributes instead of
    // reaching InputMain. PHP's promoted properties can't be inherited and
    // extended in one signature, so every InputMain child does the same. Only
    // the parent params Repeatable actually uses are forwarded (no scalar
    // value/placeholder — a repeatable holds rows, not a single value).
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
        string $name = '',
        bool $enableError = true,
        ?string $tooltip = null,
        public int $min = 1,
        public ?int $max = null,
        public string $addLabel = '+ Add',
        public ?string $removeLabel = null,
        /** Reorder mode: false, true/'buttons' (▲▼), 'drag' (handle), or 'both'. */
        public bool|string $reorder = false,
        public ?string $itemLabel = null,
        /** Inner field name whose value uniquely identifies a row (e.g. 'id') — lets you target rows by key instead of position. */
        public ?string $keyField = null,
        public string $indexToken = '',
        /** When false, inner field names are left verbatim (no prefix[i] / token). */
        public bool $indexed = true,
        public string $rowClass = '',
        /** Initial dataset: an array of rows, each an associative field => value map. */
        public array $rows = [],
    ) {
        parent::__construct(
            id: $id,
            class: $class,
            hasTopMargins: $hasTopMargins,
            label: $label,
            labelClass: $labelClass,
            wrapperClass: $wrapperClass,
            required: $required,
            hidden: $hidden,
            disabled: $disabled,
            readonly: $readonly,
            populate: $populate,
            disableJsValidation: $disableJsValidation,
            name: $name,
            enableError: $enableError,
            tooltip: $tooltip,
            noPopulate: true,
        );

        $this->rows = $this->resolveRows();
    }

    /**
     * Resolve the initial rows: re-submitted old() input wins (after a failed
     * validation), then the explicit :rows dataset, then :populate as an alias.
     */
    protected function resolveRows(): array
    {
        $old = $this->name ? old($this->normalizeOldName($this->name)) : null;
        if (is_array($old) && $old !== []) {
            return array_values($old);
        }

        if ($this->rows !== []) {
            return array_values($this->rows);
        }

        return array_values($this->populate);
    }
}
