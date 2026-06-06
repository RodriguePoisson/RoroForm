/**
 * Single select with the same dropdown-search structure as the multi-select.
 *
 * The text input becomes a read-only DISPLAY of the current selection; a dedicated
 * <input class="roro-select-search-input"> in the dropdown is the ARIA combobox +
 * keyboard surface. Reuses the keySurface / optionsRoot abstraction in Selectable.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

function optNode(id, value, label) {
    return `<div id="${id}" role="option" aria-selected="false" data-value="${value}" data-label="${label}" class="roro-select-option">`
        + `<span class="roro-select-option-label">${label}</span>`
        + `<span class="roro-select-option-check" style="display:none;"></span></div>`;
}
const OPTS = [optNode('o-fr', 'fr', 'France'), optNode('o-es', 'es', 'Spain'), optNode('o-it', 'it', 'Italy')].join('');

// Mirrors the new single-select blade: the text input is a read-only display (no
// combobox role); the search box owns role="combobox"; options sit in an inner listbox.
function fixture(id = 'se', value = '') {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-value="${value}" data-show="" data-disable="" data-readonly=""
         class="roro-wrapper roro-wrapper-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Country</label>
      <div class="roro-select-shell">
        <input data-id="${id}" type="text" aria-labelledby="label-${id}" readonly class="roro-select-text-input">
        <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
        <input type="hidden" class="roro-select-hidden" name="${id}" id="${id}" value="${value}">
        <div data-id="${id}" class="roro-select-dropdown">
          <div class="roro-select-search">
            <input type="text" data-id="${id}" role="combobox" aria-expanded="false" aria-controls="roro-listbox-${id}"
                   aria-autocomplete="list" aria-haspopup="listbox" aria-activedescendant="" aria-label="Search Country"
                   placeholder="Search…" autocomplete="off" class="roro-select-search-input">
          </div>
          <div id="roro-listbox-${id}" role="listbox" class="roro-select-listbox">${OPTS}</div>
        </div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category=""><div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div></div>
        </div>
      </div>
    </div>`;
}

async function mount(value = '') {
    setBody(fixture('se', value));
    window.addSelect(document.getElementById('roro-wrapper-se'));
    const inst = window.listOfSelect[0];
    await inst.ready;
    return inst;
}

const search = () => document.querySelector('.roro-select-search-input');
const display = () => document.querySelector('.roro-select-text-input');
const hidden = () => document.querySelector('.roro-select-hidden');
const visibleLabels = () => [...document.querySelectorAll('#roro-listbox-se .roro-select-option')]
    .filter(o => o.style.display !== 'none').map(o => o.dataset.label);
const type = (v) => { search().value = v; search().dispatchEvent(new window.Event('input', { bubbles: true })); };
const key = (el, k) => el.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('single select: structure', () => {
    it('the search box is the combobox surface; the text input is a read-only display', async () => {
        const inst = await mount();
        expect(inst.keySurface).toBe(search());
        expect(search().getAttribute('role')).toBe('combobox');
        expect(display().getAttribute('role')).toBe(null);
        expect(display().readOnly).toBe(true);
    });

    it('a preselected value is shown in the display input, not as a filter', async () => {
        const inst = await mount('es');
        expect(inst.getValue()).toBe('es');
        expect(display().value).toBe('Spain');     // display shows the label
        expect(search().value).toBe('');           // search starts empty → no filtering
        expect(visibleLabels()).toEqual(['France', 'Spain', 'Italy']);
    });
});

describe('single select: search + pick', () => {
    it('typing in the search box filters the options', async () => {
        await mount();
        type('it');
        expect(visibleLabels()).toEqual(['Italy']);
    });

    it('ArrowDown + Enter from the search box selects and closes', async () => {
        const inst = await mount();
        key(search(), 'ArrowDown');   // France active
        key(search(), 'ArrowDown');   // Spain active
        key(search(), 'Enter');
        expect(inst.getValue()).toBe('es');
        expect(hidden().value).toBe('es');
        expect(display().value).toBe('Spain');                         // label shown
        expect(search().getAttribute('aria-expanded')).toBe('false');  // single closes on pick
    });

    it('clicking a filtered option selects it and shows its label', async () => {
        const inst = await mount();
        type('ita');                                  // only Italy visible
        const opt = document.querySelector('#roro-listbox-se .roro-select-option[data-value="it"]');
        opt.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(inst.getValue()).toBe('it');
        expect(display().value).toBe('Italy');
    });
});

describe('single select: focus + reset', () => {
    it('opening focuses the search box; closing clears the query', async () => {
        const inst = await mount();
        inst.showDropDown(true);
        expect(document.activeElement).toBe(search());
        type('fra');
        expect(visibleLabels()).toEqual(['France']);
        inst.showDropDown(false);
        expect(search().value).toBe('');
        expect(visibleLabels()).toEqual(['France', 'Spain', 'Italy']);
    });

    it('the display input opens the list from the keyboard (ArrowDown)', async () => {
        const inst = await mount();
        key(display(), 'ArrowDown');
        expect(inst.selectWrapper.dataset.show).toBe('1');
    });
});
