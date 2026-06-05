/**
 * Behavioural contract tests for RoroSelect and RoroMultiSelect.
 *
 * The fixture HTML mirrors the real Blade output (tailwind theme) so that the
 * JS models operate on exactly the DOM they expect in production.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---------------------------------------------------------------------------
// Fixture builders
// ---------------------------------------------------------------------------

/**
 * Minimal single-select fixture with one option template and static options.
 * Mirrors resources/views/components/tailwind/inputs/select.blade.php.
 */
function selectFixture({ id = 'country', value = '', options = [], disabled = false, readonly = false } = {}) {
    const optionNodes = options
        .map(o => `
            <div id="roro-opt-${o.value}"
                 data-value="${o.value}"
                 data-label="${o.label}"
                 class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700">
                <span class="roro-select-option-overlay" style="display:none;"></span>
                <span class="roro-select-option-label">${o.label}</span>
                <span class="roro-select-option-check" style="display:none;"></span>
            </div>`)
        .join('');

    return `
        <div id="roro-wrapper-${id}"
             data-value="${value}"
             data-id="${id}"
             data-disable="${disabled ? 1 : ''}"
             data-readonly="${readonly ? 1 : ''}"
             data-show=""
             class="roro-wrapper roro-wrapper-select w-full">

            <div class="w-full relative">
                <div class="relative">
                    <input type="text"
                           data-id="${id}"
                           class="roro-select-text-input block w-full" />
                    <button type="button" class="roro-select-clear-button"></button>
                </div>

                <input type="hidden"
                       class="roro-select-hidden roro-input-hidden"
                       name="${id}"
                       value="${value}" />

                <div data-id="${id}" class="roro-select-dropdown">
                    ${optionNodes}
                </div>

                <div class="roro-select-templates" hidden aria-hidden="true">
                    <div id=""
                         data-value=""
                         data-label=""
                         class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700">
                        <span class="roro-select-option-overlay" style="display:none;"></span>
                        <span class="roro-select-option-label"></span>
                        <span class="roro-select-option-check" style="display:none;"></span>
                    </div>
                    <div id=""
                         data-category=""
                         class="roro-select-category">
                        <div class="roro-select-category-label"></div>
                        <div class="roro-select-category-options-container"></div>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * Minimal multi-select fixture.
 * Mirrors resources/views/components/tailwind/inputs/multi-select.blade.php.
 */
function multiSelectFixture({ id = 'tags', name = 'tags[]', values = [], options = [] } = {}) {
    const optionNodes = options
        .map(o => `
            <div id="roro-opt-${o.value}"
                 data-value="${o.value}"
                 data-label="${o.label}"
                 class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700">
                <span class="roro-select-option-overlay" style="display:none;"></span>
                <span class="roro-select-option-label">${o.label}</span>
                <span class="roro-select-option-check" style="display:none;"></span>
            </div>`)
        .join('');

    return `
        <div id="roro-wrapper-${id}"
             data-values='${JSON.stringify(values)}'
             data-id="${id}"
             data-name="${name}"
             data-disable=""
             data-readonly=""
             data-show=""
             class="roro-wrapper roro-wrapper-multi-select w-full">

            <div class="w-full relative">
                <div class="relative">
                    <div data-id="${id}"
                         contenteditable="true"
                         class="roro-select-text-input flex flex-wrap items-center gap-1.5 w-full"></div>
                    <button type="button" class="roro-select-clear-button"></button>
                </div>

                <div data-id="${id}" class="roro-select-dropdown">
                    ${optionNodes}
                </div>

                <div class="roro-select-templates" hidden aria-hidden="true">
                    <div id=""
                         data-value=""
                         data-label=""
                         class="roro-select-option relative cursor-pointer px-3.5 py-2 text-sm text-gray-700">
                        <span class="roro-select-option-overlay" style="display:none;"></span>
                        <span class="roro-select-option-label"></span>
                        <span class="roro-select-option-check" style="display:none;"></span>
                    </div>
                    <div id=""
                         data-category=""
                         class="roro-select-category">
                        <div class="roro-select-category-label"></div>
                        <div class="roro-select-category-options-container"></div>
                    </div>
                    <span id="" contenteditable="false" class="tag">
                        <span id="" class="roro-wrapper-multi-select-text-tag inline-flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full mr-1 mb-1">
                            <span class="roro-multi-select-text-tag-text"></span>
                            <button type="button" class="roro-multi-select-text-tag-clear-button ml-1">✕</button>
                        </span>
                    </span>
                    <span class="caret-zone"></span>
                </div>
            </div>
        </div>`;
}

const THREE_OPTIONS = [
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'es', label: 'Spain' },
];

// ---------------------------------------------------------------------------
// RoroSelect — basic lifecycle
// ---------------------------------------------------------------------------

describe('RoroSelect — basic lifecycle', () => {
    it('is reachable as window.RoroSelect', () => {
        expect(typeof window.RoroSelect).toBe('function');
    });

    it('exposes a .ready promise that resolves with the instance', async () => {
        setBody(selectFixture({ id: 'basic', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('basic', null);
        const resolved = await inst.ready;
        expect(resolved).toBe(inst);
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — readDom
// ---------------------------------------------------------------------------

describe('RoroSelect — readDom', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'dom', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('dom', null);
        await inst.ready;
    });

    it('reads all options from the dropdown into this.options', () => {
        expect(inst.options).toHaveLength(3);
    });

    it('creates RoroOption objects with correct value and label', () => {
        const opt = inst.options.find(o => o.value === 'fr');
        expect(opt).toBeDefined();
        expect(opt.label).toBe('France');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — initValues / setOptionSelected
// ---------------------------------------------------------------------------

describe('RoroSelect — initValues with a matching value', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'sel', value: 'de', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('sel', 'de');
        await inst.ready;
    });

    it('sets this.value to the matching value', () => {
        expect(inst.value).toBe('de');
    });

    it('sets this.optionSelected to the matching option', () => {
        expect(inst.optionSelected).toBeDefined();
        expect(inst.optionSelected.value).toBe('de');
    });

    it('updates the hidden input to the selected value', () => {
        const hiddenVal = window.$('#roro-wrapper-sel .roro-select-hidden').val();
        expect(hiddenVal).toBe('de');
    });

    it('updates the text input to the selected label', () => {
        const textVal = window.$('#roro-wrapper-sel .roro-select-text-input').val();
        expect(textVal).toBe('Germany');
    });

    it('marks the selected option (check + overlay become visible)', () => {
        const $opt = window.$('#roro-opt-de');
        expect($opt.find('.roro-select-option-check').css('display')).not.toBe('none');
    });
});

describe('RoroSelect — initValues with an unknown value', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'sel2', value: 'xx', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('sel2', 'xx');
        await inst.ready;
    });

    it('resets value to null when value is unknown', () => {
        expect(inst.value).toBeNull();
    });

    it('resets optionSelected to null', () => {
        expect(inst.optionSelected).toBeNull();
    });

    it('empties the hidden input', () => {
        const hiddenVal = window.$('#roro-wrapper-sel2 .roro-select-hidden').val();
        expect(hiddenVal).toBe('');
    });

    it('empties the text input', () => {
        const textVal = window.$('#roro-wrapper-sel2 .roro-select-text-input').val();
        expect(textVal).toBe('');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — setOptionSelected (post-init)
// ---------------------------------------------------------------------------

describe('RoroSelect — setOptionSelected after ready', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'post', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('post', null);
        await inst.ready;
    });

    it('selects an option by value', () => {
        inst.setOptionSelected('es');
        expect(inst.getValue()).toBe('es');
    });

    it('updates the hidden input', () => {
        inst.setOptionSelected('es');
        const hiddenVal = window.$('#roro-wrapper-post .roro-select-hidden').val();
        expect(hiddenVal).toBe('es');
    });

    it('updates the text input to the label', () => {
        inst.setOptionSelected('es');
        const textVal = window.$('#roro-wrapper-post .roro-select-text-input').val();
        expect(textVal).toBe('Spain');
    });

    it('marks the newly selected option', () => {
        inst.setOptionSelected('es');
        const $check = window.$('#roro-opt-es .roro-select-option-check');
        expect($check.css('display')).not.toBe('none');
    });

    it('unmarks previously selected options when a new one is selected', () => {
        inst.setOptionSelected('fr');
        inst.setOptionSelected('es');
        const $frCheck = window.$('#roro-opt-fr .roro-select-option-check');
        expect($frCheck.css('display')).toBe('none');
    });

    it('resets selection when called with null', () => {
        inst.setOptionSelected('fr');
        inst.setOptionSelected(null);
        expect(inst.getValue()).toBeNull();
        expect(inst.optionSelected).toBeNull();
    });

    it('resets selection when called with an unknown value', () => {
        inst.setOptionSelected('fr');
        inst.setOptionSelected('UNKNOWN');
        expect(inst.getValue()).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — clearInput
// ---------------------------------------------------------------------------

describe('RoroSelect — clearInput', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'clr', value: 'fr', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('clr', 'fr');
        await inst.ready;
    });

    it('resets value to null', () => {
        inst.clearInput();
        expect(inst.getValue()).toBeNull();
    });

    it('empties the text input', () => {
        inst.clearInput();
        expect(window.$('#roro-wrapper-clr .roro-select-text-input').val()).toBe('');
    });

    it('empties the hidden input', () => {
        inst.clearInput();
        expect(window.$('#roro-wrapper-clr .roro-select-hidden').val()).toBe('');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — getValue
// ---------------------------------------------------------------------------

describe('RoroSelect — getValue', () => {
    it('returns null when nothing is selected', async () => {
        setBody(selectFixture({ id: 'gv1', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('gv1', null);
        await inst.ready;
        expect(inst.getValue()).toBeNull();
    });

    it('returns the selected value string', async () => {
        setBody(selectFixture({ id: 'gv2', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('gv2', 'fr');
        await inst.ready;
        expect(inst.getValue()).toBe('fr');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — emitChange (silent during init, fires after)
// ---------------------------------------------------------------------------

describe('RoroSelect — emitChange', () => {
    it('does NOT fire roro:change during initial population', async () => {
        setBody(selectFixture({ id: 'em1', value: 'fr', options: THREE_OPTIONS }));
        const events = [];
        // Listen before constructing so any premature event would be caught.
        window.$('#roro-wrapper-em1').on('roro:change', (_, val) => events.push(val));
        const inst = new window.RoroSelect('em1', 'fr');
        await inst.ready;
        expect(events).toHaveLength(0);
    });

    it('fires roro:change on the wrapper after a programmatic change', async () => {
        setBody(selectFixture({ id: 'em2', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('em2', null);
        await inst.ready;

        const events = [];
        window.$('#roro-wrapper-em2').on('roro:change', (_, val) => events.push(val));
        inst.setOptionSelected('de');

        expect(events).toHaveLength(1);
        expect(events[0]).toBe('de');
    });

    it('fires roro:change with the new value on clearInput', async () => {
        setBody(selectFixture({ id: 'em3', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('em3', 'fr');
        await inst.ready;

        const events = [];
        window.$('#roro-wrapper-em3').on('roro:change', (_, val) => events.push(val));
        inst.clearInput();

        expect(events).toHaveLength(1);
        expect(events[0]).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — addOption (no category)
// ---------------------------------------------------------------------------

describe('RoroSelect — addOption without category', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'ao', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('ao', null);
        await inst.ready;
    });

    it('increases this.options length by 1', () => {
        const before = inst.options.length;
        inst.addOption('Italy', 'it');
        expect(inst.options.length).toBe(before + 1);
    });

    it('appends the new option to the dropdown DOM', () => {
        inst.addOption('Italy', 'it');
        const $opt = window.$('#roro-wrapper-ao .roro-select-dropdown .roro-select-option[data-value="it"]');
        expect($opt.length).toBe(1);
    });

    it('sets the correct label text on the new option', () => {
        inst.addOption('Italy', 'it');
        const $opt = window.$('#roro-wrapper-ao .roro-select-dropdown .roro-select-option[data-value="it"]');
        expect($opt.find('.roro-select-option-label').text()).toBe('Italy');
    });

    it('makes the new option selectable via setOptionSelected', () => {
        inst.addOption('Italy', 'it');
        inst.setOptionSelected('it');
        expect(inst.getValue()).toBe('it');
    });

    it('returns a RoroOption-like object with value and label', () => {
        const opt = inst.addOption('Italy', 'it');
        expect(opt.value).toBe('it');
        expect(opt.label).toBe('Italy');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — addOption with category (ensureCategory)
// ---------------------------------------------------------------------------

describe('RoroSelect — addOption with category', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'cat', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('cat', null);
        await inst.ready;
    });

    it('creates a new category when one does not exist', () => {
        inst.addOption('Italy', 'it', 'Southern Europe');
        expect(inst.categories).toHaveLength(1);
        expect(inst.categories[0].label).toBe('Southern Europe');
    });

    it('reuses an existing category on second call with same label', () => {
        inst.addOption('Italy', 'it', 'Europe');
        inst.addOption('Portugal', 'pt', 'Europe');
        expect(inst.categories).toHaveLength(1);
    });

    it('places the option inside the category container', () => {
        inst.addOption('Italy', 'it', 'Europe');
        const $cat = window.$('#roro-wrapper-cat .roro-select-category[data-category="Europe"]');
        expect($cat.length).toBe(1);
        const $opt = $cat.find('.roro-select-option[data-value="it"]');
        expect($opt.length).toBe(1);
    });

    it('sets the category label text in the DOM', () => {
        inst.addOption('Italy', 'it', 'Europe');
        const $cat = window.$('#roro-wrapper-cat .roro-select-category[data-category="Europe"]');
        expect($cat.find('.roro-select-category-label').text()).toBe('Europe');
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — removeOption
// ---------------------------------------------------------------------------

describe('RoroSelect — removeOption', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'rm', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('rm', null);
        await inst.ready;
    });

    it('decreases this.options length by 1', () => {
        const opt = inst.options.find(o => o.value === 'fr');
        inst.removeOption(opt);
        expect(inst.options).toHaveLength(2);
    });

    it('removes the option node from the DOM', () => {
        const opt = inst.options.find(o => o.value === 'fr');
        inst.removeOption(opt);
        expect(window.$('#roro-opt-fr').length).toBe(0);
    });

    it('the removed option is no longer in this.options', () => {
        const opt = inst.options.find(o => o.value === 'fr');
        inst.removeOption(opt);
        expect(inst.options.find(o => o.value === 'fr')).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — filterOptions
// ---------------------------------------------------------------------------

describe('RoroSelect — filterOptions', () => {
    let inst;

    beforeEach(async () => {
        setBody(selectFixture({ id: 'fil', options: THREE_OPTIONS }));
        inst = new window.RoroSelect('fil', null);
        await inst.ready;
    });

    it('filters options matching the needle (case-insensitive)', () => {
        inst.filterOptions('fr');
        expect(inst.optionsFiltered).toHaveLength(1);
        expect(inst.optionsFiltered[0].value).toBe('fr');
    });

    it('returns all options for an empty filter string', () => {
        inst.filterOptions('');
        // empty filter matches all labels
        expect(inst.optionsFiltered).toHaveLength(3);
    });

    it('returns an empty array when nothing matches', () => {
        inst.filterOptions('zzz');
        expect(inst.optionsFiltered).toHaveLength(0);
    });

    it('is case-insensitive', () => {
        inst.filterOptions('FRANCE');
        expect(inst.optionsFiltered).toHaveLength(1);
        expect(inst.optionsFiltered[0].label).toBe('France');
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — basic lifecycle
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — basic lifecycle', () => {
    it('is reachable as window.RoroMultiSelect', () => {
        expect(typeof window.RoroMultiSelect).toBe('function');
    });

    it('exposes a .ready promise that resolves with the instance', async () => {
        setBody(multiSelectFixture({ id: 'ms0', options: THREE_OPTIONS }));
        const inst = new window.RoroMultiSelect('ms0', 'ms0[]', []);
        const resolved = await inst.ready;
        expect(resolved).toBe(inst);
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — initValues
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — initValues with pre-selected values', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'ms1', options: THREE_OPTIONS, values: ['fr', 'de'] }));
        inst = new window.RoroMultiSelect('ms1', 'ms1[]', ['fr', 'de']);
        await inst.ready;
    });

    it('populates this.values from the constructor argument', () => {
        expect(inst.values).toEqual(expect.arrayContaining(['fr', 'de']));
        expect(inst.values).toHaveLength(2);
    });

    it('getValue returns the initial values array', () => {
        expect(inst.getValue()).toEqual(expect.arrayContaining(['fr', 'de']));
    });
});

describe('RoroMultiSelect — initValues with no pre-selected values', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'ms2', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('ms2', 'ms2[]', []);
        await inst.ready;
    });

    it('starts with an empty values array', () => {
        expect(inst.getValue()).toEqual([]);
    });

    it('renders no hidden inputs initially', () => {
        const count = window.$('#roro-wrapper-ms2 .roro-multi-select-hidden').length;
        expect(count).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — toggleOption (add then remove)
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — toggleOption', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'tg', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('tg', 'tg[]', []);
        await inst.ready;
    });

    it('adds a value on first toggle', () => {
        inst.toggleOption('fr');
        expect(inst.getValue()).toContain('fr');
    });

    it('removes a value on second toggle', () => {
        inst.toggleOption('fr');
        inst.toggleOption('fr');
        expect(inst.getValue()).not.toContain('fr');
    });

    it('can hold multiple values', () => {
        inst.toggleOption('fr');
        inst.toggleOption('de');
        expect(inst.getValue()).toEqual(expect.arrayContaining(['fr', 'de']));
        expect(inst.getValue()).toHaveLength(2);
    });

    it('does not duplicate a value toggled in with init=true', () => {
        inst.toggleOption('fr', true);
        inst.toggleOption('fr', true);
        expect(inst.getValue().filter(v => v === 'fr')).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — setHiddenValue
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — setHiddenValue', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'hv', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('hv', 'hv[]', []);
        await inst.ready;
    });

    it('renders one hidden input per value', () => {
        inst.setHiddenValue(['fr', 'de']);
        const $inputs = window.$('#roro-wrapper-hv .roro-multi-select-hidden');
        expect($inputs.length).toBe(2);
    });

    it('each hidden input carries the right name', () => {
        inst.setHiddenValue(['fr']);
        const $input = window.$('#roro-wrapper-hv .roro-multi-select-hidden');
        expect($input.attr('name')).toBe('hv[]');
    });

    it('each hidden input carries the right value', () => {
        inst.setHiddenValue(['fr', 'de']);
        const vals = window.$('#roro-wrapper-hv .roro-multi-select-hidden')
            .map(function () { return window.$(this).val(); })
            .get();
        expect(vals).toEqual(expect.arrayContaining(['fr', 'de']));
    });

    it('replaces previous hidden inputs on re-call', () => {
        inst.setHiddenValue(['fr', 'de']);
        inst.setHiddenValue(['es']);
        const $inputs = window.$('#roro-wrapper-hv .roro-multi-select-hidden');
        expect($inputs.length).toBe(1);
        expect($inputs.val()).toBe('es');
    });

    it('removes all hidden inputs when called with an empty array', () => {
        inst.setHiddenValue(['fr']);
        inst.setHiddenValue([]);
        const $inputs = window.$('#roro-wrapper-hv .roro-multi-select-hidden');
        expect($inputs.length).toBe(0);
    });

    it('removes all hidden inputs when called with a non-array', () => {
        inst.setHiddenValue(['fr']);
        inst.setHiddenValue(null);
        expect(window.$('#roro-wrapper-hv .roro-multi-select-hidden').length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — clearInput
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — clearInput', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'mc', options: THREE_OPTIONS, values: ['fr', 'de'] }));
        inst = new window.RoroMultiSelect('mc', 'mc[]', ['fr', 'de']);
        await inst.ready;
    });

    it('resets getValue to []', () => {
        inst.clearInput();
        expect(inst.getValue()).toEqual([]);
    });

    it('removes all hidden inputs', () => {
        inst.clearInput();
        expect(window.$('#roro-wrapper-mc .roro-multi-select-hidden').length).toBe(0);
    });

    it('removes all tags from the text input', () => {
        inst.clearInput();
        expect(window.$('#roro-wrapper-mc .roro-select-text-input').html()).toBe('');
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — actualize (tag rendering)
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — actualize', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'act', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('act', 'act[]', []);
        await inst.ready;
    });

    it('renders one .tag span per selected value', () => {
        inst.toggleOption('fr');
        // actualize is called by toggleOption
        const $tags = window.$('#roro-wrapper-act .roro-select-text-input .tag');
        expect($tags.length).toBe(1);
    });

    it('renders the correct label text in the tag', () => {
        inst.toggleOption('fr');
        const tagText = window.$('#roro-wrapper-act .roro-select-text-input .roro-multi-select-text-tag-text').first().text();
        expect(tagText).toBe('France');
    });

    it('renders multiple tags for multiple selected values', () => {
        inst.toggleOption('fr');
        inst.toggleOption('de');
        const $tags = window.$('#roro-wrapper-act .roro-select-text-input .tag');
        expect($tags.length).toBe(2);
    });

    it('removes the tag for a de-selected value', () => {
        inst.toggleOption('fr');
        inst.toggleOption('fr'); // deselect
        const $tags = window.$('#roro-wrapper-act .roro-select-text-input .tag');
        expect($tags.length).toBe(0);
    });

    it('marks the option node as selected when a value is toggled on', () => {
        inst.toggleOption('fr');
        const $check = window.$('#roro-opt-fr .roro-select-option-check');
        expect($check.css('display')).not.toBe('none');
    });

    it('unmarks the option node after deselection', () => {
        inst.toggleOption('fr');
        inst.toggleOption('fr');
        const $check = window.$('#roro-opt-fr .roro-select-option-check');
        expect($check.css('display')).toBe('none');
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — emitChange (silent during init, fires after)
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — emitChange', () => {
    it('does NOT fire roro:change during initial population', async () => {
        setBody(multiSelectFixture({ id: 'me1', options: THREE_OPTIONS, values: ['fr'] }));
        const events = [];
        window.$('#roro-wrapper-me1').on('roro:change', (_, val) => events.push(val));
        const inst = new window.RoroMultiSelect('me1', 'me1[]', ['fr']);
        await inst.ready;
        // actualize() in the constructor's .then() runs after init, so only
        // setHiddenValue calls during init could fire — they must be silent.
        expect(events).toHaveLength(0);
    });

    it('fires roro:change after a programmatic toggleOption', async () => {
        setBody(multiSelectFixture({ id: 'me2', options: THREE_OPTIONS, values: [] }));
        const inst = new window.RoroMultiSelect('me2', 'me2[]', []);
        await inst.ready;

        const events = [];
        window.$('#roro-wrapper-me2').on('roro:change', (_, val) => events.push(val));
        inst.toggleOption('fr');

        expect(events.length).toBeGreaterThanOrEqual(1);
        expect(events[events.length - 1]).toEqual(expect.arrayContaining(['fr']));
    });

    it('fires roro:change after clearInput', async () => {
        setBody(multiSelectFixture({ id: 'me3', options: THREE_OPTIONS, values: [] }));
        const inst = new window.RoroMultiSelect('me3', 'me3[]', []);
        await inst.ready;
        inst.toggleOption('fr');

        const events = [];
        window.$('#roro-wrapper-me3').on('roro:change', (_, val) => events.push(val));
        inst.clearInput();

        expect(events.length).toBeGreaterThanOrEqual(1);
        expect(events[events.length - 1]).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — addOption (inherited from Selectable)
// ---------------------------------------------------------------------------

describe('RoroMultiSelect — addOption', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'mao', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('mao', 'mao[]', []);
        await inst.ready;
    });

    it('adds a new option to this.options', () => {
        const before = inst.options.length;
        inst.addOption('Italy', 'it');
        expect(inst.options.length).toBe(before + 1);
    });

    it('makes the new option toggleable', () => {
        inst.addOption('Italy', 'it');
        inst.toggleOption('it');
        expect(inst.getValue()).toContain('it');
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — filterOptions (overridden, multi-needle)
// ---------------------------------------------------------------------------

// MultiSelect.filterOptions scans the live caret-zones inside the text input for
// typed text and combines them with the passed needle. The empty <span class="caret-zone">
// template inside .roro-select-templates must be excluded — otherwise its '' text
// would match every option and make filtering a no-op.

describe('RoroMultiSelect — filterOptions', () => {
    let inst;

    beforeEach(async () => {
        setBody(multiSelectFixture({ id: 'mf', options: THREE_OPTIONS, values: [] }));
        inst = new window.RoroMultiSelect('mf', 'mf[]', []);
        await inst.ready;
    });

    it('filters options matching a selective needle (case-insensitive)', () => {
        inst.filterOptions('fra');
        expect(inst.optionsFiltered).toHaveLength(1);
        expect(inst.optionsFiltered[0].value).toBe('fr');
    });

    it('returns all options for an empty needle', () => {
        inst.filterOptions('');
        expect(inst.optionsFiltered).toHaveLength(3);
    });

    it('returns an empty array when nothing matches', () => {
        inst.filterOptions('zzz');
        expect(inst.optionsFiltered).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — disable / readonly state
// ---------------------------------------------------------------------------

describe('RoroSelect — disable', () => {
    it('disables the text input and hidden input', async () => {
        setBody(selectFixture({ id: 'dis', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('dis', null);
        await inst.ready;
        inst.disable(true);
        expect(window.$('#roro-wrapper-dis .roro-select-text-input').prop('disabled')).toBe(true);
    });

    it('re-enables the text input', async () => {
        setBody(selectFixture({ id: 'dis2', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('dis2', null);
        await inst.ready;
        inst.disable(true);
        inst.disable(false);
        expect(window.$('#roro-wrapper-dis2 .roro-select-text-input').prop('disabled')).toBe(false);
    });
});

describe('RoroSelect — readonly', () => {
    it('makes the text input readonly', async () => {
        setBody(selectFixture({ id: 'ro', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('ro', null);
        await inst.ready;
        inst.readonly(true);
        expect(window.$('#roro-wrapper-ro .roro-select-text-input').prop('readonly')).toBe(true);
    });

    it('clears readonly flag when called with false', async () => {
        setBody(selectFixture({ id: 'ro2', options: THREE_OPTIONS }));
        const inst = new window.RoroSelect('ro2', null);
        await inst.ready;
        inst.readonly(true);
        inst.readonly(false);
        expect(window.$('#roro-wrapper-ro2 .roro-select-text-input').prop('readonly')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// RoroSelect — addSelect global helper
// ---------------------------------------------------------------------------

describe('addSelect helper', () => {
    it('pushes a RoroSelect instance into window.listOfSelect', async () => {
        setBody(selectFixture({ id: 'as1', options: THREE_OPTIONS }));
        window.addSelect(window.$('#roro-wrapper-as1'));
        await tick();
        expect(window.listOfSelect.length).toBe(1);
        expect(window.listOfSelect[0]).toBeInstanceOf(window.RoroSelect);
    });

    it('the registered instance has the correct id', async () => {
        setBody(selectFixture({ id: 'as2', options: THREE_OPTIONS }));
        window.addSelect(window.$('#roro-wrapper-as2'));
        await tick();
        expect(window.listOfSelect[0].id).toBe('roro-wrapper-as2');
    });
});

// ---------------------------------------------------------------------------
// RoroMultiSelect — addMultiSelect global helper
// ---------------------------------------------------------------------------

describe('addMultiSelect helper', () => {
    it('pushes a RoroMultiSelect instance into window.listOfSelect', async () => {
        setBody(multiSelectFixture({ id: 'ams1', options: THREE_OPTIONS }));
        window.addMultiSelect(window.$('#roro-wrapper-ams1'));
        await tick();
        expect(window.listOfSelect.length).toBe(1);
        expect(window.listOfSelect[0]).toBeInstanceOf(window.RoroMultiSelect);
    });
});
