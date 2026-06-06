/**
 * Native-picker fallback for touch / coarse-pointer devices.
 *
 * On phones & tablets the custom combobox is replaced by a real <select> (the OS
 * picker — better UX, accessible for free). The native element has no name; it
 * drives the SAME hidden input(s), so the value model and form submission are
 * unchanged. Gate: `(pointer: coarse)`; force with window.roroForceNativeSelect;
 * opt out per instance with data-native="0".
 *
 * Tests force the gate deterministically (jsdom has no real matchMedia).
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

let savedMatchMedia;
beforeEach(() => {
    savedMatchMedia = window.matchMedia;
    window.roroForceNativeSelect = true; // force native regardless of matchMedia
});
afterEach(() => {
    window.matchMedia = savedMatchMedia;
    delete window.roroForceNativeSelect;
});

// ---- markup ----------------------------------------------------------------

function optNode(id, value, label) {
    return `<div id="${id}" role="option" aria-selected="false" data-value="${value}" data-label="${label}" class="roro-select-option">`
        + `<span class="roro-select-option-label">${label}</span>`
        + `<span class="roro-select-option-check" style="display:none;"></span></div>`;
}
function category(id, label, opts) {
    return `<div id="${id}" role="group" data-category="${label}" class="roro-select-category">`
        + `<div class="roro-select-category-label">${label}</div>`
        + `<div class="roro-select-category-options-container">${opts.join('')}</div></div>`;
}

function singleFixture({ id = 'ns', value = '', wrapAttr = '', dropdown }) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-value="${value}" data-show="" data-disable="" data-readonly="" ${wrapAttr}
         class="roro-wrapper roro-wrapper-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Country</label>
      <div class="roro-select-shell">
        <input data-id="${id}" type="text" role="combobox" placeholder="Pick one" aria-expanded="false"
               aria-activedescendant="" class="roro-select-text-input">
        <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
        <input type="hidden" class="roro-select-hidden" name="${id}" id="${id}" value="${value}">
        <div data-id="${id}" class="roro-select-dropdown">${dropdown}</div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category="">
            <div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div>
          </div>
        </div>
      </div>
    </div>`;
}

function multiFixture({ id = 'nm', values = [], dropdown }) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-name="${id}" data-values='${JSON.stringify(values)}'
         data-show="" data-disable="" data-readonly="" class="roro-wrapper roro-wrapper-multi-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Tags</label>
      <div class="relative">
        <div data-id="${id}" contenteditable="true" role="combobox" placeholder="Pick" class="roro-select-text-input"></div>
        <button type="button" class="roro-select-clear-button"></button>
        <div data-id="${id}" class="roro-select-dropdown">${dropdown}</div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category="">
            <div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div>
          </div>
          <span id="" contenteditable="false" class="tag"><span class="roro-wrapper-multi-select-text-tag">
            <span class="roro-multi-select-text-tag-text"></span>
            <button type="button" class="roro-multi-select-text-tag-clear-button">x</button></span></span>
          <span class="caret-zone"></span>
        </div>
      </div>
    </div>`;
}

const CAT_DROPDOWN =
    category('g1', 'Group 1', [optNode('o-a', 'a', 'Option A'), optNode('o-b', 'b', 'Option B')]) +
    optNode('o-c', 'c', 'Option C'); // a loose (un-categorised) option

async function mountSingle(opts = {}) {
    setBody(singleFixture({ dropdown: CAT_DROPDOWN, ...opts }));
    window.addSelect(document.getElementById('roro-wrapper-' + (opts.id || 'ns')));
    const inst = window.listOfSelect[0];
    await inst.ready;
    return inst;
}

async function mountMulti(opts = {}) {
    const dropdown = opts.dropdown ||
        [optNode('m-a', 'a', 'Apple'), optNode('m-b', 'b', 'Banana'), optNode('m-c', 'c', 'Cherry')].join('');
    setBody(multiFixture({ dropdown, ...opts }));
    window.addMultiSelect(document.getElementById('roro-wrapper-' + (opts.id || 'nm')));
    const inst = window.listOfSelect[0];
    await inst.ready;
    await tick();
    return inst;
}

const nativeSel = () => document.querySelector('.roro-select-native');

// ---------------------------------------------------------------------------
// Single select
// ---------------------------------------------------------------------------

describe('native fallback — single select', () => {
    it('replaces the custom UI with a real <select> and hides the combobox', async () => {
        const inst = await mountSingle();
        const sel = nativeSel();
        expect(sel).toBeTruthy();
        expect(sel.tagName).toBe('SELECT');
        expect(sel.multiple).toBe(false);
        expect(inst.nativeMode).toBe(true);
        // custom text input is hidden
        expect(document.querySelector('.roro-select-text-input').style.display).toBe('none');
    });

    it('mirrors options and categories (optgroup) in visual order, with a placeholder', async () => {
        await mountSingle();
        const kids = [...nativeSel().children];
        expect(kids[0].tagName).toBe('OPTION');
        expect(kids[0].value).toBe('');                       // placeholder first
        expect(kids[0].textContent).toBe('Pick one');         // from the input placeholder

        const og = kids.find(k => k.tagName === 'OPTGROUP');
        expect(og.label).toBe('Group 1');
        expect([...og.children].map(o => o.textContent)).toEqual(['Option A', 'Option B']);

        const loose = kids.find(k => k.tagName === 'OPTION' && k.value === 'c');
        expect(loose).toBeTruthy();                           // un-categorised option at top level
        expect(loose.textContent).toBe('Option C');
    });

    it('reflects a pre-selected value into the native <select>', async () => {
        await mountSingle({ value: 'b' });
        expect(nativeSel().value).toBe('b');
    });

    it('writes the chosen value to the hidden input and emits roro:change', async () => {
        await mountSingle();
        const wrapper = document.querySelector('.roro-wrapper-select');
        let detail;
        wrapper.addEventListener('roro:change', e => { detail = e.detail; });

        const sel = nativeSel();
        sel.value = 'b';
        sel.dispatchEvent(new window.Event('change', { bubbles: true }));

        expect(document.querySelector('.roro-select-hidden').value).toBe('b');
        expect(detail).toBe('b');
    });

    it('picking the empty placeholder clears the value', async () => {
        await mountSingle({ value: 'a' });
        const sel = nativeSel();
        sel.value = '';
        sel.dispatchEvent(new window.Event('change', { bubbles: true }));
        expect(document.querySelector('.roro-select-hidden').value).toBe('');
    });

    it('a runtime addOption appears in the native <select>', async () => {
        const inst = await mountSingle();
        inst.addOption('Option D', 'd', 'Group 1');
        const values = [...nativeSel().querySelectorAll('option')].map(o => o.value);
        expect(values).toContain('d');
    });

    it('disable()/enable() toggles the native <select> disabled state', async () => {
        const inst = await mountSingle();
        inst.disable(true);
        expect(nativeSel().disabled).toBe(true);
        inst.disable(false);
        expect(nativeSel().disabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Multi select
// ---------------------------------------------------------------------------

describe('native fallback — multi select', () => {
    it('builds a <select multiple> and reflects pre-selected values', async () => {
        await mountMulti({ values: ['a', 'c'] });
        const sel = nativeSel();
        expect(sel.multiple).toBe(true);
        const selected = [...sel.options].filter(o => o.selected).map(o => o.value);
        expect(selected.sort()).toEqual(['a', 'c']);
    });

    it('a native multi-change rewrites the hidden inputs and emits roro:change', async () => {
        const inst = await mountMulti({ values: [] });
        const wrapper = document.querySelector('.roro-wrapper-multi-select');
        let detail;
        wrapper.addEventListener('roro:change', e => { detail = e.detail; });

        const sel = nativeSel();
        [...sel.options].forEach(o => { o.selected = (o.value === 'a' || o.value === 'c'); });
        sel.dispatchEvent(new window.Event('change', { bubbles: true }));

        const hidden = [...document.querySelectorAll('.roro-multi-select-hidden')].map(h => h.value);
        expect(hidden.sort()).toEqual(['a', 'c']);
        expect([...detail].sort()).toEqual(['a', 'c']);
        expect(inst.getValue().sort()).toEqual(['a', 'c']);
    });
});

// ---------------------------------------------------------------------------
// Gate: when the fallback engages
// ---------------------------------------------------------------------------

describe('native fallback — activation gate', () => {
    it('engages on a coarse pointer via matchMedia (no force flag)', async () => {
        delete window.roroForceNativeSelect;
        window.matchMedia = (q) => ({ matches: true, media: q, addListener() {}, removeListener() {} });
        await mountSingle();
        expect(nativeSel()).toBeTruthy();
    });

    it('does NOT engage on a fine pointer (desktop) — custom UI stays', async () => {
        delete window.roroForceNativeSelect;
        window.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {} });
        await mountSingle();
        expect(nativeSel()).toBeNull();
        expect(document.querySelector('.roro-select-text-input').style.display).not.toBe('none');
    });

    it('respects the per-instance opt-out data-native="0" even when forced', async () => {
        await mountSingle({ wrapAttr: 'data-native="0"' });
        expect(nativeSel()).toBeNull();
        expect(document.querySelector('.roro-select-text-input').style.display).not.toBe('none');
    });
});
