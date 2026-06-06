/**
 * Multi-select search box (the `searchBar` feature, wired for 2.0).
 *
 * A dedicated <input class="roro-select-search-input"> at the top of the dropdown
 * becomes the ARIA combobox + keyboard surface ("keySurface"); the contenteditable
 * tag area no longer carries the combobox role. Typing filters; arrows/Enter work
 * from the search box; opening focuses it; closing resets the query.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

function optNode(id, value, label) {
    return `<div id="${id}" role="option" aria-selected="false" data-value="${value}" data-label="${label}" class="roro-select-option">`
        + `<span class="roro-select-option-label">${label}</span>`
        + `<span class="roro-select-option-check" style="display:none;"></span></div>`;
}

const OPTS = [optNode('o-a', 'a', 'Apple'), optNode('o-b', 'b', 'Banana'), optNode('o-c', 'c', 'Cherry')].join('');

// Mirrors the new multi-select blade: search box owns role="combobox", the
// tag area (contenteditable) does NOT, and the listbox is an inner element.
function multiSearchFixture(id = 'ms', values = []) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-name="${id}" data-values='${JSON.stringify(values)}'
         data-show="" data-disable="" data-readonly="" class="roro-wrapper roro-wrapper-multi-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Fruits</label>
      <div class="relative">
        <div data-id="${id}" contenteditable="true" aria-labelledby="label-${id}" class="roro-select-text-input"></div>
        <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
        <div data-id="${id}" class="roro-select-dropdown">
          <div class="roro-select-search">
            <input type="text" data-id="${id}" role="combobox" aria-expanded="false"
                   aria-controls="roro-listbox-${id}" aria-autocomplete="list" aria-haspopup="listbox"
                   aria-activedescendant="" aria-label="Search Fruits" placeholder="Search…" autocomplete="off"
                   class="roro-select-search-input">
          </div>
          <div id="roro-listbox-${id}" role="listbox" aria-multiselectable="true" class="roro-select-listbox">${OPTS}</div>
        </div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category=""><div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div></div>
          <span id="" contenteditable="false" class="tag"><span class="roro-wrapper-multi-select-text-tag">
            <span class="roro-multi-select-text-tag-text"></span><button type="button" class="roro-multi-select-text-tag-clear-button">x</button></span></span>
          <span class="caret-zone"></span>
        </div>
      </div>
    </div>`;
}

async function mount(values = []) {
    setBody(multiSearchFixture('ms', values));
    window.addMultiSelect(document.getElementById('roro-wrapper-ms'));
    const inst = window.listOfSelect[0];
    await inst.ready;
    await tick();
    return inst;
}

const search = () => document.querySelector('.roro-select-search-input');
const tagArea = () => document.querySelector('.roro-select-text-input');
const visibleLabels = () => [...document.querySelectorAll('#roro-listbox-ms .roro-select-option')]
    .filter(o => o.style.display !== 'none').map(o => o.dataset.label);

function type(el, value) {
    el.value = value;
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
}
function key(el, k) {
    el.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}

describe('multi-select: the search box IS the combobox surface', () => {
    it('exposes the search input as the keyboard/ARIA surface', async () => {
        const inst = await mount();
        expect(inst.searchInput).toBe(search());
        expect(inst.keySurface).toBe(search());
        expect(tagArea().getAttribute('role')).toBe(null);       // tag area is NOT a combobox
        expect(search().getAttribute('role')).toBe('combobox');
    });

    it('reads the options through the inner listbox (optionsRoot)', async () => {
        const inst = await mount();
        expect(inst.options.map(o => o.label)).toEqual(['Apple', 'Banana', 'Cherry']);
    });
});

describe('multi-select: filtering', () => {
    it('typing filters the visible options', async () => {
        await mount();
        type(search(), 'ban');
        expect(visibleLabels()).toEqual(['Banana']);
    });

    it('clearing the query shows every option again', async () => {
        await mount();
        type(search(), 'ban');
        expect(visibleLabels()).toEqual(['Banana']);
        type(search(), '');
        expect(visibleLabels()).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('a no-match query hides everything (and is recoverable)', async () => {
        await mount();
        type(search(), 'zzz');
        expect(visibleLabels()).toEqual([]);
        type(search(), 'che');
        expect(visibleLabels()).toEqual(['Cherry']);
    });
});

describe('multi-select: keyboard from the search box', () => {
    it('ArrowDown opens + activates, with aria-activedescendant on the search input', async () => {
        await mount();
        key(search(), 'ArrowDown');
        expect(search().getAttribute('aria-expanded')).toBe('true');
        expect(search().getAttribute('aria-activedescendant')).toBe('o-a');
        expect(document.getElementById('o-a').classList.contains('roro-option-active')).toBe(true);
    });

    it('navigation tracks the FILTERED list', async () => {
        await mount();
        type(search(), 'c');                 // matches only Cherry
        key(search(), 'ArrowDown');
        expect(search().getAttribute('aria-activedescendant')).toBe('o-c');
    });

    it('Enter toggles the active option and keeps the list open (multi)', async () => {
        const inst = await mount();
        key(search(), 'ArrowDown');          // Apple active
        key(search(), 'ArrowDown');          // Banana active
        key(search(), 'Enter');
        expect(inst.getValue()).toContain('b');
        expect(search().getAttribute('aria-expanded')).toBe('true');   // stays open
    });

    it('the tag area opens the list from the keyboard (ArrowDown)', async () => {
        const inst = await mount();
        expect(inst.selectWrapper.dataset.show).not.toBe('1');
        key(tagArea(), 'ArrowDown');
        expect(inst.selectWrapper.dataset.show).toBe('1');
    });
});

describe('multi-select: focus + reset', () => {
    it('opening focuses the search box', async () => {
        const inst = await mount();
        inst.showDropDown(true);
        expect(document.activeElement).toBe(search());
    });

    it('closing clears the query and restores the full list', async () => {
        const inst = await mount();
        inst.showDropDown(true);
        type(search(), 'ban');
        expect(visibleLabels()).toEqual(['Banana']);
        inst.showDropDown(false);
        expect(search().value).toBe('');
        expect(visibleLabels()).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('Escape closes and returns focus to the tag area', async () => {
        const inst = await mount();
        inst.showDropDown(true);
        expect(document.activeElement).toBe(search());
        key(search(), 'Escape');
        expect(inst.selectWrapper.dataset.show).toBe('0');
        expect(document.activeElement).toBe(tagArea());
    });
});
