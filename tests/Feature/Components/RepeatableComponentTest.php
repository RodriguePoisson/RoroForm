<?php

/**
 * Server-side rendering tests for the repeatable component.
 *
 * Covers: data attributes (name/min/max/indexed/index-token/key-field/item-label),
 * data-rows JSON resolution (old() > :rows > :populate priority), reorder modes,
 * template blueprints, label/required rendering, and hidden state.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render a repeatable with an explicit id so assertions are deterministic. */
function repeatable(string $extra = '', string $slot = ''): string
{
    return <<<BLADE
    <x-roro-repeatable id="rep" name="contacts" {$extra}>
        {$slot}
    </x-roro-repeatable>
    BLADE;
}

// ---------------------------------------------------------------------------
// Wrapper data attributes — name / min / max
// ---------------------------------------------------------------------------

it('emits data-name from the name prop', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-name="contacts"');
});

it('emits data-min with the given min value', function () {
    $html = $this->render(repeatable(':min="3"'));

    expect($html)->toContain('data-min="3"');
});

it('defaults data-min to 1', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-min="1"');
});

it('emits data-max with the given max value', function () {
    $html = $this->render(repeatable(':max="10"'));

    expect($html)->toContain('data-max="10"');
});

it('emits data-max as empty when not set', function () {
    $html = $this->render(repeatable());

    // max is null, json-serialises to empty string in the blade template
    expect($html)->toContain('data-max=""');
});

// ---------------------------------------------------------------------------
// data-indexed and data-index-token
// ---------------------------------------------------------------------------

it('emits data-indexed="1" by default', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-indexed="1"');
});

it('emits data-indexed="0" when :indexed="false"', function () {
    $html = $this->render(repeatable(':indexed="false"'));

    expect($html)->toContain('data-indexed="0"');
});

it('emits data-index-token with the given token', function () {
    $html = $this->render(repeatable('index-token="__IDX__"'));

    expect($html)->toContain('data-index-token="__IDX__"');
});

it('emits data-index-token as empty string when not supplied', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-index-token=""');
});

// ---------------------------------------------------------------------------
// data-key-field
// ---------------------------------------------------------------------------

it('emits data-key-field when key-field is set', function () {
    $html = $this->render(repeatable('key-field="id"'));

    expect($html)->toContain('data-key-field="id"');
});

it('omits data-key-field when key-field is not set', function () {
    $html = $this->render(repeatable());

    expect($html)->not->toContain('data-key-field');
});

// ---------------------------------------------------------------------------
// data-item-label
// ---------------------------------------------------------------------------

it('emits data-item-label with the given value', function () {
    $html = $this->render(repeatable('item-label="Contact"'));

    expect($html)->toContain('data-item-label="Contact"');
});

it('emits data-item-label as empty when not supplied', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-item-label=""');
});

// ---------------------------------------------------------------------------
// data-rows JSON: populate priority
// ---------------------------------------------------------------------------

it('defaults data-rows to an empty JSON array when no rows are provided', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('data-rows="[]"');
});

it('encodes :rows as data-rows JSON', function () {
    $html = $this->render(
        repeatable(":rows=\"[['name' => 'Alice'], ['name' => 'Bob']]\"")
    );

    // The JSON will contain the name values
    expect($html)
        ->toContain('data-rows="')
        ->toContain('Alice')
        ->toContain('Bob');
});

it(':populate is used as fallback when :rows is empty', function () {
    $html = $this->render(
        repeatable(":populate=\"[['name' => 'Charlie']]\"")
    );

    expect($html)->toContain('Charlie');
});

it(':rows overrides :populate', function () {
    $html = $this->render(
        repeatable(":rows=\"[['name' => 'FromRows']]\" :populate=\"[['name' => 'FromPopulate']]\"")
    );

    expect($html)
        ->toContain('FromRows')
        ->not->toContain('FromPopulate');
});

it('old() input overrides :rows', function () {
    $this->withOld(['contacts' => [['name' => 'FromOld'], ['name' => 'AlsoOld']]]);

    $html = $this->render(
        repeatable(":rows=\"[['name' => 'FromRows']]\"")
    );

    expect($html)
        ->toContain('FromOld')
        ->toContain('AlsoOld')
        ->not->toContain('FromRows');
});

it('old() input overrides :populate', function () {
    $this->withOld(['contacts' => [['name' => 'OldEntry']]]);

    $html = $this->render(
        repeatable(":populate=\"[['name' => 'PopulateEntry']]\"")
    );

    expect($html)
        ->toContain('OldEntry')
        ->not->toContain('PopulateEntry');
});

it('data-rows is valid JSON and re-indexes array values', function () {
    $html = $this->render(
        repeatable(":rows=\"[['x' => 1], ['x' => 2]]\"")
    );

    // Extract the data-rows value
    preg_match('/data-rows="([^"]+)"/', $html, $matches);
    $decoded = json_decode(html_entity_decode($matches[1]), true);

    expect($decoded)->toBeArray()
        ->and(count($decoded))->toBe(2)
        ->and($decoded[0]['x'])->toBe(1)
        ->and($decoded[1]['x'])->toBe(2);
});

// ---------------------------------------------------------------------------
// Wrapper id and class
// ---------------------------------------------------------------------------

it('sets the wrapper id to roro-wrapper-{id}', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('id="roro-wrapper-rep"');
});

it('carries roro-wrapper and roro-wrapper-repeatable classes', function () {
    $html = $this->render(repeatable());

    expect($html)
        ->toContain('roro-wrapper')
        ->toContain('roro-wrapper-repeatable');
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

it('renders a label when the label prop is supplied', function () {
    $html = $this->render(repeatable('label="My Contacts"'));

    expect($html)
        ->toContain('<label id="label-rep"')
        ->toContain('My Contacts');
});

it('omits the label element when no label is given', function () {
    $html = $this->render(repeatable());

    expect($html)->not->toContain('<label');
});

// ---------------------------------------------------------------------------
// Required asterisk
// ---------------------------------------------------------------------------

it('shows the required label marker when :required="true" and label is set', function () {
    $html = $this->render(repeatable('label="Contacts" :required="true"'));

    // The required-label component renders <span class="text-red-500">*</span>
    expect($html)
        ->toContain('text-red-500')
        ->toContain('*');
});

it('omits the required marker when :required is false', function () {
    $html = $this->render(repeatable('label="Contacts"'));

    expect($html)->not->toContain('roro-required-label');
});

// ---------------------------------------------------------------------------
// Reorder = false (default)
// ---------------------------------------------------------------------------

it('does not emit data-reorder when reorder is false', function () {
    $html = $this->render(repeatable());

    expect($html)->not->toContain('data-reorder');
});

it('does not render ▲▼ buttons when reorder is false', function () {
    $html = $this->render(repeatable());

    expect($html)
        ->not->toContain('roro-repeatable-up')
        ->not->toContain('roro-repeatable-down');
});

it('does not render the drag handle when reorder is false', function () {
    $html = $this->render(repeatable());

    // The CSS class name appears in the <style> block regardless, so assert on
    // the drag handle icon character which is only emitted with the <span>.
    expect($html)->not->toContain('⠿');
});

// ---------------------------------------------------------------------------
// Reorder = true / 'buttons'
// ---------------------------------------------------------------------------

it('emits data-reorder="1" when reorder is true', function () {
    $html = $this->render(repeatable(':reorder="true"'));

    expect($html)->toContain('data-reorder="1"');
});

it('renders ▲▼ buttons when reorder is true', function () {
    $html = $this->render(repeatable(':reorder="true"'));

    expect($html)
        ->toContain('roro-repeatable-up')
        ->toContain('▲')
        ->toContain('roro-repeatable-down')
        ->toContain('▼');
});

it('does not render drag handle when reorder is true (buttons only)', function () {
    $html = $this->render(repeatable(':reorder="true"'));

    // The CSS class name appears in the <style> block always; assert on the icon character.
    expect($html)->not->toContain('⠿');
});

it('emits data-reorder="1" when reorder is "buttons"', function () {
    $html = $this->render(repeatable('reorder="buttons"'));

    expect($html)->toContain('data-reorder="1"');
});

it('renders ▲▼ buttons when reorder is "buttons"', function () {
    $html = $this->render(repeatable('reorder="buttons"'));

    expect($html)
        ->toContain('roro-repeatable-up')
        ->toContain('roro-repeatable-down');
});

it('does not render drag handle when reorder is "buttons"', function () {
    $html = $this->render(repeatable('reorder="buttons"'));

    // The CSS class name appears in the <style> block always; assert on the icon character.
    expect($html)->not->toContain('⠿');
});

// ---------------------------------------------------------------------------
// Reorder = 'drag'
// ---------------------------------------------------------------------------

it('emits data-reorder="1" when reorder is "drag"', function () {
    $html = $this->render(repeatable('reorder="drag"'));

    expect($html)->toContain('data-reorder="1"');
});

it('emits data-reorder-drag="1" when reorder is "drag"', function () {
    $html = $this->render(repeatable('reorder="drag"'));

    expect($html)->toContain('data-reorder-drag="1"');
});

it('renders the drag handle when reorder is "drag"', function () {
    $html = $this->render(repeatable('reorder="drag"'));

    expect($html)->toContain('roro-repeatable-handle');
});

it('does not render ▲▼ buttons when reorder is "drag"', function () {
    $html = $this->render(repeatable('reorder="drag"'));

    expect($html)
        ->not->toContain('roro-repeatable-up')
        ->not->toContain('roro-repeatable-down');
});

// ---------------------------------------------------------------------------
// Reorder = 'both'
// ---------------------------------------------------------------------------

it('emits data-reorder="1" when reorder is "both"', function () {
    $html = $this->render(repeatable('reorder="both"'));

    expect($html)->toContain('data-reorder="1"');
});

it('emits data-reorder-drag="1" when reorder is "both"', function () {
    $html = $this->render(repeatable('reorder="both"'));

    expect($html)->toContain('data-reorder-drag="1"');
});

it('renders drag handle AND ▲▼ buttons when reorder is "both"', function () {
    $html = $this->render(repeatable('reorder="both"'));

    expect($html)
        ->toContain('roro-repeatable-handle')
        ->toContain('roro-repeatable-up')
        ->toContain('▲')
        ->toContain('roro-repeatable-down')
        ->toContain('▼');
});

// ---------------------------------------------------------------------------
// Template blueprints
// ---------------------------------------------------------------------------

it('renders the roro-repeatable-template <template> element', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('class="roro-repeatable-template"');
});

it('renders the roro-repeatable-row-template <template> element', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('class="roro-repeatable-row-template"');
});

it('places nested field markup inside the blueprint template', function () {
    $slot = '<x-roro-text name="full_name" label="Full Name" />';
    $html = $this->render(repeatable('', $slot));

    // The slot content is rendered and sits inside the blueprint template
    expect($html)
        ->toContain('roro-repeatable-template')
        ->toContain('name="full_name"');
});

it('renders both templates even with complex nested fields', function () {
    $slot = <<<'BLADE'
        <x-roro-text name="name" label="Name" />
        <x-roro-select name="type" :options="['mobile' => 'Mobile', 'home' => 'Home']" label="Type" />
    BLADE;

    $html = $this->render(repeatable('', $slot));

    expect($html)
        ->toContain('class="roro-repeatable-template"')
        ->toContain('class="roro-repeatable-row-template"')
        ->toContain('name="name"')
        ->toContain('name="type"');
});

// ---------------------------------------------------------------------------
// Remove button is always present
// ---------------------------------------------------------------------------

it('always renders the remove button', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('roro-repeatable-remove');
});

it('renders the default remove label ✕', function () {
    $html = $this->render(repeatable());

    expect($html)->toContain('✕');
});

it('renders a custom remove label when supplied', function () {
    $html = $this->render(repeatable('remove-label="Delete"'));

    expect($html)->toContain('Delete');
});

// ---------------------------------------------------------------------------
// Add button
// ---------------------------------------------------------------------------

it('renders the add button with the default label', function () {
    $html = $this->render(repeatable());

    expect($html)
        ->toContain('roro-repeatable-add')
        ->toContain('+ Add');
});

it('renders a custom add label when supplied', function () {
    $html = $this->render(repeatable('add-label="Add contact"'));

    expect($html)->toContain('Add contact');
});

// ---------------------------------------------------------------------------
// Item label in row template
// ---------------------------------------------------------------------------

it('renders the row label element when item-label is set', function () {
    $html = $this->render(repeatable('item-label="Entry"'));

    expect($html)->toContain('roro-repeatable-row-label');
});

it('omits the row label element when item-label is not set', function () {
    $html = $this->render(repeatable());

    expect($html)->not->toContain('roro-repeatable-row-label');
});

// ---------------------------------------------------------------------------
// Hidden
// ---------------------------------------------------------------------------

it('renders display:none on the wrapper when :hidden="true"', function () {
    $html = $this->render(repeatable(':hidden="true"'));

    // The wrapper element carries the hidden style.
    expect($html)->toContain('id="roro-wrapper-rep"');
    // The wrapper style attribute contains display:none;
    preg_match('/id="roro-wrapper-rep"[^>]*style="([^"]*)"/', $html, $m);
    expect($m[1])->toContain('display:none;');
});

it('does not render display:none on the wrapper when visible', function () {
    $html = $this->render(repeatable());

    // The empty-panel div always has display:none (shown by JS), so match
    // specifically the wrapper's style attribute instead.
    preg_match('/id="roro-wrapper-rep"[^>]*style="([^"]*)"/', $html, $m);
    expect($m[1] ?? '')->not->toContain('display:none;');
});

// ---------------------------------------------------------------------------
// Bootstrap theme parity
// ---------------------------------------------------------------------------

it('renders the same data attributes on bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render(
        repeatable(':min="2" :max="4" key-field="id" item-label="Item" reorder="both"')
    );

    expect($html)
        ->toContain('data-name="contacts"')
        ->toContain('data-min="2"')
        ->toContain('data-max="4"')
        ->toContain('data-key-field="id"')
        ->toContain('data-item-label="Item"')
        ->toContain('data-reorder="1"')
        ->toContain('data-reorder-drag="1"')
        ->toContain('roro-repeatable-handle')
        ->toContain('roro-repeatable-up')
        ->toContain('roro-repeatable-down');
});

it('renders the blueprint templates on bootstrap theme', function () {
    $html = $this->theme('bootstrap')->render(
        repeatable('', '<x-roro-text name="contact_name" label="Name" />')
    );

    expect($html)
        ->toContain('class="roro-repeatable-template"')
        ->toContain('name="contact_name"');
});
