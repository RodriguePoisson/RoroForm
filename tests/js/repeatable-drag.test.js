/**
 * Drag-and-drop reordering for <x-roro-repeatable reorder="drag|both">.
 *
 * This was implemented in the jQuery era, then silently dropped in the
 * jQuery→vanilla rewrite (the .roro-repeatable-handle markup + CSS stayed, but
 * the JS that wires native HTML5 DnD was gone). These tests lock the restored
 * behaviour so it can't vanish again.
 *
 * jsdom note: getBoundingClientRect() returns zeros (no layout), so the
 * "drop above vs below" decision reduces to `clientY > 0`. We exploit that to
 * drive the cursor-midpoint logic deterministically.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { loadRoro, setBody } from './helpers/roroEnv.js';

beforeAll(() => loadRoro());

let seq = 0;
const uid = () => 'd' + (++seq);

function fixture(id, rows, { drag = true } = {}) {
    return `
    <div id="roro-wrapper-${id}" data-id="${id}" data-name="items" data-min="0" data-max=""
         data-index-token="" data-indexed="1" data-item-label=""
         data-reorder="1" ${drag ? 'data-reorder-drag="1"' : ''}
         data-rows='${JSON.stringify(rows)}'
         class="roro-wrapper roro-wrapper-repeatable">
      <div class="roro-repeatable-empty" style="display:none;">empty</div>
      <div class="roro-repeatable-rows"></div>
      <button type="button" class="roro-repeatable-add">+ Add</button>
      <template class="roro-repeatable-template"><input class="roro-input" name="name" type="text"></template>
      <template class="roro-repeatable-row-template">
        <div class="roro-repeatable-row">
          <span class="roro-repeatable-handle">⠿</span>
          <div class="roro-repeatable-row-body"><div class="roro-repeatable-row-content"></div></div>
          <div class="roro-repeatable-row-controls">
            <button type="button" class="roro-repeatable-up">▲</button>
            <button type="button" class="roro-repeatable-down">▼</button>
            <button type="button" class="roro-repeatable-remove">✕</button>
          </div>
        </div>
      </template>
    </div>`;
}

async function build(rows, opts) {
    const id = uid();
    setBody(fixture(id, rows, opts));
    const r = new window.RoroRepeatable(id);
    await r.ready;
    return r;
}

const order = (r) => r.getValue().map(o => o.name);

function fire(el, type, init = {}) {
    const ev = new window.MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    el.dispatchEvent(ev);
    return ev;
}

// Simulate grabbing dragRow's handle and dragging it onto targetRow.
// after=true drops below the target, after=false drops above (clientY gates it).
function drag(dragRow, targetRow, after) {
    fire(dragRow.querySelector('.roro-repeatable-handle'), 'mousedown');
    fire(dragRow, 'dragstart');
    fire(targetRow, 'dragover', { clientY: after ? 10 : 0 });
    fire(dragRow, 'dragend');
}

const ROWS = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];

describe('repeatable drag reorder', () => {
    it('the handle makes its row draggable on mousedown and clears it on dragend', async () => {
        const r = await build(ROWS);
        const row = r.rows()[0];
        fire(row.querySelector('.roro-repeatable-handle'), 'mousedown');
        expect(row.getAttribute('draggable')).toBe('true');
        fire(row, 'dragstart');
        fire(row, 'dragend');
        expect(row.hasAttribute('draggable')).toBe(false);
    });

    it('dragging the first row below the last reorders to [B, C, A]', async () => {
        const r = await build(ROWS);
        const [r0, , r2] = r.rows();
        drag(r0, r2, true);                 // drop A below C
        expect(order(r)).toEqual(['B', 'C', 'A']);
    });

    it('dragging the last row above the first reorders to [C, A, B]', async () => {
        const r = await build(ROWS);
        const [r0, , r2] = r.rows();
        drag(r2, r0, false);                // drop C above A
        expect(order(r)).toEqual(['C', 'A', 'B']);
    });

    it('marks the dragged row while dragging and unmarks it after', async () => {
        const r = await build(ROWS);
        const row = r.rows()[0];
        fire(row.querySelector('.roro-repeatable-handle'), 'mousedown');
        fire(row, 'dragstart');
        expect(row.classList.contains('roro-repeatable-dragging')).toBe(true);
        fire(row, 'dragend');
        expect(row.classList.contains('roro-repeatable-dragging')).toBe(false);
    });

    it('emits roro:change after a drag reorder', async () => {
        const r = await build(ROWS);
        let fired = 0;
        r.wrapper.addEventListener('roro:change', () => fired++);
        const [r0, , r2] = r.rows();
        drag(r0, r2, true);
        expect(fired).toBeGreaterThan(0);
    });

    it('does not reorder while a drag is NOT in progress (dragover alone is inert)', async () => {
        const r = await build(ROWS);
        const [r0, , r2] = r.rows();
        // No dragstart → _dragRow is unset → dragover must be a no-op.
        fire(r2, 'dragover', { clientY: 10 });
        expect(order(r)).toEqual(['A', 'B', 'C']);
    });

    it('is inert when drag is disabled (reorder="buttons" only)', async () => {
        const r = await build(ROWS, { drag: false });
        const [r0, , r2] = r.rows();
        drag(r0, r2, true);                 // handle/dragstart not bound → nothing moves
        expect(order(r)).toEqual(['A', 'B', 'C']);
    });
});
