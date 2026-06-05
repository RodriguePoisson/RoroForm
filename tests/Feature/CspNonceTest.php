<?php

/**
 * The injected <script>/<style> blocks carry a CSP nonce when one is configured.
 */

function nonceForm(): string
{
    return <<<'BLADE'
    <x-roro-form id="f">
        <x-roro-text name="x" id="x"/>
        <x-roro-select name="s" id="s" :options="['a' => 'A']"/>
        <x-roro-repeatable name="rows" :rows="[['x' => 1]]">
            <x-roro-text name="x"/>
        </x-roro-repeatable>
    </x-roro-form>
    BLADE;
}

it('adds the nonce to every injected script tag when configured', function () {
    config()->set('roroform.nonce', 'abc123');

    $html = $this->render(nonceForm());

    // The global helper script, plus the select + repeatable helper scripts.
    expect(substr_count($html, '<script nonce="abc123">'))->toBeGreaterThanOrEqual(2)
        ->and($html)->toContain('<script nonce="abc123">');
});

it('nonces the injected style block too', function () {
    config()->set('roroform.nonce', 'abc123');

    $html = $this->render(nonceForm());

    expect($html)->toContain('<style nonce="abc123">');
});

it('omits the nonce attribute when none is configured', function () {
    config()->set('roroform.nonce', null);

    $html = $this->render(nonceForm());

    expect($html)->not->toContain('nonce=');
});

it('resolves a Closure nonce at render time', function () {
    config()->set('roroform.nonce', fn () => 'dyn-xyz');

    $html = $this->render(nonceForm());

    expect($html)->toContain('<script nonce="dyn-xyz">');
});
