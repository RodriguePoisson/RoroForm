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
        if (!this.elt) return this;   // element vanished before init (null-safe, like jQuery)
        this.wrapper = this.elt;
        this.rowsContainer = RoroDom.qs(this.wrapper, '.roro-repeatable-rows');
        this.addBtn = RoroDom.qs(this.wrapper, '.roro-repeatable-add');

        const blueprintEl = RoroDom.qs(this.wrapper, '.roro-repeatable-template');
        this.blueprint = blueprintEl ? blueprintEl.innerHTML : '';
        const rowTemplateEl = RoroDom.qs(this.wrapper, '.roro-repeatable-row-template');
        this.rowTemplate = rowTemplateEl ? rowTemplateEl.innerHTML : '';

        this.emptyEl = RoroDom.qs(this.wrapper, '.roro-repeatable-empty');
        this.prefix = this.wrapper.getAttribute('data-name') || '';
        this.token = this.wrapper.getAttribute('data-index-token') || '';
        this.itemLabel = this.wrapper.getAttribute('data-item-label') || '';
        this.keyField = this.wrapper.getAttribute('data-key-field') || '';
        this.reorderEnabled = !!this.wrapper.getAttribute('data-reorder');
        this.indexed = this.wrapper.getAttribute('data-indexed') !== '0';

        this.min = parseInt(this.wrapper.getAttribute('data-min'), 10);
        if (isNaN(this.min)) this.min = 0;
        const maxAttr = this.wrapper.getAttribute('data-max');
        this.max = (maxAttr === null || maxAttr === '') ? Infinity : parseInt(maxAttr, 10);

        this.nextIndex = 0;

        const data = this.readRows();
        const count = Math.min(Math.max(this.min, data.length), this.max);
        for (let i = 0; i < count; i++) this.addRow(data[i] || null, true);

        this.bindAdd();
        this.refreshControls();
        return this;
    }

    readRows() {
        try {
            const raw = this.wrapper.getAttribute('data-rows');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : Object.values(parsed || {});
        } catch (e) {
            return [];
        }
    }

    count() {
        return this.rows().length;
    }

    // The live row Elements (direct children of the rows container).
    rows() {
        return RoroDom.children(this.rowsContainer, '.roro-repeatable-row');
    }

    /**
     * ---------- Add / remove / move ----------
     */
    addRow(data = null, isInit = false) {
        if (this.count() >= this.max) return null;

        const index = this.nextIndex++;
        const row = RoroDom.fromHTML(this.rowTemplate);
        row.setAttribute('data-roro-index', index);   // stable per-row id for targeting
        const content = RoroDom.qs(row, '.roro-repeatable-row-content');
        content.innerHTML = this.blueprint;

        if (data) this.fillRow(content, data);
        this.reindexRow(content, index);

        this.rowsContainer.appendChild(row);   // attach before registering so ids resolve
        this.registerNested(content);
        this.bindRowControls(row);

        this.refreshControls();
        if (!isInit) this.emitChange();
        return row;
    }

    removeRow(row) {
        if (this.count() <= this.min || this.isRowLocked(row)) return;
        row.remove();
        this.refreshControls();
        this.emitChange();
    }

    moveRow(row, dir) {
        if (!this.reorderEnabled) return;
        if (dir < 0) {
            const prev = this.adjacentRow(row, 'previous');
            if (prev) prev.parentNode.insertBefore(row, prev);
        } else {
            const next = this.adjacentRow(row, 'next');
            if (next) next.parentNode.insertBefore(row, next.nextSibling);
        }
        this.refreshControls();
        this.emitChange();
    }

    adjacentRow(row, dir) {
        const prop = dir === 'previous' ? 'previousElementSibling' : 'nextElementSibling';
        let node = row[prop];
        while (node && !node.matches('.roro-repeatable-row')) node = node[prop];
        return node;
    }

    clearRows() {
        this.rows().forEach(row => row.remove());
        this.refreshControls();
    }

    /**
     * ---------- Per-row targeting & actions ----------
     */
    /**
     * Resolve a single row. A row Element passes through. When a key-field is
     * set, the target is treated as that row's KEY (stable across reorder/remove);
     * otherwise a number is a position and anything else matches data-roro-index.
     * Use rowAt()/rowWhere() in the facade for explicit position/predicate lookups.
     */
    rowEl(target) {
        if (target instanceof Element) return target;
        const rows = this.rows();
        if (this.keyField) {
            return rows.find(el => String(this.rowKey(el)) === String(target)) || null;
        }
        if (typeof target === 'number') return rows[target] || null;
        return rows.find(el => el.getAttribute('data-roro-index') === String(target)) || null;
    }

    rowAt(index) {
        return this.rows()[index] || null;
    }

    // The current value of a row's key field (read live, so it survives edits/reorders).
    rowKey(row) {
        if (!this.keyField) return undefined;
        const id = this.rowFieldId(row, this.keyField);
        if (!id) return undefined;
        const inst = (window.listOfSelect || []).find(s => s.id === 'roro-wrapper-' + id);
        if (inst) return inst.getValue();
        const el = document.getElementById(id);
        return el ? el.value : undefined;
    }

    // Prevent (or re-allow) removing a row from the UI; the lock survives refreshes.
    lockRow(row, locked = true) {
        row.setAttribute('data-roro-locked', locked ? '1' : '0');
        this.refreshControls();
    }

    isRowLocked(row) {
        return row.getAttribute('data-roro-locked') === '1';
    }

    // Disable/enable every field of a row (its add/remove controls stay managed).
    disableRow(row, disable = true) {
        const content = RoroDom.qs(row, '.roro-repeatable-row-content');
        if (content) {
            RoroDom.qsa(content, 'input, textarea, select, button').forEach(el => { el.disabled = disable; });
        }
        RoroDom.qsa(row, '.roro-wrapper-select, .roro-wrapper-multi-select').forEach(function (w) {
            const inst = (window.listOfSelect || []).find(s => s.id === 'roro-wrapper-' + w.dataset.id);
            if (inst) inst.ready.then(() => inst.disable(disable));
        });
        row.setAttribute('data-roro-disabled', disable ? '1' : '0');
    }

    // The element id (or custom-select wrapper id) of a field inside a row, by its
    // blueprint name — so a RoroHandle can drive a single field of a single row.
    rowFieldId(row, name) {
        let found = null;

        const wrappers = RoroDom.qsa(row, '.roro-wrapper-select, .roro-wrapper-multi-select');
        for (const w of wrappers) {
            const hidden = RoroDom.qs(w, '.roro-select-hidden');
            const base = w.classList.contains('roro-wrapper-multi-select')
                ? RoroRepeatable.stripArray(w.getAttribute('data-name'))
                : (hidden ? hidden.getAttribute('name') : null);
            if (this.deindex(base) === name) { found = String(w.dataset.id); break; }
        }
        if (found) return found;

        for (const el of RoroDom.qsa(row, '[name]')) {
            if (el.closest('.roro-wrapper-select, .roro-wrapper-multi-select')) continue;
            if (this.deindex(el.getAttribute('name')) === name) { found = el.id; break; }
        }
        return found;
    }

    /**
     * ---------- Value (de)serialization ----------
     */
    getValue() {
        return this.rows().map(row => this.readRow(row));
    }

    // Read one row's submitted data back into an object (or a scalar for flat lists).
    readRow(row) {
        const obj = {};
        let scalar;
        let isScalar = false;
        RoroDom.qsa(row, '[name]').forEach((i) => {
            if (i.disabled) return;
            const type = (i.getAttribute('type') || '').toLowerCase();
            if ((type === 'checkbox' || type === 'radio') && !i.checked) return;

            const base = this.deindex(i.getAttribute('name'));
            if (base === '') {            // flat scalar row: the field IS the row value
                scalar = i.value;
                isScalar = true;
                return;
            }
            RoroRepeatable.setPath(obj, this.namePath(base), i.value, /\[\]$/.test(base));
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
    fillRow(content, data) {
        const self = this;

        // Flat scalar row (e.g. tags[] => 'red'): the row has a single field.
        if (data !== null && typeof data !== 'object') {
            const single = RoroDom.qsa(content, 'input, textarea, select').filter(el => el.hasAttribute('name'))[0];
            if (single) {
                if (single.tagName === 'TEXTAREA') { single.value = data; single.textContent = data; }
                else { single.setAttribute('value', data); single.value = data; }
            }
            return;
        }

        // Custom single selects: seed the wrapper data-value (read at registration).
        RoroDom.qsa(content, '.roro-wrapper-select').forEach(function (w) {
            const hidden = RoroDom.qs(w, '.roro-select-hidden');
            const v = self.resolve(data, self.fillKey(hidden ? hidden.getAttribute('name') : null));
            if (v !== undefined && v !== null) {
                w.setAttribute('data-value', v);
                if (hidden) hidden.value = v;
            }
        });

        // Custom multi-selects: seed the wrapper data-values (JSON array).
        RoroDom.qsa(content, '.roro-wrapper-multi-select').forEach(function (w) {
            let v = self.resolve(data, self.fillKey(RoroRepeatable.stripArray(w.getAttribute('data-name'))));
            if (v === undefined || v === null) v = [];
            if (!Array.isArray(v)) v = [v];
            w.setAttribute('data-values', JSON.stringify(v));
        });

        // Native fields (skip anything owned by a custom select above).
        RoroDom.qsa(content, '[name]').forEach(function (el) {
            if (el.closest('.roro-wrapper-select, .roro-wrapper-multi-select')) return;

            const v = self.resolve(data, self.fillKey(el.getAttribute('name')));
            if (v === undefined) return;

            const type = (el.getAttribute('type') || '').toLowerCase();
            if (type === 'checkbox') {
                const elVal = el.getAttribute('value');
                if (Array.isArray(v)) el.checked = v.map(String).includes(String(elVal));
                else if (elVal !== null && elVal !== 'on') el.checked = String(v) === String(elVal);
                else el.checked = !!v && v !== '0';
            } else if (type === 'radio') {
                el.checked = String(el.getAttribute('value')) === String(v);
            } else if (el.tagName === 'TEXTAREA') {
                el.value = v; el.textContent = v;
            } else {
                el.setAttribute('value', v); el.value = v;
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
    reindexRow(content, index) {
        this.reindexNames(content, index);
        this.reindexIds(content, '-' + index);
    }

    reindexNames(content, index) {
        RoroDom.qsa(content, '[name]').forEach((el) => {
            if (el.hasAttribute('data-roro-skip-index')) return;
            const name = el.getAttribute('name');
            if (name) el.setAttribute('name', this.indexName(name, index));
        });

        // Multi-selects submit through runtime hidden inputs named after data-name.
        RoroDom.qsa(content, '.roro-wrapper-multi-select').forEach((w) => {
            const dn = w.getAttribute('data-name');
            if (dn) w.setAttribute('data-name', this.indexName(dn, index));
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

    reindexIds(content, suffix) {
        const logical = new Set();
        RoroDom.qsa(content, '[data-id]').forEach(el => logical.add(String(el.getAttribute('data-id'))));
        RoroDom.qsa(content, '[id]').forEach(el => {
            const id = el.getAttribute('id');
            if (id.indexOf('roro-wrapper-') === 0 || id.indexOf('label-') === 0) return;
            logical.add(id);
        });

        logical.forEach(L => {
            const nL = L + suffix;
            const e = RoroRepeatable.cssEsc(L);
            RoroDom.qsa(content, '[id="' + e + '"]').forEach(el => el.setAttribute('id', nL));
            RoroDom.qsa(content, '[id="roro-wrapper-' + e + '"]').forEach(el => el.setAttribute('id', 'roro-wrapper-' + nL));
            RoroDom.qsa(content, '[id="label-' + e + '"]').forEach(el => el.setAttribute('id', 'label-' + nL));
            RoroDom.qsa(content, '[for="' + e + '"]').forEach(el => el.setAttribute('for', nL));
            RoroDom.qsa(content, '[data-id="' + e + '"]').forEach(el => el.setAttribute('data-id', nL));
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
    registerNested(content) {
        RoroDom.qsa(content, '.roro-wrapper-select').forEach(function (el) {
            if (window.addSelect) window.addSelect(el);
        });
        RoroDom.qsa(content, '.roro-wrapper-multi-select').forEach(function (el) {
            if (window.addMultiSelect) window.addMultiSelect(el);
        });
        RoroDom.qsa(content, '.roro-input-file').forEach(function (el) {
            if (window.RoroFile) new RoroFile(el.id);
        });
        RoroDom.qsa(content, '.roro-border-error').forEach(function (el) {
            if (window.manageBorderError) window.manageBorderError(el);
        });
    }

    bindAdd() {
        const self = this;
        RoroDom.on(this.addBtn, 'click', function (ev) {
            ev.preventDefault();
            self.addRow(null, false);
        });
    }

    bindRowControls(row) {
        const self = this;
        RoroDom.on(RoroDom.qs(row, '.roro-repeatable-remove'), 'click', function (ev) {
            ev.preventDefault();
            self.removeRow(row);
        });
        RoroDom.on(RoroDom.qs(row, '.roro-repeatable-up'), 'click', function (ev) {
            ev.preventDefault();
            self.moveRow(row, -1);
        });
        RoroDom.on(RoroDom.qs(row, '.roro-repeatable-down'), 'click', function (ev) {
            ev.preventDefault();
            self.moveRow(row, 1);
        });
    }

    refreshControls() {
        const n = this.count();
        const atMax = n >= this.max;
        if (this.addBtn) {
            this.addBtn.disabled = atMax;
            this.addBtn.classList.toggle('roro-repeatable-disabled', atMax);
        }
        if (this.emptyEl) RoroDom.toggle(this.emptyEl, n === 0);

        const rows = this.rows();
        rows.forEach((el, i) => {
            if (this.itemLabel) {
                const lbl = RoroDom.qs(el, '.roro-repeatable-row-label');
                if (lbl) lbl.textContent = this.itemLabel + ' ' + (i + 1);
            }
            const removable = n > this.min && !this.isRowLocked(el);
            const remove = RoroDom.qs(el, '.roro-repeatable-remove');
            if (remove) {
                remove.disabled = !removable;
                remove.classList.toggle('roro-repeatable-disabled', !removable);
            }
            if (this.reorderEnabled) {
                const up = RoroDom.qs(el, '.roro-repeatable-up');
                if (up) { up.disabled = i === 0; up.classList.toggle('roro-repeatable-disabled', i === 0); }
                const down = RoroDom.qs(el, '.roro-repeatable-down');
                if (down) { down.disabled = i === n - 1; down.classList.toggle('roro-repeatable-disabled', i === n - 1); }
            }
        });
    }

    emitChange() {
        if (this.wrapper) RoroDom.emit(this.wrapper, 'roro:change', this.getValue());
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
