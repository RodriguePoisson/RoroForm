/**
 * RoroRepeatable DOM behaviour tests.
 *
 * Covers the behavioural contract (given DOM/inputs -> resulting value/markup)
 * that a future vanilla rewrite must preserve.
 *
 * Fixture HTML is modelled after the real Blade output in:
 *   resources/views/components/tailwind/inputs/repeatable.blade.php
 *   resources/views/components/repeatable-helper.blade.php
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { loadRoro, setBody, tick } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

// Auto-incrementing id so tests never share the same wrapper element; this
// prevents stale async instances from a prior test touching the new DOM.
let _idSeq = 0;
function uid() { return 't' + (++_idSeq); }

/**
 * Build a minimal wrapper div that mirrors the real Blade output.
 * blueprintHtml goes inside <template class="roro-repeatable-template">.
 * dataRows is a JS array that will be JSON-serialised into data-rows.
 */
function makeFixture({
    id = uid(),
    name = 'items',
    min = 0,
    max = '',
    indexToken = '',
    indexed = true,
    reorder = false,
    reorderDrag = false,
    keyField = '',
    itemLabel = '',
    rows = [],
    blueprintHtml = '<input class="roro-input" name="name" type="text">',
    rowClass = '',
} = {}) {
    const reorderAttr = reorder ? 'data-reorder="1"' : '';
    const reorderDragAttr = reorderDrag ? 'data-reorder-drag="1"' : '';
    const keyFieldAttr = keyField ? `data-key-field="${keyField}"` : '';

    const upDown = reorder
        ? `<button type="button" class="roro-repeatable-up">▲</button>
           <button type="button" class="roro-repeatable-down">▼</button>`
        : '';

    return `
        <div id="roro-wrapper-${id}"
             data-id="${id}"
             data-name="${name}"
             data-min="${min}"
             data-max="${max}"
             data-index-token="${indexToken}"
             data-indexed="${indexed ? '1' : '0'}"
             data-item-label="${itemLabel}"
             ${reorderAttr}
             ${reorderDragAttr}
             ${keyFieldAttr}
             data-rows='${JSON.stringify(rows)}'
             class="roro-wrapper roro-wrapper-repeatable">

            <div class="roro-repeatable-empty" style="display:none;">No items yet.</div>
            <div class="roro-repeatable-rows"></div>
            <button type="button" class="roro-repeatable-add">+ Add</button>

            <template class="roro-repeatable-template">
                ${blueprintHtml}
            </template>

            <template class="roro-repeatable-row-template">
                <div class="roro-repeatable-row group flex items-start gap-3 px-4 py-3.5 ${rowClass}">
                    <div class="roro-repeatable-row-body min-w-0 flex-1">
                        ${itemLabel ? '<p class="roro-repeatable-row-label"></p>' : ''}
                        <div class="roro-repeatable-row-content"></div>
                    </div>
                    <div class="roro-repeatable-row-controls flex shrink-0 items-center gap-1">
                        ${upDown}
                        <button type="button" class="roro-repeatable-remove">✕</button>
                    </div>
                </div>
            </template>
        </div>
    `;
}

/** Instantiate and await .ready, return the instance. */
async function build(opts = {}) {
    // Give each test its own unique wrapper id to prevent stale instances
    // from interfering when their ready-promise resolves after a setBody.
    const id = opts.id || uid();
    setBody(makeFixture({ ...opts, id }));
    const r = new window.RoroRepeatable(id);
    await r.ready;
    return r;
}

// ---------------------------------------------------------------------------
// 1. Initialisation — rows from data-rows, min/max
// ---------------------------------------------------------------------------

describe('init — builds rows from data-rows', () => {
    it('creates one row per data-rows entry', async () => {
        const r = await build({
            rows: [{ name: 'Alice' }, { name: 'Bob' }],
        });
        expect(r.count()).toBe(2);
    });

    it('fills each row with the corresponding data', async () => {
        const r = await build({
            rows: [{ name: 'Alice' }, { name: 'Bob' }],
        });
        expect(r.getValue()).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });

    it('starts empty when data-rows is empty', async () => {
        const r = await build({ rows: [] });
        expect(r.count()).toBe(0);
    });

    it('honours min — adds blank rows when fewer data-rows entries than min', async () => {
        const r = await build({ min: 3, rows: [] });
        expect(r.count()).toBe(3);
    });

    it('honours max — does not exceed max rows even when data-rows has more', async () => {
        const r = await build({
            max: 2,
            rows: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        });
        expect(r.count()).toBe(2);
    });

    it('clamps rows to min when data-rows has fewer entries', async () => {
        const r = await build({ min: 2, rows: [{ name: 'Only' }] });
        // min=2 → a second blank row must have been added
        expect(r.count()).toBe(2);
    });
});

// ---------------------------------------------------------------------------
// 2. addRow — appends and reindexes names & ids
// ---------------------------------------------------------------------------

describe('addRow', () => {
    it('increments count', async () => {
        const r = await build({ rows: [] });
        r.addRow(null, false);
        expect(r.count()).toBe(1);
    });

    it('reindexes name attributes to prefix[i][field] form', async () => {
        const r = await build({ name: 'contacts', rows: [] });
        r.addRow(null, false);
        r.addRow(null, false);
        const names = Array.from(
            document.querySelectorAll('.roro-repeatable-row-content [name]'),
        ).map((el) => el.getAttribute('name'));
        // First row and second row should have different indices
        expect(names[0]).toMatch(/^contacts\[0\]\[name\]$/);
        expect(names[1]).toMatch(/^contacts\[1\]\[name\]$/);
    });

    it('does not create duplicate ids across rows', async () => {
        const r = await build({
            blueprintHtml: '<input id="field-name" name="name" type="text">',
            rows: [],
        });
        r.addRow(null, false);
        r.addRow(null, false);
        const ids = Array.from(
            document.querySelectorAll('.roro-repeatable-row-content [id]'),
        ).map((el) => el.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('returns null and does not add when already at max', async () => {
        const r = await build({ max: 2, rows: [{ name: 'A' }, { name: 'B' }] });
        const result = r.addRow(null, false);
        expect(result).toBeNull();
        expect(r.count()).toBe(2);
    });

    it('disables the add button when count reaches max', async () => {
        const r = await build({ max: 2, rows: [] });
        r.addRow(null, false);
        r.addRow(null, false);
        const btn = document.querySelector('.roro-repeatable-add');
        expect(btn.disabled).toBe(true);
    });

    it('does not emit roro:change during init (isInit=true)', async () => {
        const id = uid();
        setBody(makeFixture({ id, rows: [{ name: 'Alice' }] }));
        let fired = 0;
        // Attach listener before instantiation.
        document.getElementById('roro-wrapper-' + id).addEventListener('roro:change', () => { fired++; });
        const r = new window.RoroRepeatable(id);
        await r.ready;
        expect(fired).toBe(0);
    });

    it('emits roro:change when not in init', async () => {
        const r = await build({ rows: [] });
        let fired = 0;
        r.wrapper.addEventListener('roro:change', () => { fired++; });
        r.addRow(null, false);
        expect(fired).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// 3. removeRow — respects min and locked rows
// ---------------------------------------------------------------------------

describe('removeRow', () => {
    it('removes a row', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        const $first = r.rowAt(0);
        r.removeRow($first);
        expect(r.count()).toBe(1);
    });

    it('does not remove below min', async () => {
        const r = await build({ min: 2, rows: [{ name: 'A' }, { name: 'B' }] });
        const $first = r.rowAt(0);
        r.removeRow($first);
        expect(r.count()).toBe(2);
    });

    it('does not remove a locked row', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        const $first = r.rowAt(0);
        r.lockRow($first, true);
        r.removeRow($first);
        expect(r.count()).toBe(2);
    });

    it('emits roro:change after removal', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        let fired = 0;
        r.wrapper.addEventListener('roro:change', () => { fired++; });
        r.removeRow(r.rowAt(0));
        expect(fired).toBe(1);
    });

    it('enables remove button when above min after removal', async () => {
        const r = await build({ min: 1, rows: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
        r.removeRow(r.rowAt(2));
        // Now 2 rows remain, still above min=1, so remove should be enabled
        const removeBtns = document.querySelectorAll('.roro-repeatable-remove');
        expect(Array.from(removeBtns).some(b => !b.disabled)).toBe(true);
    });

    it('disables the remove button when at min', async () => {
        const r = await build({ min: 2, rows: [{ name: 'A' }, { name: 'B' }] });
        const removeBtns = document.querySelectorAll('.roro-repeatable-remove');
        expect(Array.from(removeBtns).every(b => b.disabled)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// 4. lockRow / isRowLocked
// ---------------------------------------------------------------------------

describe('lockRow / isRowLocked', () => {
    it('marks a row as locked', async () => {
        const r = await build({ rows: [{ name: 'A' }] });
        const $row = r.rowAt(0);
        r.lockRow($row, true);
        expect(r.isRowLocked($row)).toBe(true);
    });

    it('unlocks a previously locked row', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        const $row = r.rowAt(0);
        r.lockRow($row, true);
        r.lockRow($row, false);
        expect(r.isRowLocked($row)).toBe(false);
    });

    it('disables the remove button on a locked row via refreshControls', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        const row = r.rowAt(0);
        r.lockRow(row, true);
        const removeBtn = row.querySelector('.roro-repeatable-remove');
        expect(removeBtn.disabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// 5. getValue / readRow — object rows
// ---------------------------------------------------------------------------

describe('getValue / readRow — object rows', () => {
    it('returns an array of objects', async () => {
        const r = await build({
            rows: [{ name: 'Alice' }, { name: 'Bob' }],
        });
        const val = r.getValue();
        expect(Array.isArray(val)).toBe(true);
        expect(val).toHaveLength(2);
        expect(val[0]).toEqual({ name: 'Alice' });
        expect(val[1]).toEqual({ name: 'Bob' });
    });

    it('reads nested object fields', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="addr[city]" type="text">
                <input name="addr[zip]" type="text">
            `,
            rows: [{ addr: { city: 'Paris', zip: '75000' } }],
        });
        const val = r.getValue();
        expect(val[0]).toEqual({ addr: { city: 'Paris', zip: '75000' } });
    });

    it('skips disabled inputs', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="name" type="text">
                <input name="hidden_field" type="text" disabled>
            `,
            rows: [{ name: 'Alice', hidden_field: 'secret' }],
        });
        const val = r.getValue();
        expect(val[0]).toHaveProperty('name', 'Alice');
        expect(val[0]).not.toHaveProperty('hidden_field');
    });

    it('skips unchecked checkboxes', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="name" type="text">
                <input name="agreed" type="checkbox" value="1">
            `,
            rows: [{ name: 'Alice' }],
        });
        const val = r.getValue();
        expect(val[0]).not.toHaveProperty('agreed');
    });

    it('includes checked checkboxes', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="name" type="text">
                <input name="agreed" type="checkbox" value="1">
            `,
            rows: [{ name: 'Alice', agreed: '1' }],
        });
        // fillRow will have set checked=true for the matching value
        const val = r.getValue();
        expect(val[0]).toHaveProperty('agreed', '1');
    });

    it('skips unchecked radio inputs', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="color" type="radio" value="red">
                <input name="color" type="radio" value="blue">
            `,
            rows: [{ color: 'red' }],
        });
        const val = r.getValue();
        // Only 'red' should appear (the one that is checked)
        expect(val[0]).toHaveProperty('color', 'red');
    });
});

// ---------------------------------------------------------------------------
// 6. Flat scalar list (token mode, tags[#])
// ---------------------------------------------------------------------------

describe('getValue — flat scalar list (token mode)', () => {
    it('returns scalars instead of objects for flat lists', async () => {
        const r = await build({
            name: 'tags',
            indexToken: '#',
            blueprintHtml: '<input name="tags[#]" type="text">',
            rows: ['red', 'green', 'blue'],
        });
        const val = r.getValue();
        expect(val).toEqual(['red', 'green', 'blue']);
    });
});

// ---------------------------------------------------------------------------
// 7. fillRow — seeds native inputs, checkbox/radio checked state
// ---------------------------------------------------------------------------

describe('fillRow', () => {
    it('sets text input values', async () => {
        const r = await build({ rows: [{ name: 'Charlie' }] });
        const input = document.querySelector('.roro-repeatable-row-content input[type="text"]');
        expect(input.value).toBe('Charlie');
    });

    it('sets textarea content', async () => {
        const r = await build({
            blueprintHtml: '<textarea name="bio"></textarea>',
            rows: [{ bio: 'Hello world' }],
        });
        const ta = document.querySelector('textarea[name]');
        expect(ta.value).toBe('Hello world');
    });

    it('checks a checkbox when value matches', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="agreed" type="checkbox" value="1">
            `,
            rows: [{ agreed: '1' }],
        });
        const cb = document.querySelector('input[type="checkbox"]');
        expect(cb.checked).toBe(true);
    });

    it('leaves checkbox unchecked when value does not match', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="agreed" type="checkbox" value="1">
            `,
            rows: [{ agreed: '0' }],
        });
        const cb = document.querySelector('input[type="checkbox"]');
        expect(cb.checked).toBe(false);
    });

    it('checks the correct radio option', async () => {
        const r = await build({
            blueprintHtml: `
                <input name="color" type="radio" value="red">
                <input name="color" type="radio" value="blue">
            `,
            rows: [{ color: 'blue' }],
        });
        const radios = document.querySelectorAll('input[type="radio"]');
        expect(radios[0].checked).toBe(false); // red
        expect(radios[1].checked).toBe(true);  // blue
    });

    it('seeds flat scalar row (single input per row)', async () => {
        const r = await build({
            name: 'tags',
            indexToken: '#',
            blueprintHtml: '<input name="tags[#]" type="text">',
            rows: ['foo'],
        });
        const input = document.querySelector('.roro-repeatable-row-content input');
        expect(input.value).toBe('foo');
    });
});

// ---------------------------------------------------------------------------
// 8. setValue — replaces all rows, honours min
// ---------------------------------------------------------------------------

describe('setValue', () => {
    it('replaces existing rows with new data', async () => {
        const r = await build({ rows: [{ name: 'Alice' }, { name: 'Bob' }] });
        r.setValue([{ name: 'Carol' }]);
        expect(r.count()).toBe(1);
        expect(r.getValue()).toEqual([{ name: 'Carol' }]);
    });

    it('clears all rows when passed an empty array', async () => {
        const r = await build({ rows: [{ name: 'Alice' }] });
        r.setValue([]);
        expect(r.count()).toBe(0);
    });

    it('honours min after setValue when fewer rows provided', async () => {
        const r = await build({ min: 2, rows: [{ name: 'A' }, { name: 'B' }] });
        r.setValue([{ name: 'Only' }]);
        // min=2 → a second blank row should have been added
        expect(r.count()).toBe(2);
    });

    it('still reads the new values after setValue', async () => {
        const r = await build({ rows: [{ name: 'Old' }] });
        r.setValue([{ name: 'New1' }, { name: 'New2' }]);
        expect(r.getValue()).toEqual([{ name: 'New1' }, { name: 'New2' }]);
    });
});

// ---------------------------------------------------------------------------
// 9. moveRow — reorders when reorder enabled
// ---------------------------------------------------------------------------

describe('moveRow', () => {
    it('moves a row up', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        const $second = r.rowAt(1);
        r.moveRow($second, -1);
        expect(r.getValue()[0]).toEqual({ name: 'Second' });
        expect(r.getValue()[1]).toEqual({ name: 'First' });
    });

    it('moves a row down', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        const $first = r.rowAt(0);
        r.moveRow($first, 1);
        expect(r.getValue()[0]).toEqual({ name: 'Second' });
        expect(r.getValue()[1]).toEqual({ name: 'First' });
    });

    it('does not move the first row further up', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        const $first = r.rowAt(0);
        r.moveRow($first, -1);
        expect(r.getValue()[0]).toEqual({ name: 'First' });
    });

    it('does not move the last row further down', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        const $last = r.rowAt(1);
        r.moveRow($last, 1);
        expect(r.getValue()[1]).toEqual({ name: 'Second' });
    });

    it('does nothing when reorderEnabled is false', async () => {
        const r = await build({
            reorder: false,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        const $second = r.rowAt(1);
        r.moveRow($second, -1);
        // Should remain in original order
        expect(r.getValue()[0]).toEqual({ name: 'First' });
    });

    it('emits roro:change after moving', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'First' }, { name: 'Second' }],
        });
        let fired = 0;
        r.wrapper.addEventListener('roro:change', () => { fired++; });
        r.moveRow(r.rowAt(0), 1);
        expect(fired).toBe(1);
    });

    it('disables the up button on the first row and down button on the last row', async () => {
        const r = await build({
            reorder: true,
            rows: [{ name: 'A' }, { name: 'B' }],
        });
        const rows = document.querySelectorAll('.roro-repeatable-row');
        const firstUp = rows[0].querySelector('.roro-repeatable-up');
        const lastDown = rows[1].querySelector('.roro-repeatable-down');
        expect(firstUp.disabled).toBe(true);
        expect(lastDown.disabled).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// 10. emitChange — fires a roro:change event on the wrapper
// ---------------------------------------------------------------------------

describe('emitChange', () => {
    it('passes the current getValue() result as event data', async () => {
        const r = await build({ rows: [] });
        let captured;
        r.wrapper.addEventListener('roro:change', (ev) => { captured = ev.detail; });
        r.addRow({ name: 'Test' }, false);
        // The event data is the full getValue() snapshot
        expect(Array.isArray(captured)).toBe(true);
    });

    it('fires on removeRow', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        let fired = 0;
        r.wrapper.addEventListener('roro:change', () => { fired++; });
        r.removeRow(r.rowAt(0));
        expect(fired).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// 11. add button reaches max — disables add button
// ---------------------------------------------------------------------------

describe('max enforcement', () => {
    it('re-enables the add button after removing a row that was at max', async () => {
        const r = await build({ max: 2, rows: [{ name: 'A' }, { name: 'B' }] });
        r.removeRow(r.rowAt(0));
        const btn = document.querySelector('.roro-repeatable-add');
        expect(btn.disabled).toBe(false);
    });

    it('keeps the add button enabled when below max', async () => {
        const r = await build({ max: 5, rows: [{ name: 'A' }] });
        const btn = document.querySelector('.roro-repeatable-add');
        expect(btn.disabled).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// 12. empty element visibility
// ---------------------------------------------------------------------------

describe('empty element', () => {
    it('shows the empty element when there are no rows', async () => {
        const r = await build({ rows: [] });
        const empty = document.querySelector('.roro-repeatable-empty');
        expect(empty.style.display).not.toBe('none');
    });

    it('hides the empty element when rows exist', async () => {
        const r = await build({ rows: [{ name: 'A' }] });
        const empty = document.querySelector('.roro-repeatable-empty');
        expect(empty.style.display).toBe('none');
    });
});

// ---------------------------------------------------------------------------
// 13. Static helpers (pure logic)
// ---------------------------------------------------------------------------

describe('static helpers', () => {
    it('bracketize wraps a simple name', () => {
        expect(window.RoroRepeatable.bracketize('name')).toBe('[name]');
    });

    it('bracketize wraps only the first segment of a compound name', () => {
        expect(window.RoroRepeatable.bracketize('addr[city]')).toBe('[addr][city]');
    });

    it('bracketize preserves trailing []', () => {
        expect(window.RoroRepeatable.bracketize('tags[]')).toBe('[tags][]');
    });

    it('stripArray removes trailing []', () => {
        expect(window.RoroRepeatable.stripArray('tags[]')).toBe('tags');
    });

    it('stripArray leaves a name without [] unchanged', () => {
        expect(window.RoroRepeatable.stripArray('name')).toBe('name');
    });

    it('cssEsc escapes double quotes and backslashes', () => {
        expect(window.RoroRepeatable.cssEsc('a"b')).toBe('a\\"b');
        expect(window.RoroRepeatable.cssEsc('a\\b')).toBe('a\\\\b');
    });

    it('setPath writes a flat value', () => {
        const obj = {};
        window.RoroRepeatable.setPath(obj, ['name'], 'Alice', false);
        expect(obj).toEqual({ name: 'Alice' });
    });

    it('setPath writes a nested value', () => {
        const obj = {};
        window.RoroRepeatable.setPath(obj, ['addr', 'city'], 'Paris', false);
        expect(obj).toEqual({ addr: { city: 'Paris' } });
    });

    it('setPath pushes into an array when isArray=true', () => {
        const obj = {};
        window.RoroRepeatable.setPath(obj, ['tags'], 'red', true);
        window.RoroRepeatable.setPath(obj, ['tags'], 'blue', true);
        expect(obj.tags).toEqual(['red', 'blue']);
    });
});

// ---------------------------------------------------------------------------
// 14. Pure logic — indexName / deindex
// ---------------------------------------------------------------------------

describe('pure logic — indexName / deindex', () => {
    it('indexName auto-prefix mode: prefix[i][field]', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: true, prefix: 'contacts', token: '' };
        expect(proto.indexName.call(ctx, 'name', 0)).toBe('contacts[0][name]');
        expect(proto.indexName.call(ctx, 'name', 2)).toBe('contacts[2][name]');
    });

    it('indexName auto-prefix mode: handles nested field name', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: true, prefix: 'contacts', token: '' };
        expect(proto.indexName.call(ctx, 'addr[city]', 1)).toBe('contacts[1][addr][city]');
    });

    it('indexName token mode: replaces # with index', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: true, prefix: 'tags', token: '#' };
        expect(proto.indexName.call(ctx, 'tags[#]', 0)).toBe('tags[0]');
        expect(proto.indexName.call(ctx, 'tags[#]', 3)).toBe('tags[3]');
    });

    it('indexName token mode: replaces # inside a compound name', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: true, prefix: 'contacts', token: '#' };
        expect(proto.indexName.call(ctx, 'contacts[#][name]', 2)).toBe('contacts[2][name]');
    });

    it('indexName returns name verbatim when indexed=false', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: false, prefix: 'contacts', token: '' };
        expect(proto.indexName.call(ctx, 'name', 5)).toBe('name');
    });

    it('deindex reverses auto-prefix indexing', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: true, prefix: 'contacts', token: '' };
        expect(proto.deindex.call(ctx, 'contacts[0][name]')).toBe('name');
        // After stripping the prefix and the index segment the un-bracket step
        // only un-brackets the FIRST field segment; deeper brackets remain.
        expect(proto.deindex.call(ctx, 'contacts[3][addr][city]')).toBe('addr[city]');
    });

    it('deindex returns name verbatim when indexed=false', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = { indexed: false, prefix: 'items', token: '' };
        expect(proto.deindex.call(ctx, 'items[0][name]')).toBe('items[0][name]');
    });

    it('namePath parses a simple name', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = {};
        expect(proto.namePath.call(ctx, 'name')).toEqual(['name']);
    });

    it('namePath parses a compound name', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = {};
        expect(proto.namePath.call(ctx, 'addr[city]')).toEqual(['addr', 'city']);
    });

    it('namePath ignores trailing [] (empty segment)', () => {
        const proto = window.RoroRepeatable.prototype;
        const ctx = {};
        // tags[] => only ['tags'] because the empty segment is skipped by the regex
        expect(proto.namePath.call(ctx, 'tags[]')).toEqual(['tags']);
    });
});

// ---------------------------------------------------------------------------
// 15. rowEl / rowAt targeting
// ---------------------------------------------------------------------------

describe('rowEl / rowAt', () => {
    it('rowAt returns the row at the given position index', async () => {
        const r = await build({ rows: [{ name: 'A' }, { name: 'B' }] });
        const row = r.rowAt(1);
        expect(row).toBeTruthy();
        // The second row's input should contain 'B'
        expect(row.querySelector('input').value).toBe('B');
    });

    it('rowEl with a number resolves by position', async () => {
        const r = await build({ rows: [{ name: 'X' }, { name: 'Y' }] });
        const row = r.rowEl(0);
        expect(row.querySelector('input').value).toBe('X');
    });

    it('rowEl passes through a DOM element unchanged', async () => {
        const r = await build({ rows: [{ name: 'P' }] });
        const orig = r.rowAt(0);
        const via = r.rowEl(orig);
        expect(via).toBe(orig);
    });
});

// ---------------------------------------------------------------------------
// 16. addRepeatable global helper
// ---------------------------------------------------------------------------

describe('addRepeatable global helper', () => {
    it('registers and returns an instance', async () => {
        const id = uid();
        setBody(makeFixture({ id, rows: [{ name: 'Z' }] }));
        const inst = window.addRepeatable(document.getElementById('roro-wrapper-' + id));
        await inst.ready;
        expect(inst.count()).toBe(1);
        expect(window.listOfRepeatable).toContain(inst);
    });
});
