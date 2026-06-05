/**
 * RoroForm facade — a chainable, type-aware wrapper over the runtime
 * primitives. Everything here is additive: every legacy global stays as it was.
 *
 *   roro('email').value('john@x.com').required().focus();
 *   roro('country').addOption('France', 'fr').value('fr');
 *   roro.form('signup').onSuccess(r => ...).fill(user).submit();
 *
 * Dependency-free: it drives the DOM through window.RoroDom + native APIs.
 * Element-returning accessors ($el/$control/$wrapper) return DOM Elements.
 */
(function () {
    const RORO_VERSION = '2.0.0';

    // ---- low-level resolvers -----------------------------------------------

    function byId(id) { return id == null ? null : document.getElementById(id); }
    function wrapperOf(id) { return id == null ? null : document.getElementById('roro-wrapper-' + id); }

    // CSS-attribute-selector safe value.
    function cssEsc(v) { return String(v == null ? '' : v).replace(/(["\\])/g, '\\$1'); }

    // Names are equal whether or not they carry a trailing "[]".
    function nameEq(a, b) {
        const strip = s => String(s == null ? '' : s).replace(/\[\]$/, '');
        return strip(a) === strip(b);
    }

    // Logical id from a string or a DOM node.
    function toId(target) {
        if (target == null) return null;
        if (typeof target === 'string') return target.replace(/^#/, '');
        if (target.nodeType !== 1) return null;
        if (target.dataset && target.dataset.id) return String(target.dataset.id);
        return (target.getAttribute('id') || '').replace(/^roro-wrapper-/, '');
    }

    function resolveType(id) {
        const w = wrapperOf(id);
        if (w) {
            if (w.classList.contains('roro-wrapper-select')) return 'select';
            if (w.classList.contains('roro-wrapper-multi-select')) return 'multi-select';
            if (w.classList.contains('roro-wrapper-repeatable')) return 'repeatable';
        }

        const el = byId(id);
        if (!el) return 'unknown';
        if (el.tagName === 'FORM') return 'form';
        if (el.classList.contains('roro-input-checkbox')) return 'checkbox';
        if (el.classList.contains('roro-input-radio')) return 'radio';
        if (el.classList.contains('roro-input-file')) return 'file';
        if (el.tagName === 'TEXTAREA') return 'textarea';
        if (el.tagName === 'SELECT') return 'native-select';
        if (el.tagName === 'INPUT') return (el.getAttribute('type') || 'text').toLowerCase();
        return 'unknown';
    }

    // Underlying RoroSelect / RoroMultiSelect instance (or null).
    function getSelectInstance(id) {
        return (window.listOfSelect || []).find(s => s.id === 'roro-wrapper-' + id) || null;
    }

    // Underlying RoroRepeatable instance (or null).
    function getRepeatableInstance(id) {
        return (window.listOfRepeatable || []).find(r => r.id === 'roro-wrapper-' + id) || null;
    }

    // ---- form (de)serialization --------------------------------------------

    function serializeForm(form) {
        const out = {};
        RoroDom.serializeArray(form).forEach(({ name, value }) => {
            const isArray = name.endsWith('[]');
            const key = name.replace(/\[\]$/, '');
            if (isArray) {
                (out[key] = out[key] || []).push(value);
            } else if (key in out) {
                out[key] = Array.isArray(out[key]) ? out[key].concat(value) : [out[key], value];
            } else {
                out[key] = value;
            }
        });
        return out;
    }

    function fillForm(form, data) {
        if (!form) return;
        Object.keys(data).forEach(name => {
            const value = data[name];

            // Repeatable group (matched by its wrapper data-name).
            const rep = RoroDom.qsa(form, '.roro-wrapper-repeatable').find(el => nameEq(el.dataset.name, name));
            if (rep) { new RoroHandle(String(rep.dataset.id)).value(value); return; }

            // Custom multi-select (matched by its wrapper data-name).
            const ms = RoroDom.qsa(form, '.roro-wrapper-multi-select').find(el => nameEq(el.dataset.name, name));
            if (ms) { new RoroHandle(String(ms.dataset.id)).value(value); return; }

            // Custom single select (matched by its hidden input name).
            const sh = RoroDom.qsa(form, '.roro-select-hidden').find(el => nameEq(el.getAttribute('name'), name));
            if (sh) { new RoroHandle(sh.id).value(value); return; }

            // Native fields, matched by name.
            let els = RoroDom.qsa(form, `[name="${cssEsc(name)}"]`);
            if (!els.length) els = RoroDom.qsa(form, `[name="${cssEsc(name)}[]"]`);

            // Convenience fallback: treat the key as an element id.
            if (!els.length) {
                if (byId(name) || wrapperOf(name)) new RoroHandle(name).value(value);
                return;
            }

            const type = (els[0].getAttribute('type') || '').toLowerCase();

            if (type === 'checkbox') {
                if (els.length === 1) {
                    els[0].checked = !!value;
                } else {
                    const vals = (Array.isArray(value) ? value : [value]).map(String);
                    els.forEach(el => { el.checked = vals.includes(String(el.value)); });
                }
                els.forEach(el => RoroDom.emit(el, 'change'));
                return;
            }

            if (type === 'radio') {
                els.forEach(el => { el.checked = false; });
                const match = els.find(el => String(el.value) === String(value));
                if (match) match.checked = true;
                els.forEach(el => RoroDom.emit(el, 'change'));
                return;
            }

            // Text-like: spread an array across the matching [] inputs (one each),
            // otherwise set the single value.
            if (Array.isArray(value) && els.length > 1) {
                els.forEach((el, i) => { el.value = i < value.length ? value[i] : ''; });
            } else {
                els.forEach(el => { el.value = value; });
            }
            els.forEach(el => RoroDom.emit(el, 'change'));
        });
    }

    // ---- input handle ------------------------------------------------------

    class RoroHandle {
        constructor(id) { this.id = id; }

        // -- introspection --
        type() { return resolveType(this.id); }
        exists() { return !!(this.el() || this.wrapper()); }
        el() { return byId(this.id); }
        $el() { return this.el(); }
        select() { return getSelectInstance(this.id); }
        repeatable() { return getRepeatableInstance(this.id); }

        // The primary interactive node (text input of a select, otherwise el).
        control() {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') {
                return RoroDom.qs(wrapperOf(this.id), '.roro-select-text-input');
            }
            return this.el();
        }
        $control() { return this.control(); }

        wrapper() {
            const t = this.type();
            if (t === 'select' || t === 'multi-select' || t === 'repeatable') return wrapperOf(this.id);
            return roroGetWrapper(this.id);
        }
        $wrapper() { return this.wrapper(); }

        name() {
            const t = this.type();
            if (t === 'multi-select') { const w = wrapperOf(this.id); return w ? w.dataset.name : null; }
            if (t === 'select') { const h = RoroDom.qs(wrapperOf(this.id), '.roro-select-hidden'); return h ? h.getAttribute('name') : null; }
            const el = this.el();
            return el ? el.getAttribute('name') : null;
        }

        // -- value (type-aware get/set) --
        value(v) {
            const t = this.type();
            const get = (v === undefined);

            if (t === 'select') {
                const s = this.select();
                if (get) return s ? s.getValue() : null;
                if (s) s.ready.then(() => s.setOptionSelected(v));
                return this;
            }
            if (t === 'multi-select') {
                const s = this.select();
                if (get) return s ? s.getValue() : [];
                if (s) s.ready.then(() => {
                    s.clearInput();
                    (Array.isArray(v) ? v : [v]).forEach(val => s.toggleOption(val));
                });
                return this;
            }
            if (t === 'checkbox') {
                const el = this.el();
                if (get) return !!(el && el.checked);
                if (el) { el.checked = !!v; RoroDom.emit(el, 'change'); }
                return this;
            }
            if (t === 'radio') {
                const el = this.el();
                const name = el ? el.getAttribute('name') : null;
                const group = name ? RoroDom.qsa(`input[type=radio][name="${cssEsc(name)}"]`) : (el ? [el] : []);
                if (get) { const sel = group.find(r => r.checked); return sel === undefined ? null : (sel ? sel.value : null); }
                group.forEach(r => { r.checked = false; });
                const match = group.find(r => String(r.value) === String(v));
                if (match) match.checked = true;
                group.forEach(r => RoroDom.emit(r, 'change'));
                return this;
            }
            if (t === 'file') {
                const el = this.el();
                if (get) return el ? Array.from(el.files).map(f => f.name) : [];
                if (!v) this.clear(); // files can't be set programmatically, only cleared
                return this;
            }
            if (t === 'repeatable') {
                const r = this.repeatable();
                if (get) return r ? r.getValue() : [];
                if (r) r.ready.then(() => r.setValue(v));
                return this;
            }

            const el = this.el();
            if (get) return el ? el.value : undefined;
            if (el) { el.value = v; RoroDom.emit(el, 'change'); }
            return this;
        }
        val(v) { return this.value(v); }

        clear() {
            const t = this.type();
            if (t === 'repeatable') return this._withRepeatable(r => r.setValue([]));
            if (t === 'select' || t === 'multi-select') return this._withSelect(s => s.clearInput());
            if (t === 'checkbox') { const el = this.el(); if (el) { el.checked = false; RoroDom.emit(el, 'change'); } return this; }
            if (t === 'radio') {
                const el = this.el();
                const name = el ? el.getAttribute('name') : null;
                if (name) RoroDom.qsa(`input[type=radio][name="${cssEsc(name)}"]`).forEach(r => { r.checked = false; RoroDom.emit(r, 'change'); });
                return this;
            }
            if (t === 'file') { const el = this.el(); if (el) { el.value = ''; RoroDom.emit(el, 'change'); } return this; }
            const el = this.el(); if (el) { el.value = ''; RoroDom.emit(el, 'change'); }
            return this;
        }
        reset() { return this.clear(); }

        // -- state --
        disable(b = true) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') { roroDisableSelect(this.id, b); return this; }
            const el = this.el(); if (el) el.disabled = !!b;
            return this;
        }
        enable() { return this.disable(false); }

        readonly(b = true) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') { roroReadonlySelect(this.id, b); return this; }
            const el = this.el(); if (el) el.readOnly = !!b;
            return this;
        }
        editable() { return this.readonly(false); }

        required(b = true) { const el = this.el(); if (el) el.required = !!b; return this; }
        optional() { return this.required(false); }

        isDisabled() {
            const s = this.select();
            if (s) return !!s.isDisabled();
            const el = this.el();
            return !!(el && el.disabled);
        }
        isReadonly() {
            const s = this.select();
            if (s) return !!s.isReadonly();
            const el = this.el();
            return !!(el && el.readOnly);
        }
        isRequired() { const el = this.el(); return !!(el && el.required); }

        // -- visibility (wrapper level) --
        show() { RoroDom.show(this.wrapper()); return this; }
        hide() { RoroDom.hide(this.wrapper()); return this; }
        toggle(b) { RoroDom.toggle(this.wrapper(), b); return this; }
        isVisible() { return RoroDom.isVisible(this.wrapper()); }

        // -- error message --
        error(message = '') { roroShowError(this.id, message, true); return this; }
        clearError() { roroShowError(this.id, '', false); return this; }

        // -- focus --
        focus() { const c = this.control(); if (c) c.focus(); return this; }
        blur() { const c = this.control(); if (c) c.blur(); return this; }

        // -- meta --
        label(text) {
            const l = byId('label-' + this.id);
            if (!l) return text === undefined ? null : this;

            const node = Array.from(l.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
            if (text === undefined) return node ? node.textContent.trim() : l.textContent.trim();

            if (node) node.textContent = text + ' ';
            else l.insertBefore(document.createTextNode(text + ' '), l.firstChild);
            return this;
        }
        placeholder(text) {
            const c = this.control();
            if (text === undefined) return c ? c.getAttribute('placeholder') : undefined;
            if (c) c.setAttribute('placeholder', text);
            return this;
        }

        // -- events --
        on(events, fn) { RoroDom.on(this.control(), events, fn); return this; }
        off(events, fn) { RoroDom.off(this.control(), events, fn); return this; }
        trigger(event, detail) { RoroDom.emit(this.control(), event, detail); return this; }
        change(fn) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select' || t === 'repeatable') {
                RoroDom.on(wrapperOf(this.id), 'roro:change', (e) => fn(e.detail, e));
                return this;
            }
            RoroDom.on(this.control(), 'change', fn);
            return this;
        }
        input(fn) { return this.on('input', fn); }
        click(fn) { return this.on('click', fn); }

        // -- attribute / class pass-through --
        attr(name, val) {
            const el = this.el();
            if (val === undefined && typeof name !== 'object') return el ? el.getAttribute(name) : undefined;
            if (el) {
                if (typeof name === 'object') Object.keys(name).forEach(k => el.setAttribute(k, name[k]));
                else el.setAttribute(name, val);
            }
            return this;
        }
        prop(name, val) {
            const el = this.el();
            const key = name === 'readonly' ? 'readOnly' : name;
            if (val === undefined) return el ? el[key] : undefined;
            if (el) el[key] = val;
            return this;
        }
        addClass(c) { const el = this.control(); if (el) RoroDom.addClass(el, c); return this; }
        removeClass(c) { const el = this.control(); if (el) RoroDom.removeClass(el, c); return this; }
        toggleClass(c, b) { const el = this.control(); if (el) el.classList.toggle(c, b); return this; }

        // -- select-only (no-op on other types) --
        _withSelect(cb) {
            const s = this.select();
            if (s) s.ready.then(() => cb(s));
            return this;
        }
        addOption(label, value, category = null) {
            return this._withSelect(s => s.addOption(label, value, category));
        }
        addOptions(list) {
            return this._withSelect(s =>
                (list || []).forEach(o => s.addOption(o.label, o.value, o.category ?? o.categoryLabel ?? null)));
        }
        addOptionsAjax(url, params = {}) { return roroAddOptionsAjax(this.id, url, params); }
        removeOption(value) {
            return this._withSelect(s => {
                const opt = s.options.find(o => o.value == value);
                if (!opt) return;
                s.removeOption(opt);
                const current = s.getValue();
                if (Array.isArray(current)) {
                    if (current.includes(value)) s.toggleOption(value);
                } else if (current == value) {
                    s.clearInput();
                }
            });
        }
        clearOptions() {
            return this._withSelect(s => {
                s.options.slice().forEach(o => s.removeOption(o));
                s.clearInput();
            });
        }
        setOptions(list) {
            return this._withSelect(s => {
                s.options.slice().forEach(o => s.removeOption(o));
                (list || []).forEach(o => s.addOption(o.label, o.value, o.category ?? o.categoryLabel ?? null));
            });
        }
        options() {
            const s = this.select();
            return s ? s.options.map(o => ({ label: o.label, value: o.value, category: o.categoryLabel })) : [];
        }
        selected() { return this.value(); }
        open() { roroShowDropDown(this.id, true); return this; }
        close() { roroShowDropDown(this.id, false); return this; }
        toggleOpen() { return this._withSelect(s => s.toggleDropDown()); }

        // -- repeatable-only (no-op on other types) --
        _withRepeatable(cb) {
            const r = this.repeatable();
            if (r) r.ready.then(() => cb(r));
            return this;
        }
        addRow(data = null) { return this._withRepeatable(r => r.addRow(data, false)); }
        removeRow(index) {
            return this._withRepeatable(r => {
                const row = (index instanceof Element) ? index : r.rows()[parseInt(index, 10) || 0];
                if (row) r.removeRow(row);
            });
        }
        clearRows() { return this._withRepeatable(r => r.setValue([])); }
        rows() { const r = this.repeatable(); return r ? r.getValue() : []; }
        rowsCount() { const r = this.repeatable(); return r ? r.count() : 0; }

        // A handle on a single row. With a key-field, `target` is the row's KEY
        // (stable); otherwise it's a position. Use rowAt()/rowWhere() to be explicit.
        row(target) {
            const r = this.repeatable();
            return new RoroRepeatableRowHandle(r, r ? r.rowEl(target) : null);
        }
        rowAt(index) {
            const r = this.repeatable();
            return new RoroRepeatableRowHandle(r, r ? r.rowAt(index) : null);
        }
        rowWhere(predicate) {
            const r = this.repeatable();
            if (!r) return new RoroRepeatableRowHandle(null, null);
            const el = r.rows().find(el => { try { return predicate(r.readRow(el), el); } catch (e) { return false; } });
            return new RoroRepeatableRowHandle(r, el || null);
        }
        rowHandles() {
            const r = this.repeatable();
            if (!r) return [];
            return r.rows().map(el => new RoroRepeatableRowHandle(r, el));
        }
    }

    // ---- repeatable row handle ---------------------------------------------

    class RoroRepeatableRowHandle {
        constructor(repeatable, row) { this.r = repeatable; this.row = row; }

        el() { return this.row; }
        $el() { return this.row; }
        exists() { return !!this.row; }
        index() { return this.exists() ? RoroDom.index(this.row) : -1; }
        key() { return this.exists() && this.r ? this.r.rowKey(this.row) : undefined; }

        // Drive one field of this row by its blueprint name -> a full RoroHandle.
        field(name) { return new RoroHandle(this.r ? this.r.rowFieldId(this.row, name) : null); }
        fields() {
            if (!this.exists()) return [];
            return roro.all(this.row);
        }

        value(data) {
            if (!this.exists()) return data === undefined ? null : this;
            if (data === undefined) return this.r.readRow(this.row);
            if (data === null || typeof data !== 'object') {
                const content = RoroDom.qs(this.row, '.roro-repeatable-row-content');
                const single = content ? RoroDom.qsa(content, 'input[name], select[name], textarea[name]')[0] : null;
                if (single) new RoroHandle(single.id).value(data);
                return this;
            }
            Object.keys(data).forEach(k => this.field(k).value(data[k]));
            return this;
        }

        remove() { if (this.exists()) this.r.removeRow(this.row); return this; }
        lockRemoval(b = true) { if (this.exists()) this.r.lockRow(this.row, b); return this; }
        allowRemoval() { return this.lockRemoval(false); }
        isRemovable() { return this.exists() && !this.r.isRowLocked(this.row)
            && this.r.count() > this.r.min; }

        disable(b = true) { if (this.exists()) this.r.disableRow(this.row, b); return this; }
        enable() { return this.disable(false); }

        moveUp() { if (this.exists()) this.r.moveRow(this.row, -1); return this; }
        moveDown() { if (this.exists()) this.r.moveRow(this.row, 1); return this; }
    }

    // ---- form handle -------------------------------------------------------

    class RoroFormHandle {
        constructor(id) { this.id = id; }

        el() { return byId(this.id); }
        $el() { return this.el(); }
        exists() { const el = this.el(); return !!(el && el.tagName === 'FORM'); }

        field(nameOrId) {
            if (byId(nameOrId) || wrapperOf(nameOrId)) return new RoroHandle(nameOrId);

            const f = this.el();
            if (!f) return new RoroHandle(nameOrId);

            const rep = RoroDom.qsa(f, '.roro-wrapper-repeatable').find(el => nameEq(el.dataset.name, nameOrId));
            if (rep) return new RoroHandle(String(rep.dataset.id));

            const ms = RoroDom.qsa(f, '.roro-wrapper-multi-select').find(el => nameEq(el.dataset.name, nameOrId));
            if (ms) return new RoroHandle(String(ms.dataset.id));

            const sh = RoroDom.qsa(f, '.roro-select-hidden').find(el => nameEq(el.getAttribute('name'), nameOrId));
            if (sh) return new RoroHandle(sh.id);

            const byName = RoroDom.qs(f, `[name="${cssEsc(nameOrId)}"], [name="${cssEsc(nameOrId)}[]"]`);
            if (byName) return new RoroHandle(byName.id);

            return new RoroHandle(nameOrId);
        }
        fields() { return roro.all(this.el()); }

        data() { return serializeForm(this.el()); }
        serialize() { return this.data(); }
        fill(data) { fillForm(this.el(), data || {}); return this; }

        reset() {
            const el = this.el();
            if (el && el.reset) el.reset();
            RoroDom.qsa(el, '.roro-wrapper-select, .roro-wrapper-multi-select').forEach((w) => {
                const s = getSelectInstance(w.dataset.id);
                if (s) s.ready.then(() => s.clearInput());
            });
            return this;
        }
        clear() { this.fields().forEach(h => h.clear()); return this; }

        submit() {
            const btn = this._submitButton();
            if (btn) {
                roroSubmitButton(btn.id, this.id);
            } else {
                const el = this.el();
                if (el) el.requestSubmit ? el.requestSubmit() : el.submit();
            }
            return this;
        }
        _submitButton() {
            let btn = document.querySelector(`.roro-btn-submit[data-form-id="${cssEsc(this.id)}"]`);
            if (!btn) { const el = this.el(); btn = el ? RoroDom.qs(el, '.roro-btn-submit') : null; }
            return btn;
        }

        validate() { const el = this.el(); return el ? el.reportValidity() : false; }
        isValid() { const el = this.el(); return el ? el.checkValidity() : false; }

        errors(obj) { populateFormErrors(this.el(), obj || {}); return this; }
        clearErrors() { clearFormErrors(this.el()); return this; }

        disable(b = true) { this.fields().forEach(h => h.disable(b)); return this; }
        enable() { return this.disable(false); }

        overlay(b = true) { roroShowOverlay(b); return this; }

        on(event, fn) {
            const el = this.el();
            // success/error are aliases for the roro:ajax:* CustomEvents; the
            // callback receives (payload, event) — payload is event.detail.
            if (event === 'success') { RoroDom.on(el, 'roro:ajax:success', e => fn(e.detail, e)); return this; }
            if (event === 'error') { RoroDom.on(el, 'roro:ajax:error', e => fn(e.detail, e)); return this; }
            RoroDom.on(el, event, fn);
            return this;
        }
        onSuccess(fn) { return this.on('success', fn); }
        onError(fn) { return this.on('error', fn); }
    }

    // ---- entry point -------------------------------------------------------

    function roro(target) {
        const id = toId(target);
        const el = byId(id);
        if (el && el.tagName === 'FORM') return new RoroFormHandle(id);
        return new RoroHandle(id);
    }

    roro.version = RORO_VERSION;
    roro.field = (target) => new RoroHandle(toId(target));
    roro.form = (target) => new RoroFormHandle(toId(target));
    roro.select = (target) => getSelectInstance(toId(target));
    roro.repeatable = (target) => getRepeatableInstance(toId(target));
    roro.exists = (target) => roro(target).exists();
    roro.ready = (fn) => { RoroDom.ready(fn); return roro; };
    roro.all = function (root) {
        root = root || document;
        const ids = new Set();
        RoroDom.qsa(root, '.roro-input[id]').forEach(el => ids.add(el.id));
        RoroDom.qsa(root, '.roro-wrapper-select, .roro-wrapper-multi-select, .roro-wrapper-repeatable').forEach(el => {
            const id = el.dataset.id;
            if (id != null) ids.add(String(id));
        });
        return Array.from(ids).map(id => new RoroHandle(id));
    };

    // ---- exports + flat one-liner helpers ----------------------------------

    window.roro = roro;
    window.RoroHandle = RoroHandle;
    window.RoroFormHandle = RoroFormHandle;
    window.RoroRepeatableRowHandle = RoroRepeatableRowHandle;
    window.roroGetSelect = getSelectInstance;
    window.roroGetRepeatable = getRepeatableInstance;

    window.roroField = (id) => roro.field(id);
    window.roroValue = (id, v) => roro(id).value(v);
    window.roroClear = (id) => roro(id).clear();
    window.roroDisable = (id, b = true) => roro(id).disable(b);
    window.roroEnable = (id) => roro(id).enable();
    window.roroReadonly = (id, b = true) => roro(id).readonly(b);
    window.roroRequired = (id, b = true) => roro(id).required(b);
    window.roroShow = (id) => roro(id).show();
    window.roroHide = (id) => roro(id).hide();
    window.roroToggleVisibility = (id, b) => roro(id).toggle(b);
    window.roroFocus = (id) => roro(id).focus();
    window.roroClearError = (id) => roro(id).clearError();
    window.roroOnChange = (id, fn) => roro(id).change(fn);
    window.roroLabel = (id, text) => roro(id).label(text);

    window.roroAddRow = (id, data) => roro(id).addRow(data);
    window.roroRemoveRow = (id, index) => roro(id).removeRow(index);
    window.roroClearRows = (id) => roro(id).clearRows();
    window.roroRows = (id) => roro(id).rows();
    window.roroRowsCount = (id) => roro(id).rowsCount();
    window.roroRow = (id, target) => roro(id).row(target);
    window.roroRowField = (id, target, name) => roro(id).row(target).field(name);
    window.roroLockRow = (id, target, b = true) => roro(id).row(target).lockRemoval(b);

    window.roroAddOptions = (id, list) => roro(id).addOptions(list);
    window.roroRemoveOption = (id, value) => roro(id).removeOption(value);
    window.roroClearOptions = (id) => roro(id).clearOptions();
    window.roroSetOptions = (id, list) => roro(id).setOptions(list);
    window.roroOptions = (id) => roro(id).options();

    window.roroFormData = (formId) => roro.form(formId).data();
    window.roroFillForm = (formId, data) => roro.form(formId).fill(data);
    window.roroResetForm = (formId) => roro.form(formId).reset();
    window.roroClearForm = (formId) => roro.form(formId).clear();
    window.roroSubmit = (formId) => roro.form(formId).submit();
    window.roroValidateForm = (formId) => roro.form(formId).validate();
    window.roroFormErrors = (formId, errors) => roro.form(formId).errors(errors);
    window.roroClearFormErrors = (formId) => roro.form(formId).clearErrors();
    window.roroOnSuccess = (formId, fn) => roro.form(formId).onSuccess(fn);
    window.roroOnError = (formId, fn) => roro.form(formId).onError(fn);
})();
