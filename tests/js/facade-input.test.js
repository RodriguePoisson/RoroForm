/**
 * Behavioural contract tests for the roro() input handle (RoroHandle).
 *
 * Every group exercises the contract a future vanilla rewrite must preserve:
 * given this DOM shape, calling roro(id).<method>() produces this result/mutation.
 *
 * Blade-exact structure is used for fixture HTML so the DOM assertions
 * stay representative of the real rendered pages.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Minimal text-input wrapper that matches the tailwind text blade. */
function textFixture(id = 'email', { value = '', disabled = false, readonly = false, label = 'Email', placeholder = 'you@x.com', hidden = false } = {}) {
    return `
        <div id="roro-wrapper-${id}" class="roro-wrapper roro-wrapper-text w-full"
             ${hidden ? 'style="display:none;"' : ''}>
            <label id="label-${id}" for="${id}" class="roro-label roro-label-text block text-sm font-medium text-gray-700 mb-1.5">
                ${label}
            </label>
            <div class="roro-border-error" data-class="roro-border-error border border-red-500" data-show="false">
                <div class="w-full">
                    <input
                        type="text"
                        name="${id}"
                        id="${id}"
                        value="${value}"
                        placeholder="${placeholder}"
                        ${disabled ? 'disabled' : ''}
                        ${readonly ? 'readonly' : ''}
                        class="roro-input roro-input-text block w-full rounded-lg border border-gray-300"
                    >
                </div>
            </div>
            <div class="roro-input-error-container" style="display:none;">
                <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
            </div>
        </div>`;
}

/** Checkbox wrapper matching the tailwind checkbox blade. */
function checkboxFixture(id = 'agree', { checked = false, disabled = false } = {}) {
    return `
        <div id="roro-wrapper-${id}" class="roro-wrapper roro-wrapper-checkbox flex items-center gap-2">
            <input
                type="checkbox"
                name="${id}"
                id="${id}"
                value="1"
                ${checked ? 'checked' : ''}
                ${disabled ? 'disabled' : ''}
                class="roro-input roro-input-checkbox h-4 w-4"
            >
            <label id="label-${id}" for="${id}" class="roro-label roro-label-checkbox text-sm">
                I agree
            </label>
        </div>
        <div class="roro-input-error-container" style="display:none;">
            <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
        </div>`;
}

/**
 * Radio-container matching the tailwind radio-container + radio blades.
 * Each radio input is individually wrapped; the outer fieldset is the
 * "wrapper" that roroGetWrapper() finds for error display.
 */
function radioFixture(name = 'color', selected = '') {
    return `
        <fieldset class="roro-wrapper-radio-container">
            <div class="roro-border-error" data-class="roro-border-error border border-red-500" data-show="false">
                <div class="w-full">
                    <legend>Pick a colour</legend>
                    <div class="roro-input flex flex-col">
                        <div id="roro-wrapper-color-red" class="roro-wrapper roro-wrapper-radio flex items-center gap-3">
                            <input type="radio" name="${name}" id="color-red" value="red"
                                   class="roro-input roro-input-radio h-4 w-4"
                                   ${selected === 'red' ? 'checked' : ''}>
                            <label id="label-color-red" for="color-red" class="roro-label roro-label-radio">Red</label>
                        </div>
                        <div id="roro-wrapper-color-blue" class="roro-wrapper roro-wrapper-radio flex items-center gap-3">
                            <input type="radio" name="${name}" id="color-blue" value="blue"
                                   class="roro-input roro-input-radio h-4 w-4"
                                   ${selected === 'blue' ? 'checked' : ''}>
                            <label id="label-color-blue" for="color-blue" class="roro-label roro-label-radio">Blue</label>
                        </div>
                    </div>
                    <div class="roro-input-error-container" style="display:none;">
                        <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
                    </div>
                </div>
            </div>
        </fieldset>`;
}

/** Minimal select wrapper matching the tailwind select blade. */
function selectFixture(id = 'country', { value = '', disabled = false, readonly = false, hidden = false, label = 'Country', options = [] } = {}) {
    const optionHtml = options.map(([label, val]) => `
        <div id="opt-${val}" data-value="${val}" data-label="${label}"
             class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <span style="display:none;" class="roro-select-option-overlay absolute inset-0 bg-blue-50 pointer-events-none"></span>
            <span class="roro-select-option-label relative z-10">${label}</span>
            <span style="display:none;" class="roro-select-option-check absolute right-3 top-1/2"></span>
        </div>`).join('');

    return `
        <div id="roro-wrapper-${id}"
             data-value="${value}"
             data-id="${id}"
             data-disable="${disabled ? 1 : 0}"
             data-readonly="${readonly ? 1 : 0}"
             data-show="0"
             ${hidden ? 'style="display:none;"' : ''}
             class="roro-wrapper roro-wrapper-select w-full">
            <label id="label-${id}" data-id="${id}" class="roro-label roro-label-select block text-sm font-medium text-gray-700 mb-1.5">
                ${label}
            </label>
            <div class="roro-border-error" data-class="roro-border-error border border-red-500" data-show="false">
                <div class="w-full relative">
                    <div class="relative">
                        <input type="text" data-id="${id}" placeholder="Select..."
                               class="roro-select-text-input block w-full rounded-lg border border-gray-300"
                               ${disabled ? 'disabled' : ''}
                               ${readonly ? 'readonly' : ''}>
                        <button type="button" class="roro-select-clear-button absolute inset-y-0 right-0">✕</button>
                    </div>
                    <input type="hidden" id="${id}" name="${id}" value="${value}" class="roro-select-hidden">
                    <div data-id="${id}" class="roro-select-dropdown absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                        ${optionHtml}
                    </div>
                    <div class="roro-select-templates" hidden aria-hidden="true">
                        <div class="roro-select-option" data-value="" data-label="">
                            <span style="display:none;" class="roro-select-option-overlay"></span>
                            <span class="roro-select-option-label"></span>
                            <span style="display:none;" class="roro-select-option-check"></span>
                        </div>
                        <div class="roro-select-category" data-category="">
                            <span class="roro-select-category-label"></span>
                            <div class="roro-select-category-options-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="roro-input-error-container" style="display:none;">
                <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
            </div>
        </div>`;
}

/** Minimal multi-select wrapper matching the tailwind multi-select blade. */
function multiSelectFixture(id = 'tags', name = 'tags[]', { values = [], disabled = false, readonly = false, hidden = false, options = [] } = {}) {
    const optionHtml = options.map(([label, val]) => `
        <div id="opt-ms-${val}" data-value="${val}" data-label="${label}"
             class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700">
            <span style="display:none;" class="roro-select-option-overlay absolute inset-0 pointer-events-none"></span>
            <span class="roro-select-option-label relative z-10">${label}</span>
            <span style="display:none;" class="roro-select-option-check absolute right-3"></span>
        </div>`).join('');

    return `
        <div id="roro-wrapper-${id}"
             data-values='${JSON.stringify(values)}'
             data-id="${id}"
             data-name="${name}"
             data-disable="${disabled ? 1 : 0}"
             data-readonly="${readonly ? 1 : 0}"
             data-show="0"
             ${hidden ? 'style="display:none;"' : ''}
             class="roro-wrapper roro-wrapper-multi-select w-full">
            <label id="label-${id}" data-id="${id}" class="roro-label roro-label-multi-select block text-sm font-medium text-gray-700 mb-1.5">
                Tags
            </label>
            <div class="roro-border-error" data-class="roro-border-error border border-red-500" data-show="false">
                <div class="w-full relative">
                    <div class="relative">
                        <div data-id="${id}" contenteditable="true"
                             placeholder="Select tags..."
                             class="roro-select-text-input flex flex-wrap items-center gap-1.5 w-full min-h-[2.625rem] rounded-lg border border-gray-300"
                             ${disabled ? 'disabled' : ''}
                             ${readonly ? 'readonly' : ''}
                        ></div>
                        <button type="button" class="roro-select-clear-button absolute inset-y-0 right-0">✕</button>
                    </div>
                    <div data-id="${id}" class="roro-select-dropdown absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                        ${optionHtml}
                    </div>
                    <div class="roro-select-templates" hidden aria-hidden="true">
                        <div class="roro-select-option" data-value="" data-label="">
                            <span style="display:none;" class="roro-select-option-overlay"></span>
                            <span class="roro-select-option-label"></span>
                            <span style="display:none;" class="roro-select-option-check"></span>
                        </div>
                        <div class="roro-select-category" data-category="">
                            <span class="roro-select-category-label"></span>
                            <div class="roro-select-category-options-container"></div>
                        </div>
                        <span class="tag" data-value="">
                            <span class="roro-multi-select-text-tag-text"></span>
                            <button type="button" class="roro-multi-select-text-tag-clear-button">✕</button>
                        </span>
                        <span class="caret-zone"></span>
                    </div>
                </div>
            </div>
            <div class="roro-input-error-container" style="display:none;">
                <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
            </div>
        </div>`;
}

/** Minimal file input wrapper matching the tailwind file blade. */
function fileFixture(id = 'avatar', { disabled = false, readonly = false, hidden = false } = {}) {
    return `
        <div id="roro-wrapper-${id}" ${hidden ? 'style="display:none;"' : ''}
             class="roro-wrapper roro-wrapper-file w-full">
            <label id="label-${id}" for="${id}" class="roro-label roro-label-file block text-sm font-medium text-gray-700 mb-1.5">
                Avatar
            </label>
            <div class="roro-border-error" data-class="roro-border-error border border-red-500" data-show="false">
                <div class="w-full">
                    <div class="roro-drop-zone drop-zone flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed relative">
                        <input type="file" id="${id}" name="${id}"
                               class="roro-input roro-input-file file-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                               ${disabled ? 'disabled' : ''}
                               ${readonly ? 'readonly' : ''}>
                    </div>
                </div>
            </div>
            <div class="roro-input-error-container" style="display:none;">
                <p class="roro-input-error-message mt-1.5 text-sm text-red-600"></p>
            </div>
        </div>`;
}

// ---------------------------------------------------------------------------
// Helper: register a select and wait for it to be ready
// ---------------------------------------------------------------------------
async function registerSelect(id) {
    const w = document.getElementById('roro-wrapper-' + id);
    window.addSelect(w);
    const inst = window.listOfSelect[window.listOfSelect.length - 1];
    await inst.ready;
    return inst;
}

async function registerMultiSelect(id) {
    const w = document.getElementById('roro-wrapper-' + id);
    window.addMultiSelect(w);
    const inst = window.listOfSelect[window.listOfSelect.length - 1];
    await inst.ready;
    return inst;
}

// ===========================================================================
// 1. exists() / type()
// ===========================================================================
describe('exists() and type()', () => {
    beforeEach(() => setBody(''));

    it('exists() is false for a missing id', () => {
        expect(window.roro('no-such-id').exists()).toBe(false);
    });

    it('exists() is true for a text input', () => {
        setBody(textFixture('uname'));
        expect(window.roro('uname').exists()).toBe(true);
    });

    it('type() returns "text" for a text input', () => {
        setBody(textFixture('uname'));
        expect(window.roro('uname').type()).toBe('text');
    });

    it('type() returns "checkbox" for a checkbox', () => {
        setBody(checkboxFixture('agree'));
        expect(window.roro('agree').type()).toBe('checkbox');
    });

    it('type() returns "radio" for a radio input', () => {
        setBody(radioFixture('color'));
        expect(window.roro('color-red').type()).toBe('radio');
    });

    it('type() returns "file" for a file input', () => {
        setBody(fileFixture('avatar'));
        expect(window.roro('avatar').type()).toBe('file');
    });

    it('type() returns "select" for a registered select', async () => {
        setBody(selectFixture('country'));
        await registerSelect('country');
        expect(window.roro('country').type()).toBe('select');
    });

    it('type() returns "multi-select" for a registered multi-select', async () => {
        setBody(multiSelectFixture('tags'));
        await registerMultiSelect('tags');
        expect(window.roro('tags').type()).toBe('multi-select');
    });
});

// ===========================================================================
// 2. name()
// ===========================================================================
describe('name()', () => {
    it('returns the name attribute of a text input', () => {
        setBody(textFixture('email'));
        expect(window.roro('email').name()).toBe('email');
    });

    it('returns the name attribute of a checkbox', () => {
        setBody(checkboxFixture('agree'));
        expect(window.roro('agree').name()).toBe('agree');
    });

    it('returns the hidden-input name for a select', async () => {
        setBody(selectFixture('country'));
        await registerSelect('country');
        expect(window.roro('country').name()).toBe('country');
    });

    it('returns data-name for a multi-select', async () => {
        setBody(multiSelectFixture('tags', 'tags[]'));
        await registerMultiSelect('tags');
        expect(window.roro('tags').name()).toBe('tags[]');
    });
});

// ===========================================================================
// 3. value() — text / textarea / number
// ===========================================================================
describe('value() — text input', () => {
    beforeEach(() => setBody(textFixture('email', { value: 'hello@x.com' })));

    it('get: returns current input value', () => {
        expect(window.roro('email').value()).toBe('hello@x.com');
    });

    it('set: updates input value', () => {
        window.roro('email').value('new@x.com');
        expect(document.getElementById('email').value).toBe('new@x.com');
    });

    it('set: returns handle for chaining', () => {
        const h = window.roro('email');
        expect(h.value('a@b.com')).toBe(h);
    });

    it('val() is an alias for value()', () => {
        window.roro('email').val('alias@x.com');
        expect(window.roro('email').val()).toBe('alias@x.com');
    });

    it('set triggers a change event on the element', () => {
        let fired = false;
        document.getElementById('email').addEventListener('change', () => { fired = true; });
        window.roro('email').value('trigger@x.com');
        expect(fired).toBe(true);
    });
});

// ===========================================================================
// 4. value() — checkbox (boolean)
// ===========================================================================
describe('value() — checkbox', () => {
    it('get: returns false when unchecked', () => {
        setBody(checkboxFixture('agree', { checked: false }));
        expect(window.roro('agree').value()).toBe(false);
    });

    it('get: returns true when checked', () => {
        setBody(checkboxFixture('agree', { checked: true }));
        expect(window.roro('agree').value()).toBe(true);
    });

    it('set true: checks the box', () => {
        setBody(checkboxFixture('agree', { checked: false }));
        window.roro('agree').value(true);
        expect(document.getElementById('agree').checked).toBe(true);
    });

    it('set false: unchecks the box', () => {
        setBody(checkboxFixture('agree', { checked: true }));
        window.roro('agree').value(false);
        expect(document.getElementById('agree').checked).toBe(false);
    });

    it('set triggers change event', () => {
        setBody(checkboxFixture('agree'));
        let fired = false;
        document.getElementById('agree').addEventListener('change', () => { fired = true; });
        window.roro('agree').value(true);
        expect(fired).toBe(true);
    });
});

// ===========================================================================
// 5. value() — radio (group by name)
// ===========================================================================
describe('value() — radio', () => {
    beforeEach(() => setBody(radioFixture('color', '')));

    it('get: returns null when nothing selected', () => {
        expect(window.roro('color-red').value()).toBe(null);
    });

    it('get: returns the checked radio value', () => {
        setBody(radioFixture('color', 'blue'));
        expect(window.roro('color-red').value()).toBe('blue');
    });

    it('set: selects the radio with matching value', () => {
        window.roro('color-red').value('blue');
        expect(document.querySelector('input[name="color"][value="blue"]').checked).toBe(true);
        expect(document.querySelector('input[name="color"][value="red"]').checked).toBe(false);
    });

    it('set: handles selection from any radio in the group', () => {
        window.roro('color-blue').value('red');
        expect(document.querySelector('input[name="color"][value="red"]').checked).toBe(true);
    });

    it('set triggers change on the group', () => {
        let count = 0;
        document.querySelectorAll('input[name="color"]').forEach(el => {
            el.addEventListener('change', () => { count++; });
        });
        window.roro('color-red').value('red');
        expect(count).toBeGreaterThan(0);
    });
});

// ===========================================================================
// 6. value() — select (single)
// ===========================================================================
describe('value() — select', () => {
    it('get: returns null when no select instance', () => {
        setBody(selectFixture('country'));
        // Not registered, so no instance
        expect(window.roro('country').value()).toBeNull();
    });

    it('get: returns the current value from the instance', async () => {
        setBody(selectFixture('country', {
            value: 'fr',
            options: [['France', 'fr'], ['Germany', 'de']],
        }));
        await registerSelect('country');
        expect(window.roro('country').value()).toBe('fr');
    });

    it('set: updates the select instance', async () => {
        setBody(selectFixture('country', {
            options: [['France', 'fr'], ['Germany', 'de']],
        }));
        const inst = await registerSelect('country');
        window.roro('country').value('de');
        await inst.ready;
        await tick();
        expect(inst.getValue()).toBe('de');
    });
});

// ===========================================================================
// 7. value() — multi-select (array)
// ===========================================================================
describe('value() — multi-select', () => {
    it('get: returns [] when no instance', () => {
        setBody(multiSelectFixture('tags'));
        expect(window.roro('tags').value()).toEqual([]);
    });

    it('get: returns the selected values array', async () => {
        setBody(multiSelectFixture('tags', 'tags[]', {
            values: ['a', 'b'],
            options: [['Alpha', 'a'], ['Beta', 'b'], ['Gamma', 'c']],
        }));
        await registerMultiSelect('tags');
        expect(window.roro('tags').value()).toEqual(['a', 'b']);
    });

    it('set: replaces the selection', async () => {
        setBody(multiSelectFixture('tags', 'tags[]', {
            options: [['Alpha', 'a'], ['Beta', 'b'], ['Gamma', 'c']],
        }));
        const inst = await registerMultiSelect('tags');
        window.roro('tags').value(['b', 'c']);
        await inst.ready;
        await tick();
        expect(inst.getValue()).toEqual(expect.arrayContaining(['b', 'c']));
    });
});

// ===========================================================================
// 8. value() — file
// ===========================================================================
describe('value() — file', () => {
    beforeEach(() => setBody(fileFixture('avatar')));

    it('get: returns empty array when no file selected', () => {
        expect(window.roro('avatar').value()).toEqual([]);
    });

    it('set(null/falsy) calls clear() (clears the value attribute)', () => {
        // Can't programmatically set files; only verify clear path executes.
        const el = document.getElementById('avatar');
        // Simulate as best we can in jsdom
        el.value = '';
        window.roro('avatar').value(null);
        expect(el.value).toBe('');
    });
});

// ===========================================================================
// 9. clear() / reset()
// ===========================================================================
describe('clear()', () => {
    it('clears a text input', () => {
        setBody(textFixture('email', { value: 'a@b.com' }));
        window.roro('email').clear();
        expect(document.getElementById('email').value).toBe('');
    });

    it('unchecks a checkbox', () => {
        setBody(checkboxFixture('agree', { checked: true }));
        window.roro('agree').clear();
        expect(document.getElementById('agree').checked).toBe(false);
    });

    it('deselects all radios in the group', () => {
        setBody(radioFixture('color', 'red'));
        window.roro('color-red').clear();
        expect(document.querySelectorAll('input[name="color"]:checked').length).toBe(0);
    });

    it('reset() is an alias for clear()', () => {
        setBody(textFixture('email', { value: 'a@b.com' }));
        window.roro('email').reset();
        expect(document.getElementById('email').value).toBe('');
    });
});

// ===========================================================================
// 10. disable / enable / isDisabled
// ===========================================================================
describe('disable() / enable() / isDisabled()', () => {
    describe('text input', () => {
        beforeEach(() => setBody(textFixture('email')));

        it('disable() sets the disabled prop', () => {
            window.roro('email').disable();
            expect(document.getElementById('email').disabled).toBe(true);
        });

        it('enable() removes disabled', () => {
            window.roro('email').disable();
            window.roro('email').enable();
            expect(document.getElementById('email').disabled).toBe(false);
        });

        it('isDisabled() returns true when disabled', () => {
            window.roro('email').disable();
            expect(window.roro('email').isDisabled()).toBe(true);
        });

        it('isDisabled() returns false when enabled', () => {
            expect(window.roro('email').isDisabled()).toBe(false);
        });

        it('disable(false) enables the input', () => {
            window.roro('email').disable();
            window.roro('email').disable(false);
            expect(document.getElementById('email').disabled).toBe(false);
        });

        it('disable() returns handle for chaining', () => {
            const h = window.roro('email');
            expect(h.disable()).toBe(h);
        });
    });

    describe('select', () => {
        it('disable/enable delegates to roroDisableSelect', async () => {
            setBody(selectFixture('country', { options: [['France', 'fr']] }));
            const inst = await registerSelect('country');
            window.roro('country').disable();
            await inst.ready;
            await tick();
            expect(inst.isDisabled()).toBeTruthy();
            window.roro('country').enable();
            await inst.ready;
            await tick();
            expect(inst.isDisabled()).toBeFalsy();
        });
    });
});

// ===========================================================================
// 11. readonly / editable / isReadonly
// ===========================================================================
describe('readonly() / editable() / isReadonly()', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('readonly() sets the readonly prop', () => {
        window.roro('email').readonly();
        expect(document.getElementById('email').readOnly).toBe(true);
    });

    it('editable() clears readonly', () => {
        window.roro('email').readonly();
        window.roro('email').editable();
        expect(document.getElementById('email').readOnly).toBe(false);
    });

    it('isReadonly() reflects the prop', () => {
        expect(window.roro('email').isReadonly()).toBe(false);
        window.roro('email').readonly();
        expect(window.roro('email').isReadonly()).toBe(true);
    });

    it('readonly() returns handle for chaining', () => {
        const h = window.roro('email');
        expect(h.readonly()).toBe(h);
    });
});

// ===========================================================================
// 12. required / optional / isRequired
// ===========================================================================
describe('required() / optional() / isRequired()', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('required() sets the required prop', () => {
        window.roro('email').required();
        expect(document.getElementById('email').required).toBe(true);
    });

    it('optional() clears required', () => {
        window.roro('email').required();
        window.roro('email').optional();
        expect(document.getElementById('email').required).toBe(false);
    });

    it('isRequired() returns true when required', () => {
        window.roro('email').required();
        expect(window.roro('email').isRequired()).toBe(true);
    });

    it('isRequired() returns false initially', () => {
        expect(window.roro('email').isRequired()).toBe(false);
    });
});

// ===========================================================================
// 13. show / hide / toggle / isVisible
//
// NOTE: jsdom has no layout engine, so :visible checks that rely on
// offsetWidth/offsetHeight always return false regardless of display style.
// We therefore assert on el.style.display to verify show/hide behaviour.
// The isVisible() method on RoroHandle uses RoroDom.isVisible() which checks
// the display chain — always returns false in jsdom (known limitation).
// ===========================================================================
describe('show() / hide() / toggle() / isVisible()', () => {
    it('hide() sets wrapper display to none', () => {
        setBody(textFixture('email'));
        window.roro('email').hide();
        expect(document.getElementById('roro-wrapper-email').style.display).toBe('none');
    });

    it('show() sets wrapper display to non-none', () => {
        setBody(textFixture('email', { hidden: true }));
        window.roro('email').show();
        expect(document.getElementById('roro-wrapper-email').style.display).not.toBe('none');
    });

    it('isVisible() returns false after hide() (jsdom offsetWidth is always 0)', () => {
        setBody(textFixture('email'));
        window.roro('email').hide();
        // isVisible() checks display chain — always false in jsdom.
        expect(window.roro('email').isVisible()).toBe(false);
    });

    it('toggle(false) sets wrapper display to none', () => {
        setBody(textFixture('email'));
        window.roro('email').toggle(false);
        expect(document.getElementById('roro-wrapper-email').style.display).toBe('none');
    });

    it('toggle(true) sets wrapper display to non-none', () => {
        setBody(textFixture('email', { hidden: true }));
        window.roro('email').toggle(true);
        expect(document.getElementById('roro-wrapper-email').style.display).not.toBe('none');
    });

    it('show() returns handle for chaining', () => {
        setBody(textFixture('email'));
        const h = window.roro('email');
        expect(h.show()).toBe(h);
    });

    it('hide() returns handle for chaining', () => {
        setBody(textFixture('email'));
        const h = window.roro('email');
        expect(h.hide()).toBe(h);
    });

    it('select wrapper: hide() sets display none, show() removes it', async () => {
        setBody(selectFixture('country'));
        await registerSelect('country');
        window.roro('country').hide();
        expect(document.getElementById('roro-wrapper-country').style.display).toBe('none');
        window.roro('country').show();
        expect(document.getElementById('roro-wrapper-country').style.display).not.toBe('none');
    });
});

// ===========================================================================
// 14. error() / clearError()
// ===========================================================================
describe('error() / clearError()', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('error() shows the error container with the given message', () => {
        window.roro('email').error('Required field');
        const container = document.querySelector('#roro-wrapper-email .roro-input-error-container');
        // jsdom: assert visibility via style.display
        expect(container.style.display).not.toBe('none');
        expect(container.querySelector('.roro-input-error-message').textContent).toBe('Required field');
    });

    it('clearError() hides the error container', () => {
        window.roro('email').error('Oops');
        window.roro('email').clearError();
        const container = document.querySelector('#roro-wrapper-email .roro-input-error-container');
        expect(container.style.display).toBe('none');
    });

    it('error() returns handle for chaining', () => {
        const h = window.roro('email');
        expect(h.error('msg')).toBe(h);
    });

    it('clearError() returns handle for chaining', () => {
        const h = window.roro('email');
        expect(h.clearError()).toBe(h);
    });
});

// ===========================================================================
// 15. label() get/set
// ===========================================================================
describe('label()', () => {
    it('get: returns the label text', () => {
        setBody(textFixture('email', { label: 'Email Address' }));
        expect(window.roro('email').label()).toBe('Email Address');
    });

    it('set: updates the label text', () => {
        setBody(textFixture('email', { label: 'Old Label' }));
        window.roro('email').label('New Label');
        expect(window.roro('email').label()).toBe('New Label');
    });

    it('returns null get when label element is absent', () => {
        // No label-<id> element
        setBody('<input type="text" id="bare" name="bare" class="roro-input roro-input-text">');
        expect(window.roro('bare').label()).toBeNull();
    });

    it('set returns handle for chaining', () => {
        setBody(textFixture('email', { label: 'Old' }));
        const h = window.roro('email');
        expect(h.label('New')).toBe(h);
    });
});

// ===========================================================================
// 16. placeholder() get/set
// ===========================================================================
describe('placeholder()', () => {
    it('get: returns the placeholder attribute', () => {
        setBody(textFixture('email', { placeholder: 'me@example.com' }));
        expect(window.roro('email').placeholder()).toBe('me@example.com');
    });

    it('set: updates the placeholder', () => {
        setBody(textFixture('email', { placeholder: 'old' }));
        window.roro('email').placeholder('new placeholder');
        expect(document.getElementById('email').getAttribute('placeholder')).toBe('new placeholder');
    });

    it('for a select, get/set operates on the text-input', async () => {
        setBody(selectFixture('country', { options: [['France', 'fr']] }));
        await registerSelect('country');
        // The roro-select-text-input carries the placeholder attribute.
        window.roro('country').placeholder('Choose...');
        expect(document.querySelector('#roro-wrapper-country .roro-select-text-input').getAttribute('placeholder')).toBe('Choose...');
    });
});

// ===========================================================================
// 17. attr() / prop() pass-through
// ===========================================================================
describe('attr() / prop() pass-through', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('attr(name) reads an attribute', () => {
        expect(window.roro('email').attr('type')).toBe('text');
    });

    it('attr(name, value) sets an attribute and returns handle', () => {
        const h = window.roro('email');
        const result = h.attr('data-custom', 'foo');
        expect(result).toBe(h);
        expect(document.getElementById('email').getAttribute('data-custom')).toBe('foo');
    });

    it('prop(name) reads a property', () => {
        expect(window.roro('email').prop('disabled')).toBe(false);
    });

    it('prop(name, value) sets a property and returns handle', () => {
        const h = window.roro('email');
        const result = h.prop('disabled', true);
        expect(result).toBe(h);
        expect(document.getElementById('email').disabled).toBe(true);
    });
});

// ===========================================================================
// 18. addClass() on $control()
// ===========================================================================
describe('addClass()', () => {
    it('adds a class to a text input', () => {
        setBody(textFixture('email'));
        window.roro('email').addClass('my-custom-class');
        expect(document.getElementById('email').classList.contains('my-custom-class')).toBe(true);
    });

    it('adds class to the text-input element of a select', async () => {
        setBody(selectFixture('country', { options: [['France', 'fr']] }));
        await registerSelect('country');
        window.roro('country').addClass('select-highlight');
        const textInput = document.querySelector('#roro-wrapper-country .roro-select-text-input');
        expect(textInput.classList.contains('select-highlight')).toBe(true);
    });

    it('returns handle for chaining', () => {
        setBody(textFixture('email'));
        const h = window.roro('email');
        expect(h.addClass('foo')).toBe(h);
    });
});

// ===========================================================================
// 19. roroValue() / roroHide() / roroShow() flat helpers
// ===========================================================================
describe('flat helpers delegate to the handle', () => {
    beforeEach(() => setBody(textFixture('email', { value: 'initial@x.com' })));

    it('roroValue(id) gets the value', () => {
        expect(window.roroValue('email')).toBe('initial@x.com');
    });

    it('roroValue(id, v) sets the value', () => {
        window.roroValue('email', 'updated@x.com');
        expect(document.getElementById('email').value).toBe('updated@x.com');
    });

    it('roroHide(id) hides the wrapper', () => {
        window.roroHide('email');
        expect(document.getElementById('roro-wrapper-email').style.display).toBe('none');
    });

    it('roroShow(id) shows the wrapper', () => {
        window.roroHide('email');
        window.roroShow('email');
        expect(document.getElementById('roro-wrapper-email').style.display).not.toBe('none');
    });

    it('roroClear(id) clears the value', () => {
        window.roroClear('email');
        expect(document.getElementById('email').value).toBe('');
    });

    it('roroDisable(id) disables the input', () => {
        window.roroDisable('email');
        expect(document.getElementById('email').disabled).toBe(true);
    });

    it('roroEnable(id) enables the input', () => {
        window.roroDisable('email');
        window.roroEnable('email');
        expect(document.getElementById('email').disabled).toBe(false);
    });

    it('roroReadonly(id) makes the input readonly', () => {
        window.roroReadonly('email');
        expect(document.getElementById('email').readOnly).toBe(true);
    });

    it('roroRequired(id) sets required', () => {
        window.roroRequired('email');
        expect(document.getElementById('email').required).toBe(true);
    });

    it('roroClearError(id) hides error container', () => {
        window.roro('email').error('bad');
        window.roroClearError('email');
        const container = document.querySelector('#roro-wrapper-email .roro-input-error-container');
        // After clearError the container should be hidden (display:none).
        expect(container.style.display).toBe('none');
    });

    it('roroLabel(id, text) updates label', () => {
        window.roroLabel('email', 'Email Address');
        expect(window.roro('email').label()).toBe('Email Address');
    });
});

// ===========================================================================
// 20. roro() entry point — id normalisation (strip leading #)
// ===========================================================================
describe('roro() id normalisation', () => {
    beforeEach(() => setBody(textFixture('email', { value: 'a@b.com' })));

    it('strips a leading # from string ids', () => {
        expect(window.roro('#email').value()).toBe('a@b.com');
    });

    it('accepts a plain string id', () => {
        expect(window.roro('email').value()).toBe('a@b.com');
    });

    it('accepts a DOM element', () => {
        const el = document.getElementById('email');
        expect(window.roro(el).value()).toBe('a@b.com');
    });

    // jQuery is gone; the equivalent is passing a DOM node (same intent: non-string target).
    it('accepts a DOM node (non-string target)', () => {
        const el = document.getElementById('email');
        expect(window.roro(el).value()).toBe('a@b.com');
    });
});

// ===========================================================================
// 21. roro.field() always returns a RoroHandle
// ===========================================================================
describe('roro.field()', () => {
    it('always returns a RoroHandle, even for a form id', () => {
        setBody('<form id="myform"><input type="text" id="f1" class="roro-input roro-input-text" name="f1"></form>');
        const h = window.roro.field('myform');
        expect(h instanceof window.RoroHandle).toBe(true);
    });
});

// ===========================================================================
// 22. roro.exists()
// ===========================================================================
describe('roro.exists()', () => {
    it('returns true when the element exists', () => {
        setBody(textFixture('email'));
        expect(window.roro.exists('email')).toBe(true);
    });

    it('returns false when the element does not exist', () => {
        setBody('');
        expect(window.roro.exists('ghost')).toBe(false);
    });
});

// ===========================================================================
// 23. File — clear() zeroes out the value
// ===========================================================================
describe('file clear()', () => {
    it('clear() sets input value to empty string', () => {
        setBody(fileFixture('avatar'));
        const el = document.getElementById('avatar');
        // jsdom does not enforce file-input restrictions on el.value
        window.roro('avatar').clear();
        expect(el.value).toBe('');
    });

    it('value(null) clears the file input', () => {
        setBody(fileFixture('avatar'));
        const el = document.getElementById('avatar');
        window.roro('avatar').value(null);
        expect(el.value).toBe('');
    });
});

// ===========================================================================
// 24. $wrapper() resolution for different types
// ===========================================================================
describe('$wrapper() resolution', () => {
    it('text input: $wrapper is #roro-wrapper-<id>', () => {
        setBody(textFixture('email'));
        // $wrapper() now returns a DOM Element (not a jQuery object)
        const w = window.roro('email').$wrapper();
        expect(w.id).toBe('roro-wrapper-email');
    });

    it('select: $wrapper is #roro-wrapper-<id>', async () => {
        setBody(selectFixture('country'));
        await registerSelect('country');
        const w = window.roro('country').$wrapper();
        expect(w.id).toBe('roro-wrapper-country');
    });

    it('multi-select: $wrapper is #roro-wrapper-<id>', async () => {
        setBody(multiSelectFixture('tags'));
        await registerMultiSelect('tags');
        const w = window.roro('tags').$wrapper();
        expect(w.id).toBe('roro-wrapper-tags');
    });
});

// ===========================================================================
// 25. $control() for selects points at the text input
// ===========================================================================
describe('$control()', () => {
    it('for text: $control() is the input element itself', () => {
        setBody(textFixture('email'));
        // $control() now returns a DOM Element
        expect(window.roro('email').$control().id).toBe('email');
    });

    it('for select: $control() is the .roro-select-text-input', async () => {
        setBody(selectFixture('country', { options: [['France', 'fr']] }));
        await registerSelect('country');
        const c = window.roro('country').$control();
        expect(c.classList.contains('roro-select-text-input')).toBe(true);
    });

    it('for multi-select: $control() is the .roro-select-text-input', async () => {
        setBody(multiSelectFixture('tags'));
        await registerMultiSelect('tags');
        const c = window.roro('tags').$control();
        expect(c.classList.contains('roro-select-text-input')).toBe(true);
    });
});

// ===========================================================================
// 26. select instance accessors on the handle
// ===========================================================================
describe('handle.select() / roroGetSelect()', () => {
    it('select() returns null when not registered', () => {
        setBody(selectFixture('country'));
        expect(window.roro('country').select()).toBeNull();
    });

    it('select() returns the RoroSelect instance after registration', async () => {
        setBody(selectFixture('country'));
        const inst = await registerSelect('country');
        expect(window.roro('country').select()).toBe(inst);
    });

    it('roroGetSelect(id) is the same as handle.select()', async () => {
        setBody(selectFixture('country'));
        const inst = await registerSelect('country');
        expect(window.roroGetSelect('country')).toBe(inst);
    });
});

// ===========================================================================
// 27. Chaining: all mutating methods return the same handle
// ===========================================================================
describe('chaining', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('all mutators return the same handle instance', () => {
        const h = window.roro('email');
        expect(h.value('a@b.com')).toBe(h);
        expect(h.disable()).toBe(h);
        expect(h.enable()).toBe(h);
        expect(h.readonly()).toBe(h);
        expect(h.editable()).toBe(h);
        expect(h.required()).toBe(h);
        expect(h.optional()).toBe(h);
        expect(h.show()).toBe(h);
        expect(h.hide()).toBe(h);
        expect(h.toggle(true)).toBe(h);
        expect(h.error('msg')).toBe(h);
        expect(h.clearError()).toBe(h);
        expect(h.addClass('c')).toBe(h);
        expect(h.removeClass('c')).toBe(h);
        expect(h.attr('data-x', '1')).toBe(h);
        expect(h.prop('disabled', false)).toBe(h);
    });
});

// ===========================================================================
// 28. roroToggleVisibility flat helper
// ===========================================================================
describe('roroToggleVisibility()', () => {
    beforeEach(() => setBody(textFixture('email')));

    it('passes true to toggle() — shows', () => {
        window.roro('email').hide();
        window.roroToggleVisibility('email', true);
        expect(document.getElementById('roro-wrapper-email').style.display).not.toBe('none');
    });

    it('passes false to toggle() — hides', () => {
        window.roroToggleVisibility('email', false);
        expect(document.getElementById('roro-wrapper-email').style.display).toBe('none');
    });
});
