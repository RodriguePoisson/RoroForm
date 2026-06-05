/**
 * RoroForm facade — a chainable, type-aware wrapper over the existing
 * window.roro* primitives. Everything here is additive: every legacy global
 * stays exactly as it was.
 *
 *   roro('email').value('john@x.com').required().focus();
 *   roro('country').addOption('France', 'fr').value('fr');
 *   roro.form('signup').onSuccess(r => ...).fill(user).submit();
 *
 * The whole library is jQuery-based, so this layer is too.
 */
(function () {
    const RORO_VERSION = '1.0.0';

    // ---- low-level resolvers -----------------------------------------------

    function $byId(id) { return $('#' + id); }
    function $wrapperOf(id) { return $('#roro-wrapper-' + id); }

    // CSS-attribute-selector safe value.
    function cssEsc(v) { return String(v == null ? '' : v).replace(/(["\\])/g, '\\$1'); }

    // Names are equal whether or not they carry a trailing "[]".
    function nameEq(a, b) {
        const strip = s => String(s == null ? '' : s).replace(/\[\]$/, '');
        return strip(a) === strip(b);
    }

    // Logical id from a string, a DOM node or a jQuery object.
    function toId(target) {
        if (target == null) return null;
        if (typeof target === 'string') return target.replace(/^#/, '');
        const $t = target.jquery ? target : $(target);
        if (!$t.length) return null;
        if ($t.data('id')) return String($t.data('id'));
        return ($t.attr('id') || '').replace(/^roro-wrapper-/, '');
    }

    function resolveType(id) {
        const $w = $wrapperOf(id);
        if ($w.hasClass('roro-wrapper-select')) return 'select';
        if ($w.hasClass('roro-wrapper-multi-select')) return 'multi-select';
        if ($w.hasClass('roro-wrapper-repeatable')) return 'repeatable';

        const $el = $byId(id);
        if ($el.is('form')) return 'form';
        if ($el.hasClass('roro-input-checkbox')) return 'checkbox';
        if ($el.hasClass('roro-input-radio')) return 'radio';
        if ($el.hasClass('roro-input-file')) return 'file';
        if ($el.is('textarea')) return 'textarea';
        if ($el.is('select')) return 'native-select';
        if ($el.is('input')) return ($el.attr('type') || 'text').toLowerCase();
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

    function serializeForm($form) {
        const out = {};
        $form.serializeArray().forEach(({ name, value }) => {
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

    function fillForm($form, data) {
        Object.keys(data).forEach(name => {
            const value = data[name];

            // Repeatable group (matched by its wrapper data-name).
            const $rep = $form.find('.roro-wrapper-repeatable')
                .filter((i, el) => nameEq($(el).data('name'), name));
            if ($rep.length) { new RoroHandle(String($rep.data('id'))).value(value); return; }

            // Custom multi-select (matched by its wrapper data-name).
            const $ms = $form.find('.roro-wrapper-multi-select')
                .filter((i, el) => nameEq($(el).data('name'), name));
            if ($ms.length) { new RoroHandle(String($ms.data('id'))).value(value); return; }

            // Custom single select (matched by its hidden input name).
            const $sh = $form.find('.roro-select-hidden')
                .filter((i, el) => nameEq($(el).attr('name'), name));
            if ($sh.length) { new RoroHandle($sh.attr('id')).value(value); return; }

            // Native fields, matched by name.
            let $els = $form.find(`[name="${cssEsc(name)}"]`);
            if (!$els.length) $els = $form.find(`[name="${cssEsc(name)}[]"]`);

            // Convenience fallback: treat the key as an element id.
            if (!$els.length) {
                if ($byId(name).length || $wrapperOf(name).length) new RoroHandle(name).value(value);
                return;
            }

            const type = ($els.attr('type') || '').toLowerCase();

            if (type === 'checkbox') {
                if ($els.length === 1) {
                    $els.prop('checked', !!value);
                } else {
                    const vals = (Array.isArray(value) ? value : [value]).map(String);
                    $els.each(function () { $(this).prop('checked', vals.includes(String($(this).val()))); });
                }
                $els.trigger('change');
                return;
            }

            if (type === 'radio') {
                $els.prop('checked', false).filter(`[value="${cssEsc(value)}"]`).prop('checked', true);
                $els.trigger('change');
                return;
            }

            if (Array.isArray(value) && $els.length > 1) {
                $els.each(function (i) { $(this).val(i < value.length ? value[i] : ''); });
            } else {
                $els.val(value);
            }
            $els.trigger('change');
        });
    }

    // ---- input handle ------------------------------------------------------

    class RoroHandle {
        constructor(id) { this.id = id; }

        // -- introspection --
        type() { return resolveType(this.id); }
        exists() { return this.$el().length > 0 || this.$wrapper().length > 0; }
        $el() { return $byId(this.id); }
        el() { return this.$el()[0] || null; }
        select() { return getSelectInstance(this.id); }
        repeatable() { return getRepeatableInstance(this.id); }

        // The primary interactive node (text input of a select, otherwise $el).
        $control() {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') {
                return $wrapperOf(this.id).find('.roro-select-text-input');
            }
            return this.$el();
        }

        $wrapper() {
            const t = this.type();
            if (t === 'select' || t === 'multi-select' || t === 'repeatable') return $wrapperOf(this.id);
            return roroGetWrapper(this.id);
        }

        name() {
            const t = this.type();
            if (t === 'multi-select') return $wrapperOf(this.id).data('name');
            if (t === 'select') return $wrapperOf(this.id).find('.roro-select-hidden').attr('name');
            return this.$el().attr('name');
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
                const $el = this.$el();
                if (get) return $el.is(':checked');
                $el.prop('checked', !!v).trigger('change');
                return this;
            }
            if (t === 'radio') {
                const name = this.$el().attr('name');
                const $group = name ? $(`input[type=radio][name="${cssEsc(name)}"]`) : this.$el();
                if (get) { const sel = $group.filter(':checked').val(); return sel === undefined ? null : sel; }
                $group.prop('checked', false).filter(`[value="${cssEsc(v)}"]`).prop('checked', true);
                $group.trigger('change');
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

            const $el = this.$el();
            if (get) return $el.val();
            $el.val(v).trigger('change');
            return this;
        }
        val(v) { return this.value(v); }

        clear() {
            const t = this.type();
            if (t === 'repeatable') return this._withRepeatable(r => r.setValue([]));
            if (t === 'select' || t === 'multi-select') return this._withSelect(s => s.clearInput());
            if (t === 'checkbox') { this.$el().prop('checked', false).trigger('change'); return this; }
            if (t === 'radio') {
                const name = this.$el().attr('name');
                $(`input[type=radio][name="${cssEsc(name)}"]`).prop('checked', false).trigger('change');
                return this;
            }
            if (t === 'file') {
                const el = this.el();
                if (el) { el.value = ''; $(el).trigger('change'); }
                return this;
            }
            this.$el().val('').trigger('change');
            return this;
        }
        reset() { return this.clear(); }

        // -- state --
        disable(b = true) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') { roroDisableSelect(this.id, b); return this; }
            this.$el().prop('disabled', !!b);
            return this;
        }
        enable() { return this.disable(false); }

        readonly(b = true) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select') { roroReadonlySelect(this.id, b); return this; }
            this.$el().prop('readonly', !!b);
            return this;
        }
        editable() { return this.readonly(false); }

        required(b = true) { this.$el().prop('required', !!b); return this; }
        optional() { return this.required(false); }

        isDisabled() {
            const s = this.select();
            return s ? !!s.isDisabled() : !!this.$el().prop('disabled');
        }
        isReadonly() {
            const s = this.select();
            return s ? !!s.isReadonly() : !!this.$el().prop('readonly');
        }
        isRequired() { return !!this.$el().prop('required'); }

        // -- visibility (wrapper level) --
        show() { this.$wrapper().show(); return this; }
        hide() { this.$wrapper().hide(); return this; }
        toggle(b) { this.$wrapper().toggle(b); return this; }
        isVisible() { return this.$wrapper().is(':visible'); }

        // -- error message --
        error(message = '') { roroShowError(this.id, message, true); return this; }
        clearError() { roroShowError(this.id, '', false); return this; }

        // -- focus --
        focus() { this.$control().trigger('focus'); return this; }
        blur() { this.$control().trigger('blur'); return this; }

        // -- meta --
        label(text) {
            const $l = $('#label-' + this.id);
            if (!$l.length) return text === undefined ? null : this;

            const node = Array.from($l[0].childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
            if (text === undefined) return node ? node.textContent.trim() : $l.text().trim();

            if (node) node.textContent = text + ' ';
            else $l.prepend(document.createTextNode(text + ' '));
            return this;
        }
        placeholder(text) {
            const $c = this.$control();
            if (text === undefined) return $c.attr('placeholder');
            $c.attr('placeholder', text);
            return this;
        }

        // -- events --
        on(events, fn) { this.$control().on(events, fn); return this; }
        off(events, fn) { this.$control().off(events, fn); return this; }
        trigger(event, extra) { this.$control().trigger(event, extra); return this; }
        change(fn) {
            const t = this.type();
            if (t === 'select' || t === 'multi-select' || t === 'repeatable') {
                $wrapperOf(this.id).on('roro:change', (e, val) => fn(val, e));
                return this;
            }
            this.$control().on('change', fn);
            return this;
        }
        input(fn) { return this.on('input', fn); }
        click(fn) { return this.on('click', fn); }

        // -- attribute / class pass-through --
        attr(name, val) {
            if (val === undefined && typeof name !== 'object') return this.$el().attr(name);
            this.$el().attr(name, val);
            return this;
        }
        prop(name, val) {
            if (val === undefined) return this.$el().prop(name);
            this.$el().prop(name, val);
            return this;
        }
        addClass(c) { this.$control().addClass(c); return this; }
        removeClass(c) { this.$control().removeClass(c); return this; }
        toggleClass(c, b) { this.$control().toggleClass(c, b); return this; }

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
                const $row = (index && index.jquery)
                    ? index
                    : r.rowsContainer.children('.roro-repeatable-row').eq(parseInt(index, 10) || 0);
                if ($row && $row.length) r.removeRow($row);
            });
        }
        clearRows() { return this._withRepeatable(r => r.setValue([])); }
        rows() { const r = this.repeatable(); return r ? r.getValue() : []; }
        rowsCount() { const r = this.repeatable(); return r ? r.count() : 0; }

        // A handle on a single row. With a key-field, `target` is the row's KEY
        // (stable); otherwise it's a position. Use rowAt()/rowWhere() to be explicit.
        row(target) {
            const r = this.repeatable();
            return new RoroRepeatableRowHandle(r, r ? r.rowEl(target) : $());
        }
        rowAt(index) {
            const r = this.repeatable();
            return new RoroRepeatableRowHandle(r, r ? r.rowAt(index) : $());
        }
        rowWhere(predicate) {
            const r = this.repeatable();
            if (!r) return new RoroRepeatableRowHandle(null, $());
            const el = r.rowsContainer.children('.roro-repeatable-row').toArray()
                .find(el => { try { return predicate(r.readRow(el), $(el)); } catch (e) { return false; } });
            return new RoroRepeatableRowHandle(r, el ? $(el) : $());
        }
        rowHandles() {
            const r = this.repeatable();
            if (!r) return [];
            return r.rowsContainer.children('.roro-repeatable-row').toArray()
                .map(el => new RoroRepeatableRowHandle(r, $(el)));
        }
    }

    // ---- repeatable row handle ---------------------------------------------

    class RoroRepeatableRowHandle {
        constructor(repeatable, $row) { this.r = repeatable; this.$row = $row; }

        $el() { return this.$row; }
        exists() { return !!(this.$row && this.$row.length); }
        index() { return this.exists() ? this.$row.index() : -1; }
        key() { return this.exists() && this.r ? this.r.rowKey(this.$row) : undefined; }

        // Drive one field of this row by its blueprint name -> a full RoroHandle.
        field(name) { return new RoroHandle(this.r ? this.r.rowFieldId(this.$row, name) : null); }
        fields() {
            if (!this.exists()) return [];
            return roro.all(this.$row);
        }

        value(data) {
            if (!this.exists()) return data === undefined ? null : this;
            if (data === undefined) return this.r.readRow(this.$row[0]);
            if (data === null || typeof data !== 'object') {
                const $single = this.$row.find('.roro-repeatable-row-content :input[name]').first();
                if ($single.length) new RoroHandle($single.attr('id')).value(data);
                return this;
            }
            Object.keys(data).forEach(k => this.field(k).value(data[k]));
            return this;
        }

        remove() { if (this.exists()) this.r.removeRow(this.$row); return this; }
        lockRemoval(b = true) { if (this.exists()) this.r.lockRow(this.$row, b); return this; }
        allowRemoval() { return this.lockRemoval(false); }
        isRemovable() { return this.exists() && !this.r.isRowLocked(this.$row)
            && this.r.count() > this.r.min; }

        disable(b = true) { if (this.exists()) this.r.disableRow(this.$row, b); return this; }
        enable() { return this.disable(false); }

        moveUp() { if (this.exists()) this.r.moveRow(this.$row, -1); return this; }
        moveDown() { if (this.exists()) this.r.moveRow(this.$row, 1); return this; }
    }

    // ---- form handle -------------------------------------------------------

    class RoroFormHandle {
        constructor(id) { this.id = id; }

        $el() { return $byId(this.id); }
        el() { return this.$el()[0] || null; }
        exists() { return this.$el().is('form'); }

        field(nameOrId) {
            if ($byId(nameOrId).length || $wrapperOf(nameOrId).length) return new RoroHandle(nameOrId);

            const $f = this.$el();
            const $rep = $f.find('.roro-wrapper-repeatable')
                .filter((i, el) => nameEq($(el).data('name'), nameOrId));
            if ($rep.length) return new RoroHandle(String($rep.data('id')));

            const $ms = $f.find('.roro-wrapper-multi-select')
                .filter((i, el) => nameEq($(el).data('name'), nameOrId));
            if ($ms.length) return new RoroHandle(String($ms.data('id')));

            const $sh = $f.find('.roro-select-hidden')
                .filter((i, el) => nameEq($(el).attr('name'), nameOrId));
            if ($sh.length) return new RoroHandle($sh.attr('id'));

            const $byName = $f.find(`[name="${cssEsc(nameOrId)}"], [name="${cssEsc(nameOrId)}[]"]`).first();
            if ($byName.length) return new RoroHandle($byName.attr('id'));

            return new RoroHandle(nameOrId);
        }
        fields() { return roro.all(this.$el()); }

        data() { return serializeForm(this.$el()); }
        serialize() { return this.data(); }
        fill(data) { fillForm(this.$el(), data || {}); return this; }

        reset() {
            const el = this.el();
            if (el && el.reset) el.reset();
            this.$el().find('.roro-wrapper-select, .roro-wrapper-multi-select').each((i, w) => {
                const s = getSelectInstance($(w).data('id'));
                if (s) s.ready.then(() => s.clearInput());
            });
            return this;
        }
        clear() { this.fields().forEach(h => h.clear()); return this; }

        submit() {
            const $btn = this._submitButton();
            if ($btn.length) {
                roroSubmitButton($btn.attr('id'), this.id);
            } else {
                const el = this.el();
                if (el) el.requestSubmit ? el.requestSubmit() : el.submit();
            }
            return this;
        }
        _submitButton() {
            let $btn = $(`.roro-btn-submit[data-form-id="${cssEsc(this.id)}"]`);
            if (!$btn.length) $btn = this.$el().find('.roro-btn-submit').first();
            return $btn;
        }

        validate() { const el = this.el(); return el ? el.reportValidity() : false; }
        isValid() { const el = this.el(); return el ? el.checkValidity() : false; }

        errors(obj) { populateFormErrors(this.$el(), obj || {}); return this; }
        clearErrors() { clearFormErrors(this.$el()); return this; }

        disable(b = true) { this.fields().forEach(h => h.disable(b)); return this; }
        enable() { return this.disable(false); }

        overlay(b = true) { roroShowOverlay(b); return this; }

        on(event, fn) {
            const map = { success: 'roro:ajax:success', error: 'roro:ajax:error' };
            this.$el().on(map[event] || event, fn);
            return this;
        }
        onSuccess(fn) { return this.on('success', fn); }
        onError(fn) { return this.on('error', fn); }
    }

    // ---- entry point -------------------------------------------------------

    function roro(target) {
        const id = toId(target);
        if (id && $byId(id).is('form')) return new RoroFormHandle(id);
        return new RoroHandle(id);
    }

    roro.version = RORO_VERSION;
    roro.field = (target) => new RoroHandle(toId(target));
    roro.form = (target) => new RoroFormHandle(toId(target));
    roro.select = (target) => getSelectInstance(toId(target));
    roro.repeatable = (target) => getRepeatableInstance(toId(target));
    roro.exists = (target) => roro(target).exists();
    roro.ready = (fn) => { $(fn); return roro; };
    roro.all = function (root) {
        const $root = root ? $(root) : $(document);
        const ids = new Set();
        $root.find('.roro-input[id]').each(function () { ids.add($(this).attr('id')); });
        $root.find('.roro-wrapper-select, .roro-wrapper-multi-select, .roro-wrapper-repeatable').each(function () {
            const id = $(this).data('id');
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
