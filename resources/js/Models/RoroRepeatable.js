/**
 * --------------------------
 *  RoroRepeatable
 * --------------------------
 *  A slot-based repeatable group of inputs. The row "blueprint" (whatever the
 *  user nested in <x-roro-repeatable>) is rendered once into an inert
 *  <template>; each visible row is a clone of that blueprint with:
 *    - its field names indexed   ->  prefix[i][field]   (or a custom token)
 *    - its ids regenerated        ->  nothing collides across rows
 *    - its values filled          ->  from the server payload (old() / :rows)
 *  The same code path builds the initial rows and every dynamic add, so there
 *  is a single source of truth. Nested RoroForm components (select, multi-select,
 *  file) are registered per new row, exactly as the global scanners do on load.
 */
class RoroRepeatable extends RoroElement {
    constructor(id) {
        super('repeatable', id, 'roro-wrapper');

        // Chain init after the wrapper has been resolved (same pattern as Selectable).
        const baseReady = this.ready;
        this.ready = baseReady.then(() => this.init());
    }

    init() {
        this.wrapper = this.elt;
        this.rowsContainer = this.wrapper.find('.roro-repeatable-rows').first();
        this.addBtn = this.wrapper.find('.roro-repeatable-add').first();
        this.blueprint = this.wrapper.find('.roro-repeatable-template').first().html() || '';
        this.rowTemplate = this.wrapper.find('.roro-repeatable-row-template').first().html() || '';

        this.emptyEl = this.wrapper.find('.roro-repeatable-empty').first();
        this.prefix = this.wrapper.attr('data-name') || '';
        this.token = this.wrapper.attr('data-index-token') || '';
        this.itemLabel = this.wrapper.attr('data-item-label') || '';
        this.keyField = this.wrapper.attr('data-key-field') || '';
        this.reorderEnabled = !!this.wrapper.attr('data-reorder');
        this.dragEnabled = !!this.wrapper.attr('data-reorder-drag');
        this.indexed = this.wrapper.attr('data-indexed') !== '0';

        this.min = parseInt(this.wrapper.attr('data-min'), 10);
        if (isNaN(this.min)) this.min = 0;
        const maxAttr = this.wrapper.attr('data-max');
        this.max = (maxAttr === undefined || maxAttr === null || maxAttr === '') ? Infinity : parseInt(maxAttr, 10);

        this.nextIndex = 0;

        const data = this.readRows();
        const count = Math.min(Math.max(this.min, data.length), this.max);
        for (let i = 0; i < count; i++) this.addRow(data[i] || null, true);

        this.bindAdd();
        if (this.dragEnabled) this.bindDragContainer();
        this.refreshControls();
        return this;
    }

    readRows() {
        try {
            const raw = this.wrapper.attr('data-rows');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : Object.values(parsed || {});
        } catch (e) {
            return [];
        }
    }

    count() {
        return this.rowsContainer.children('.roro-repeatable-row').length;
    }

    /**
     * ---------- Add / remove / move ----------
     */
    addRow(data = null, isInit = false) {
        if (this.count() >= this.max) return null;

        const index = this.nextIndex++;
        const $row = $(this.rowTemplate);
        $row.attr('data-roro-index', index);   // stable per-row id for targeting
        const $content = $row.find('.roro-repeatable-row-content').first();
        $content.html(this.blueprint);

        if (data) this.fillRow($content, data);
        this.reindexRow($content, index);

        this.rowsContainer.append($row);   // attach before registering so ids resolve
        this.registerNested($content);
        this.bindRowControls($row);
        if (this.dragEnabled) this.bindRowDrag($row);

        this.refreshControls();
        if (!isInit) this.emitChange();
        return $row;
    }

    removeRow($row) {
        if (this.count() <= this.min || this.isRowLocked($row)) return;
        $row.remove();
        this.refreshControls();
        this.emitChange();
    }

    moveRow($row, dir) {
        if (!this.reorderEnabled) return;
        if (dir < 0) {
            const $prev = $row.prev('.roro-repeatable-row');
            if ($prev.length) $row.insertBefore($prev);
        } else {
            const $next = $row.next('.roro-repeatable-row');
            if ($next.length) $row.insertAfter($next);
        }
        this.refreshControls();
        this.emitChange();
    }

    clearRows() {
        this.rowsContainer.children('.roro-repeatable-row').remove();
        this.refreshControls();
    }

    /**
     * ---------- Per-row targeting & actions ----------
     */
    /**
     * Resolve a single row. A jQuery row passes through. When a key-field is set,
     * the target is treated as that row's KEY (stable across reorder/remove);
     * otherwise a number is a position and anything else matches data-roro-index.
     * Use rowAt()/rowWhere() in the facade for explicit position/predicate lookups.
     */
    rowEl(target) {
        if (target && target.jquery) return target;
        const $rows = this.rowsContainer.children('.roro-repeatable-row');
        if (this.keyField) {
            return $rows.filter((i, el) => String(this.rowKey($(el))) === String(target));
        }
        if (typeof target === 'number') return $rows.eq(target);
        return $rows.filter('[data-roro-index="' + RoroRepeatable.cssEsc(target) + '"]');
    }

    rowAt(index) {
        return this.rowsContainer.children('.roro-repeatable-row').eq(index);
    }

    // The current value of a row's key field (read live, so it survives edits/reorders).
    rowKey($row) {
        if (!this.keyField) return undefined;
        const id = this.rowFieldId($row, this.keyField);
        if (!id) return undefined;
        const inst = (window.listOfSelect || []).find(s => s.id === 'roro-wrapper-' + id);
        return inst ? inst.getValue() : $('[id="' + RoroRepeatable.cssEsc(id) + '"]').val();
    }

    // Prevent (or re-allow) removing a row from the UI; the lock survives refreshes.
    lockRow($row, locked = true) {
        $row.attr('data-roro-locked', locked ? '1' : '0');
        this.refreshControls();
    }

    isRowLocked($row) {
        return $row.attr('data-roro-locked') === '1';
    }

    // Disable/enable every field of a row (its add/remove controls stay managed).
    disableRow($row, disable = true) {
        const $fields = $row.find('.roro-repeatable-row-content');
        $fields.find('input, textarea, select, button').prop('disabled', disable);
        $row.find('.roro-wrapper-select, .roro-wrapper-multi-select').each(function () {
            const inst = (window.listOfSelect || []).find(s => s.id === 'roro-wrapper-' + $(this).data('id'));
            if (inst) inst.ready.then(() => inst.disable(disable));
        });
        $row.attr('data-roro-disabled', disable ? '1' : '0');
    }

    // The element id (or custom-select wrapper id) of a field inside a row, by its
    // blueprint name — so a RoroHandle can drive a single field of a single row.
    rowFieldId($row, name) {
        const self = this;
        let found = null;
        $row.find('.roro-wrapper-select, .roro-wrapper-multi-select').each(function () {
            const $w = $(this);
            const base = $w.hasClass('roro-wrapper-multi-select')
                ? RoroRepeatable.stripArray($w.attr('data-name'))
                : $w.find('.roro-select-hidden').attr('name');
            if (self.deindex(base) === name) { found = String($w.data('id')); return false; }
        });
        if (found) return found;
        $row.find('[name]').each(function () {
            const $el = $(this);
            if ($el.closest('.roro-wrapper-select, .roro-wrapper-multi-select').length) return;
            if (self.deindex($el.attr('name')) === name) { found = $el.attr('id'); return false; }
        });
        return found;
    }

    /**
     * ---------- Value (de)serialization ----------
     */
    getValue() {
        return this.rowsContainer.children('.roro-repeatable-row').toArray().map(row => this.readRow(row));
    }

    // Read one row's submitted data back into an object (or a scalar for flat lists).
    readRow(row) {
        const self = this;
        const obj = {};
        let scalar;
        let isScalar = false;
        $(row).find('[name]').each(function () {
            const $i = $(this);
            if ($i.is(':disabled')) return;
            const type = ($i.attr('type') || '').toLowerCase();
            if ((type === 'checkbox' || type === 'radio') && !$i.is(':checked')) return;

            const base = self.deindex($i.attr('name'));
            if (base === '') {            // flat scalar row: the field IS the row value
                scalar = $i.val();
                isScalar = true;
                return;
            }
            RoroRepeatable.setPath(obj, self.namePath(base), $i.val(), /\[\]$/.test(base));
        });
        return isScalar ? scalar : obj;
    }

    setValue(rows) {
        this.clearRows();
        (Array.isArray(rows) ? rows : []).forEach(data => this.addRow(data, false));
        // Honour the minimum even when fewer rows were provided.
        while (this.count() < this.min) this.addRow(null, false);
    }

    /**
     * ---------- Filling a freshly cloned row from a data object ----------
     *  Runs on base names (before reindexing), so it matches the blueprint.
     */
    fillRow($content, data) {
        const self = this;

        // Flat scalar row (e.g. tags[] => 'red'): the row has a single field.
        if (data !== null && typeof data !== 'object') {
            const $single = $content.find('input, textarea, select').filter('[name]').first();
            if ($single.length) {
                if ($single.is('textarea')) $single.val(data).text(data);
                else $single.attr('value', data).val(data);
            }
            return;
        }

        // Custom single selects: seed the wrapper data-value (read at registration).
        $content.find('.roro-wrapper-select').each(function () {
            const $w = $(this);
            const $hidden = $w.find('.roro-select-hidden').first();
            const v = self.resolve(data, self.fillKey($hidden.attr('name')));
            if (v !== undefined && v !== null) {
                $w.attr('data-value', v);
                $hidden.val(v);
            }
        });

        // Custom multi-selects: seed the wrapper data-values (JSON array).
        $content.find('.roro-wrapper-multi-select').each(function () {
            const $w = $(this);
            let v = self.resolve(data, self.fillKey(RoroRepeatable.stripArray($w.attr('data-name'))));
            if (v === undefined || v === null) v = [];
            if (!Array.isArray(v)) v = [v];
            $w.attr('data-values', JSON.stringify(v));
        });

        // Native fields (skip anything owned by a custom select above).
        $content.find('[name]').each(function () {
            const $el = $(this);
            if ($el.closest('.roro-wrapper-select, .roro-wrapper-multi-select').length) return;

            const v = self.resolve(data, self.fillKey($el.attr('name')));
            if (v === undefined) return;

            const type = ($el.attr('type') || '').toLowerCase();
            if (type === 'checkbox') {
                const elVal = $el.attr('value');
                if (Array.isArray(v)) $el.prop('checked', v.map(String).includes(String(elVal)));
                else if (elVal !== undefined && elVal !== 'on') $el.prop('checked', String(v) === String(elVal));
                else $el.prop('checked', !!v && v !== '0');
            } else if (type === 'radio') {
                $el.prop('checked', String($el.attr('value')) === String(v));
            } else if ($el.is('textarea')) {
                $el.val(v).text(v);
            } else {
                $el.attr('value', v).val(v);
            }
        });
    }

    // Resolve a value out of the row data by a relative key. An empty key means
    // "the whole row" — used by flat scalar lists (e.g. tags[] => 'red').
    resolve(data, name) {
        if (name == null || data == null) return undefined;
        let cur = data;
        for (const seg of this.namePath(name)) {
            if (cur == null) return undefined;
            cur = cur[seg];
        }
        return cur;
    }

    /**
     * Reduce a blueprint field name to the key used to look it up in the row
     * data. Auto-prefix mode keeps relative names as-is ('name', 'addr[city]').
     * Token mode strips the prefix and the index placeholder
     * ('contacts[#][name]' -> 'name', 'tags[#]' -> '' i.e. the scalar itself).
     */
    fillKey(name) {
        if (!name || !this.indexed) return name;
        if (this.token && name.indexOf(this.token) !== -1) {
            let rest = name;
            if (this.prefix && rest.indexOf(this.prefix) === 0) rest = rest.slice(this.prefix.length);
            rest = rest.replace(/^\[[^\]]*\]/, '');     // drop the [#] index segment
            rest = rest.replace(/^\[([^\]]*)\]/, '$1');  // un-bracket the next field segment
            return rest;
        }
        return name;
    }

    // 'addr[city]' -> ['addr','city'] ; 'tags[]' -> ['tags'] ; 'number' -> ['number']
    namePath(name) {
        const parts = [];
        const re = /([^\[\]]+)/g;
        let m;
        while ((m = re.exec(name)) !== null) parts.push(m[1]);
        return parts;
    }

    /**
     * ---------- Reindexing a cloned row ----------
     */
    reindexRow($content, index) {
        this.reindexNames($content, index);
        this.reindexIds($content, '-' + index);
    }

    reindexNames($content, index) {
        const self = this;
        $content.find('[name]').each(function () {
            const $el = $(this);
            if ($el.attr('data-roro-skip-index') !== undefined) return;
            const name = $el.attr('name');
            if (name) $el.attr('name', self.indexName(name, index));
        });

        // Multi-selects submit through runtime hidden inputs named after data-name.
        $content.find('.roro-wrapper-multi-select').each(function () {
            const $w = $(this);
            const dn = $w.attr('data-name');
            if (dn) $w.attr('data-name', self.indexName(dn, index));
        });
    }

    indexName(name, index) {
        if (!this.indexed) return name;   // verbatim names (user controls the naming)
        if (this.token && name.indexOf(this.token) !== -1) {
            return name.split(this.token).join(index);
        }
        if (!this.prefix) return name;
        return this.prefix + '[' + index + ']' + RoroRepeatable.bracketize(name);
    }

    reindexIds($content, suffix) {
        const logical = new Set();
        $content.find('[data-id]').each(function () {
            logical.add(String($(this).attr('data-id')));
        });
        $content.find('[id]').each(function () {
            const id = $(this).attr('id');
            if (id.indexOf('roro-wrapper-') === 0 || id.indexOf('label-') === 0) return;
            logical.add(id);
        });

        logical.forEach(L => {
            const nL = L + suffix;
            const e = RoroRepeatable.cssEsc(L);
            $content.find('[id="' + e + '"]').attr('id', nL);
            $content.find('[id="roro-wrapper-' + e + '"]').attr('id', 'roro-wrapper-' + nL);
            $content.find('[id="label-' + e + '"]').attr('id', 'label-' + nL);
            $content.find('[for="' + e + '"]').attr('for', nL);
            $content.find('[data-id="' + e + '"]').attr('data-id', nL);
        });
    }

    // De-index a full name back to its blueprint base name (inverse of indexName).
    deindex(name) {
        if (!name) return '';
        if (!this.indexed) return name;
        let rest = name;
        if (this.prefix && rest.indexOf(this.prefix) === 0) rest = rest.slice(this.prefix.length);
        rest = rest.replace(/^\[[^\]]*\]/, '');     // drop the [index] segment
        rest = rest.replace(/^\[([^\]]*)\]/, '$1');  // un-bracket the first field segment
        return rest;
    }

    /**
     * ---------- Wiring ----------
     */
    registerNested($content) {
        $content.find('.roro-wrapper-select').each(function () {
            if (window.addSelect) window.addSelect($(this));
        });
        $content.find('.roro-wrapper-multi-select').each(function () {
            if (window.addMultiSelect) window.addMultiSelect($(this));
        });
        $content.find('.roro-input-file').each(function () {
            if (window.RoroFile) new RoroFile($(this).attr('id'));
        });
        $content.find('.roro-border-error').each(function () {
            if (window.manageBorderError) window.manageBorderError($(this));
        });
    }

    bindAdd() {
        const self = this;
        this.addBtn.on('click', function (ev) {
            ev.preventDefault();
            self.addRow(null, false);
        });
    }

    bindRowControls($row) {
        const self = this;
        $row.find('.roro-repeatable-remove').off('click.roro').on('click.roro', function (ev) {
            ev.preventDefault();
            self.removeRow($row);
        });
        $row.find('.roro-repeatable-up').off('click.roro').on('click.roro', function (ev) {
            ev.preventDefault();
            self.moveRow($row, -1);
        });
        $row.find('.roro-repeatable-down').off('click.roro').on('click.roro', function (ev) {
            ev.preventDefault();
            self.moveRow($row, 1);
        });
    }

    /**
     * ---------- Drag & drop reordering (native HTML5 DnD, no dependency) ----------
     *  Desktop pointer drag. The ▲▼ buttons remain the touch/keyboard fallback
     *  (use reorder="both"); HTML5 DnD does not fire from touch.
     */
    bindRowDrag($row) {
        const self = this;
        const $handle = $row.find('.roro-repeatable-handle');
        if (!$handle.length) return;

        // The row is only draggable while the handle is grabbed, so inputs stay usable.
        $handle.off('mousedown.roro mouseup.roro')
            .on('mousedown.roro', () => $row.attr('draggable', 'true'))
            .on('mouseup.roro', () => { if (!self._dragRow) $row.removeAttr('draggable'); });

        $row.off('dragstart.roro dragend.roro')
            .on('dragstart.roro', function (ev) {
                self._dragRow = $row;
                $row.addClass('roro-repeatable-dragging');
                const dt = ev.originalEvent.dataTransfer;
                if (dt) { dt.effectAllowed = 'move'; try { dt.setData('text/plain', ''); } catch (e) {} }
            })
            .on('dragend.roro', function () {
                $row.removeAttr('draggable').removeClass('roro-repeatable-dragging');
                self.rowsContainer.children('.roro-repeatable-row').removeClass('roro-repeatable-drag-over');
                self._dragRow = null;
                self.refreshControls();
                self.emitChange();
            });
    }

    bindDragContainer() {
        const self = this;
        this.rowsContainer.off('dragover.roro drop.roro')
            .on('dragover.roro', function (ev) {
                const $drag = self._dragRow;
                if (!$drag) return;
                ev.preventDefault();
                const $target = $(ev.target).closest('.roro-repeatable-row');
                if (!$target.length || $target.is($drag)) return;

                const rect = $target[0].getBoundingClientRect();
                const after = (ev.originalEvent.clientY - rect.top) > rect.height / 2;
                if (after) {
                    if ($target.next('.roro-repeatable-row')[0] !== $drag[0]) $drag.insertAfter($target);
                } else if ($target.prev('.roro-repeatable-row')[0] !== $drag[0]) {
                    $drag.insertBefore($target);
                }
            })
            .on('drop.roro', function (ev) { ev.preventDefault(); });
    }

    refreshControls() {
        const n = this.count();
        const atMax = n >= this.max;
        this.addBtn.prop('disabled', atMax).toggleClass('roro-repeatable-disabled', atMax);
        if (this.emptyEl && this.emptyEl.length) this.emptyEl.toggle(n === 0);

        const $rows = this.rowsContainer.children('.roro-repeatable-row');
        $rows.each((i, el) => {
            const $r = $(el);
            if (this.itemLabel) $r.find('.roro-repeatable-row-label').first().text(this.itemLabel + ' ' + (i + 1));
            const removable = n > this.min && !this.isRowLocked($r);
            $r.find('.roro-repeatable-remove')
                .prop('disabled', !removable)
                .toggleClass('roro-repeatable-disabled', !removable);
            if (this.reorderEnabled) {
                $r.find('.roro-repeatable-up').prop('disabled', i === 0)
                    .toggleClass('roro-repeatable-disabled', i === 0);
                $r.find('.roro-repeatable-down').prop('disabled', i === n - 1)
                    .toggleClass('roro-repeatable-disabled', i === n - 1);
            }
        });
    }

    emitChange() {
        if (this.wrapper) this.wrapper.trigger('roro:change', [this.getValue()]);
    }

    /**
     * ---------- Static helpers ----------
     */
    // 'number' -> '[number]' ; 'tags[]' -> '[tags][]' ; 'a[b]' -> '[a][b]'
    static bracketize(base) {
        const i = base.indexOf('[');
        if (i === -1) return '[' + base + ']';
        return '[' + base.slice(0, i) + ']' + base.slice(i);
    }

    static stripArray(name) {
        return String(name == null ? '' : name).replace(/\[\]$/, '');
    }

    static cssEsc(v) {
        return String(v == null ? '' : v).replace(/(["\\])/g, '\\$1');
    }

    static setPath(obj, path, value, isArray) {
        let cur = obj;
        for (let i = 0; i < path.length; i++) {
            const k = path[i];
            const last = i === path.length - 1;
            if (last) {
                if (isArray) {
                    if (!Array.isArray(cur[k])) cur[k] = [];
                    cur[k].push(value);
                } else {
                    cur[k] = value;
                }
            } else {
                if (cur[k] == null) cur[k] = {};
                cur = cur[k];
            }
        }
    }
}

window.RoroRepeatable = RoroRepeatable;
