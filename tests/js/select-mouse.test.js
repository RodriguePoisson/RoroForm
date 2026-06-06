/**
 * MOUSE interaction for the custom select — the path the unit tests previously
 * never exercised (they drove the model directly or via keyboard), which is why
 * a mouse-only regression slipped through.
 *
 * Covers: click to open, click an option to select (single) / toggle (multi),
 * re-open and pick a DIFFERENT option, the focus-retention fix (mousedown inside
 * the dropdown must be prevented so the focus-out close can't swallow the click),
 * and click-outside to close.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---- markup ----------------------------------------------------------------

function optNode(id, value, label) {
    return `<div id="${id}" role="option" aria-selected="false" data-value="${value}" data-label="${label}" class="roro-select-option">`
        + `<span class="roro-select-option-label">${label}</span>`
        + `<span class="roro-select-option-check" style="display:none;"></span></div>`;
}

const OPTS = [optNode('o-a', 'a', 'Apple'), optNode('o-b', 'b', 'Banana'), optNode('o-c', 'c', 'Cherry')].join('');

function singleShell(id) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-value="" data-show="" data-disable="" data-readonly=""
         class="roro-wrapper roro-wrapper-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Fruit</label>
      <div class="roro-select-shell">
        <input data-id="${id}" type="text" role="combobox" aria-expanded="false" aria-activedescendant="" class="roro-select-text-input">
        <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
        <input type="hidden" class="roro-select-hidden" name="${id}" id="${id}" value="">
        <div id="roro-listbox-${id}" role="listbox" data-id="${id}" class="roro-select-dropdown">${OPTS}</div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category=""><div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div></div>
        </div>
      </div>
    </div>`;
}

function multiShell(id) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-name="${id}" data-values='[]' data-show="" data-disable="" data-readonly=""
         class="roro-wrapper roro-wrapper-multi-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Fruits</label>
      <div class="relative">
        <div data-id="${id}" contenteditable="true" role="combobox" class="roro-select-text-input"></div>
        <button type="button" class="roro-select-clear-button"></button>
        <div id="roro-listbox-${id}" role="listbox" data-id="${id}" class="roro-select-dropdown">${OPTS}</div>
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

async function mountSingle(id = 's') {
    setBody(singleShell(id));
    window.addSelect(document.getElementById('roro-wrapper-' + id));
    const inst = window.listOfSelect[0];
    await inst.ready;
    return inst;
}
async function mountMulti(id = 'm') {
    setBody(multiShell(id));
    window.addMultiSelect(document.getElementById('roro-wrapper-' + id));
    const inst = window.listOfSelect[0];
    await inst.ready;
    await tick();
    return inst;
}

// ---- mouse helpers ---------------------------------------------------------

function clickEl(el) {
    el.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}
const combobox = () => document.querySelector('[role="combobox"]');
const optionByValue = (v) => document.querySelector(`.roro-select-dropdown .roro-select-option[data-value="${v}"]`);
const isOpen = () => document.querySelector('.roro-wrapper-select, .roro-wrapper-multi-select').dataset.show === '1';

async function openByClick() {
    clickEl(combobox());
    await tick();
}

// ---------------------------------------------------------------------------

describe('mouse: open / close', () => {
    it('clicking the combobox opens the dropdown', async () => {
        await mountSingle();
        expect(combobox().getAttribute('aria-expanded')).toBe('false');
        await openByClick();
        expect(isOpen()).toBe(true);
        expect(combobox().getAttribute('aria-expanded')).toBe('true');
    });

    it('mousedown inside the dropdown is prevented (keeps focus on the combobox)', async () => {
        await mountSingle();
        await openByClick();
        const ev = new window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
        optionByValue('b').dispatchEvent(ev);
        // This is the fix: without it, the mousedown blurs the combobox and the
        // focus-out handler closes the list before the option's click lands.
        expect(ev.defaultPrevented).toBe(true);
    });
});

describe('mouse: single select', () => {
    it('clicking an option selects it and closes the list', async () => {
        const inst = await mountSingle();
        await openByClick();
        clickEl(optionByValue('b'));
        await tick();
        expect(inst.getValue()).toBe('b');
        expect(document.querySelector('.roro-select-hidden').value).toBe('b');
        expect(isOpen()).toBe(false);
    });

    it('re-opening and clicking a DIFFERENT option changes the value (the reported bug)', async () => {
        const inst = await mountSingle();

        await openByClick();
        clickEl(optionByValue('a'));   // pick Apple
        await tick();
        expect(inst.getValue()).toBe('a');

        await openByClick();           // open again
        expect(isOpen()).toBe(true);
        clickEl(optionByValue('b'));   // now pick Banana
        await tick();
        expect(inst.getValue()).toBe('b');
        expect(document.querySelector('.roro-select-hidden').value).toBe('b');
    });

    it('an option click does NOT bubble to the wrapper toggle (single closes exactly once)', async () => {
        const inst = await mountSingle();
        await openByClick();
        let wrapperClicks = 0;
        // the wrapper toggle would re-open if the click bubbled through
        document.querySelector('.roro-wrapper-select').addEventListener('click', () => wrapperClicks++);
        clickEl(optionByValue('c'));
        await tick();
        expect(inst.getValue()).toBe('c');
        expect(isOpen()).toBe(false);   // stays closed, not toggled back open
    });
});

describe('mouse: multi select', () => {
    it('clicking options toggles their values and keeps the list open', async () => {
        const inst = await mountMulti();
        await openByClick();

        clickEl(optionByValue('a'));
        await tick();
        expect(inst.getValue()).toContain('a');
        expect(isOpen()).toBe(true);    // multi stays open to keep picking

        clickEl(optionByValue('c'));
        await tick();
        expect(inst.getValue().sort()).toEqual(['a', 'c']);
        expect(isOpen()).toBe(true);

        const hidden = [...document.querySelectorAll('.roro-multi-select-hidden')].map(h => h.value).sort();
        expect(hidden).toEqual(['a', 'c']);
    });

    it('clicking a selected option again removes it (toggle off)', async () => {
        const inst = await mountMulti();
        await openByClick();
        clickEl(optionByValue('a'));
        await tick();
        clickEl(optionByValue('a'));
        await tick();
        expect(inst.getValue()).not.toContain('a');
    });
});

describe('mouse: click outside closes', () => {
    it('focus leaving the widget closes the dropdown', async () => {
        await mountSingle();
        await openByClick();
        expect(isOpen()).toBe(true);
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        combobox().dispatchEvent(new window.FocusEvent('focusout', { relatedTarget: outside, bubbles: true }));
        expect(combobox().getAttribute('aria-expanded')).toBe('false');
    });
});
