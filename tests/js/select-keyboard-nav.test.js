/**
 * Keyboard navigation MUST follow the visual (DOM) order of the options and
 * never skip or reverse — regression cover for the bug where Arrow keys walked
 * `this.options` array order instead of DOM order (the two diverge as soon as an
 * option is added into an existing category, or whenever array ≠ visual order).
 *
 * Also covers: wrap-around, Home/End, Enter on the visually-active option,
 * skipping hidden/filtered options, and closing the dropdown on focus-out.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---- markup builders -------------------------------------------------------

function optNode(id, value, label) {
    return `<div id="${id}" role="option" aria-selected="false" data-value="${value}" data-label="${label}" class="roro-select-option">`
        + `<span class="roro-select-option-overlay" style="display:none;"></span>`
        + `<span class="roro-select-option-label">${label}</span>`
        + `<span class="roro-select-option-check" style="display:none;"></span></div>`;
}

function category(id, label, opts) {
    return `<div id="${id}" role="group" aria-label="${label}" data-category="${label}" class="roro-select-category">`
        + `<div class="roro-select-category-label">${label}</div>`
        + `<div class="roro-select-category-options-container">${opts.join('')}</div></div>`;
}

// A single-select combobox whose dropdown content is supplied verbatim.
function selectShell(id, dropdownInner) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-value="" data-show="" data-disable="" data-readonly=""
         class="roro-wrapper roro-wrapper-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Field</label>
      <div class="roro-select-shell">
        <input data-id="${id}" type="text" role="combobox" aria-expanded="false"
               aria-controls="roro-listbox-${id}" aria-autocomplete="list" aria-haspopup="listbox"
               aria-activedescendant="" aria-labelledby="label-${id}" class="roro-select-text-input">
        <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
        <input type="hidden" class="roro-select-hidden" name="${id}" id="${id}" value="">
        <div id="roro-listbox-${id}" role="listbox" data-id="${id}" class="roro-select-dropdown">${dropdownInner}</div>
        <div class="roro-select-templates" hidden aria-hidden="true">
          <div role="option" aria-selected="false" class="roro-select-option" data-value="" data-label="">
            <span class="roro-select-option-overlay" style="display:none;"></span>
            <span class="roro-select-option-label"></span>
            <span class="roro-select-option-check" style="display:none;"></span>
          </div>
          <div class="roro-select-category" data-category="">
            <div class="roro-select-category-label"></div>
            <div class="roro-select-category-options-container"></div>
          </div>
        </div>
      </div>
    </div>`;
}

async function mountSelect(id, dropdownInner) {
    setBody(selectShell(id, dropdownInner));
    window.addSelect(document.getElementById('roro-wrapper-' + id));
    const inst = window.listOfSelect[0];
    await inst.ready;
    return inst;
}

// ---- drivers / readers -----------------------------------------------------

function press(key) {
    document.querySelector('[role="combobox"]')
        .dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function activeLabel() {
    const a = document.querySelector('.roro-select-option.roro-option-active');
    return a ? a.dataset.label : null;
}

function activeDescendantLabel() {
    const id = document.querySelector('[role="combobox"]').getAttribute('aria-activedescendant');
    const el = id ? document.getElementById(id) : null;
    return el ? el.dataset.label : null;
}

function expanded() {
    return document.querySelector('[role="combobox"]').getAttribute('aria-expanded');
}

// Visible, non-template options in DOM order — the order the user actually sees.
function visualOrder() {
    return [...document.querySelectorAll('.roro-select-dropdown .roro-select-option')]
        .filter(el => !el.closest('.roro-select-templates') && el.style.display !== 'none')
        .map(el => el.dataset.label);
}

const FLAT = [
    optNode('o-a', 'a', 'Apple'),
    optNode('o-b', 'b', 'Banana'),
    optNode('o-c', 'c', 'Cherry'),
    optNode('o-d', 'd', 'Date'),
    optNode('o-e', 'e', 'Elder'),
].join('');

// ---------------------------------------------------------------------------
// The core regression: visual order vs array order
// ---------------------------------------------------------------------------

describe('arrow nav follows visual DOM order, not this.options array order', () => {
    it('walks top-to-bottom after a dynamic add into a non-last category (the original bug)', async () => {
        const inst = await mountSelect('cat',
            category('g1', 'Group 1', [optNode('o-a', 'a', 'Option A'), optNode('o-b', 'b', 'Option B')]) +
            category('g2', 'Group 2', [optNode('o-c', 'c', 'Option C')]));

        // Lands at the END of the array but MID-DOM (inside Group 1, before C).
        inst.addOption('Option D', 'd', 'Group 1');

        // Precondition: the two orders genuinely diverge (else the test is moot).
        expect(visualOrder()).toEqual(['Option A', 'Option B', 'Option D', 'Option C']);
        expect(inst.options.map(o => o.label)).toEqual(['Option A', 'Option B', 'Option C', 'Option D']);

        const seq = [];
        for (let i = 0; i < 4; i++) { press('ArrowDown'); seq.push(activeLabel()); }
        expect(seq).toEqual(['Option A', 'Option B', 'Option D', 'Option C']);
        // aria-activedescendant must point at the same (visually correct) option.
        expect(activeDescendantLabel()).toBe('Option C');
    });

    it('Enter selects the VISUALLY active option, not the array-indexed one', async () => {
        const inst = await mountSelect('cat2',
            category('g1', 'Group 1', [optNode('o-a', 'a', 'Option A'), optNode('o-b', 'b', 'Option B')]) +
            category('g2', 'Group 2', [optNode('o-c', 'c', 'Option C')]));
        inst.addOption('Option D', 'd', 'Group 1'); // visual: A,B,D,C

        press('ArrowDown'); // A
        press('ArrowDown'); // B
        press('ArrowDown'); // D  (array index 3 — would have been C before the fix)
        press('Enter');

        expect(inst.getValue()).toBe('d');
        expect(document.querySelector('.roro-select-hidden').value).toBe('d');
    });
});

// ---------------------------------------------------------------------------
// Monotonic, no-skip, no-reverse across the whole list
// ---------------------------------------------------------------------------

describe('arrow nav is monotonic and exhaustive', () => {
    it('ArrowDown visits every option once, in order, then wraps — never skips', async () => {
        await mountSelect('flat', FLAT);
        const order = visualOrder();              // 5 options
        const seq = [];
        for (let i = 0; i < order.length * 2 + 1; i++) { press('ArrowDown'); seq.push(activeLabel()); }
        // sequence[k] is exactly order[k % n] — the definition of "one step, no skip".
        seq.forEach((label, k) => expect(label).toBe(order[k % order.length]));
    });

    it('ArrowUp from closed starts at the last and walks upward', async () => {
        await mountSelect('flat2', FLAT);
        const order = visualOrder();
        const seq = [];
        for (let i = 0; i < order.length; i++) { press('ArrowUp'); seq.push(activeLabel()); }
        const expectedUp = [...order].reverse();
        expect(seq).toEqual(expectedUp);
    });

    it('ArrowDown then ArrowUp returns to the same option (no drift)', async () => {
        await mountSelect('flat3', FLAT);
        press('ArrowDown'); // 1st
        press('ArrowDown'); // 2nd
        const before = activeLabel();
        press('ArrowDown'); // 3rd
        press('ArrowUp');   // back to 2nd
        expect(activeLabel()).toBe(before);
    });

    it('every consecutive Down advances by exactly +1 index (never skips, never reverses)', async () => {
        await mountSelect('flat4', FLAT);
        const order = visualOrder();
        press('ArrowDown'); // open + first
        let prev = activeLabel();
        for (let k = 0; k < order.length * 2; k++) {
            press('ArrowDown');
            const cur = activeLabel();
            const expectedIdx = (order.indexOf(prev) + 1) % order.length;
            expect(cur).toBe(order[expectedIdx]);
            prev = cur;
        }
    });
});

// ---------------------------------------------------------------------------
// Home / End and hidden / filtered options
// ---------------------------------------------------------------------------

describe('Home/End and visibility', () => {
    it('Home and End jump to the true first/last visible option (with categories)', async () => {
        const inst = await mountSelect('he',
            category('g1', 'G1', [optNode('o-a', 'a', 'A'), optNode('o-b', 'b', 'B')]) +
            category('g2', 'G2', [optNode('o-c', 'c', 'C')]));
        inst.addOption('D', 'd', 'G1'); // visual: A,B,D,C
        press('ArrowDown'); // open at A
        press('End');
        expect(activeLabel()).toBe('C');
        press('Home');
        expect(activeLabel()).toBe('A');
    });

    it('ArrowDown skips an option hidden via display:none', async () => {
        const inst = await mountSelect('hid', FLAT);
        window.RoroDom.hide(inst.options.find(o => o.value === 'b').elt); // hide Banana
        expect(visualOrder()).toEqual(['Apple', 'Cherry', 'Date', 'Elder']);
        press('ArrowDown'); // Apple
        press('ArrowDown'); // -> Cherry (Banana skipped)
        expect(activeLabel()).toBe('Cherry');
    });

    it('after filtering to a single match, nav stays on that match', async () => {
        const inst = await mountSelect('filt', FLAT);
        const cb = document.querySelector('[role="combobox"]');
        cb.value = 'Cherry';
        cb.dispatchEvent(new window.Event('input', { bubbles: true }));
        expect(visualOrder()).toEqual(['Cherry']);
        press('ArrowDown');
        expect(activeLabel()).toBe('Cherry');
        press('ArrowDown'); // wraps within the 1-item list
        expect(activeLabel()).toBe('Cherry');
    });
});

// ---------------------------------------------------------------------------
// Close on focus-out (blur)
// ---------------------------------------------------------------------------

describe('dropdown closes when focus leaves the widget', () => {
    function fireFocusOut(relatedTarget) {
        document.querySelector('[role="combobox"]')
            .dispatchEvent(new window.FocusEvent('focusout', { relatedTarget, bubbles: true }));
    }

    it('closes when focus moves to an element outside the widget', async () => {
        await mountSelect('b1', FLAT);
        press('ArrowDown');
        expect(expanded()).toBe('true');

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        fireFocusOut(outside);

        expect(expanded()).toBe('false');
        expect(document.querySelector('[role="combobox"]').getAttribute('aria-activedescendant')).toBe('');
    });

    it('stays open when focus moves to another element inside the widget', async () => {
        await mountSelect('b2', FLAT);
        press('ArrowDown');
        fireFocusOut(document.querySelector('.roro-select-clear-button')); // inside the wrapper
        expect(expanded()).toBe('true');
    });

    it('closes on the next tick when blurring with no relatedTarget', async () => {
        await mountSelect('b3', FLAT);
        press('ArrowDown');
        expect(expanded()).toBe('true');

        fireFocusOut(null); // activeElement falls back to <body>, outside the widget
        await tick();

        expect(expanded()).toBe('false');
    });
});
