/**
 * Keyboard accessibility for the ARIA combobox select (raw theme).
 * The behaviour only activates when the control carries role="combobox", so
 * these fixtures use the raw-theme markup.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadRoro, setBody } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

function comboboxFixture(id = 'co') {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-value="" data-show=""
         class="roro-wrapper roro-wrapper-select">
      <label id="label-${id}" data-id="${id}" class="roro-label">Country</label>
      <div class="roro-border-error" data-class="roro-border-error" data-show="1">
        <div class="roro-select-shell">
          <input data-id="${id}" type="text" role="combobox" aria-expanded="false"
                 aria-controls="roro-listbox-${id}" aria-autocomplete="list"
                 aria-haspopup="listbox" aria-activedescendant="" aria-labelledby="label-${id}"
                 class="roro-select-text-input">
          <button type="button" class="roro-select-clear-button" tabindex="-1">x</button>
          <input type="hidden" class="roro-select-hidden" name="${id}" id="${id}" value="">
          <div id="roro-listbox-${id}" role="listbox" data-id="${id}" class="roro-select-dropdown">
            <div id="opt-fr" role="option" aria-selected="false" data-value="fr" data-label="France" class="roro-select-option"><span class="roro-select-option-label">France</span><span class="roro-select-option-check" style="display:none;"></span></div>
            <div id="opt-es" role="option" aria-selected="false" data-value="es" data-label="Spain" class="roro-select-option"><span class="roro-select-option-label">Spain</span><span class="roro-select-option-check" style="display:none;"></span></div>
            <div id="opt-it" role="option" aria-selected="false" data-value="it" data-label="Italy" class="roro-select-option"><span class="roro-select-option-label">Italy</span><span class="roro-select-option-check" style="display:none;"></span></div>
          </div>
          <div class="roro-select-templates" hidden aria-hidden="true">
            <div class="roro-select-option" data-value="" data-label=""><span class="roro-select-option-label"></span><span class="roro-select-option-check" style="display:none;"></span></div>
            <div class="roro-select-category" data-category=""><div class="roro-select-category-label"></div><div class="roro-select-category-options-container"></div></div>
          </div>
        </div>
      </div>
    </div>`;
}

async function mountCombobox(id = 'co') {
    setBody(comboboxFixture(id));
    window.addSelect(document.getElementById('roro-wrapper-' + id));
    const inst = window.listOfSelect[0];
    await inst.ready;
    return inst;
}

function press(key) {
    const cb = document.querySelector('[role="combobox"]');
    cb.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('select keyboard a11y (ARIA combobox)', () => {
    beforeEach(() => mountCombobox());

    it('ArrowDown opens the listbox and activates the first option', () => {
        const cb = document.querySelector('[role="combobox"]');
        expect(cb.getAttribute('aria-expanded')).toBe('false');

        press('ArrowDown');

        expect(cb.getAttribute('aria-expanded')).toBe('true');
        expect(cb.getAttribute('aria-activedescendant')).toBe('opt-fr');
        expect(document.getElementById('opt-fr').classList.contains('roro-option-active')).toBe(true);
    });

    it('ArrowDown moves the active option down', () => {
        press('ArrowDown');
        press('ArrowDown');
        const cb = document.querySelector('[role="combobox"]');
        expect(cb.getAttribute('aria-activedescendant')).toBe('opt-es');
        expect(document.getElementById('opt-fr').classList.contains('roro-option-active')).toBe(false);
        expect(document.getElementById('opt-es').classList.contains('roro-option-active')).toBe(true);
    });

    it('ArrowUp from the first option wraps to the last', () => {
        press('ArrowDown'); // active = fr
        press('ArrowUp');   // wrap to last
        const cb = document.querySelector('[role="combobox"]');
        expect(cb.getAttribute('aria-activedescendant')).toBe('opt-it');
    });

    it('End/Home jump to the last/first option', () => {
        press('ArrowDown');
        press('End');
        expect(document.querySelector('[role="combobox"]').getAttribute('aria-activedescendant')).toBe('opt-it');
        press('Home');
        expect(document.querySelector('[role="combobox"]').getAttribute('aria-activedescendant')).toBe('opt-fr');
    });

    it('Enter selects the active option, marks it aria-selected, and closes', () => {
        press('ArrowDown'); // fr
        press('ArrowDown'); // es
        press('Enter');

        const inst = window.listOfSelect[0];
        expect(inst.getValue()).toBe('es');
        expect(document.querySelector('.roro-select-hidden').value).toBe('es');
        expect(document.getElementById('opt-es').getAttribute('aria-selected')).toBe('true');
        expect(document.getElementById('opt-fr').getAttribute('aria-selected')).toBe('false');
        // single select closes on pick
        expect(document.querySelector('[role="combobox"]').getAttribute('aria-expanded')).toBe('false');
    });

    it('Escape closes the listbox and clears the active descendant', () => {
        press('ArrowDown');
        expect(document.querySelector('[role="combobox"]').getAttribute('aria-expanded')).toBe('true');

        press('Escape');

        const cb = document.querySelector('[role="combobox"]');
        expect(cb.getAttribute('aria-expanded')).toBe('false');
        expect(cb.getAttribute('aria-activedescendant')).toBe('');
        expect(document.getElementById('opt-fr').classList.contains('roro-option-active')).toBe(false);
    });
});
