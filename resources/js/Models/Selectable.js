/**
 * --------------------------
 *  Option / Category
 *  Thin wrappers around the DOM nodes rendered server-side (no AJAX: we read
 *  and clone the existing DOM).
 * --------------------------
 */

// data-disable / data-readonly / data-show are "1"/"0" (or legacy "true"/"").
function boolData(el, key) {
    if (!el) return false;
    const v = el.dataset[key];
    return v === '1' || v === 'true';
}

class RoroOption {
    constructor(node) {
        this.elt = node;
        this.id = node.id;
        this.value = node.dataset.value;
        this.label = node.dataset.label;
    }

    get categoryLabel() {
        const cat = this.elt.closest('.roro-select-category');
        return cat ? cat.dataset.category : null;
    }

    bindClick(select) {
        // Drop the previous handler first => no double-binding after a re-render.
        if (this._onClick) this.elt.removeEventListener('click', this._onClick);
        this._onClick = () => select.handleOptionClick(this);
        this.elt.addEventListener('click', this._onClick);
    }

    mark() {
        this.elt.setAttribute('aria-selected', 'true');
        RoroDom.qsa(this.elt, '.roro-select-option-check, .roro-select-option-overlay')
            .forEach(e => RoroDom.show(e));
    }

    unmark() {
        this.elt.setAttribute('aria-selected', 'false');
        RoroDom.qsa(this.elt, '.roro-select-option-check, .roro-select-option-overlay')
            .forEach(e => RoroDom.hide(e));
    }
}

class RoroCategory {
    constructor(node) {
        this.elt = node;
        this.id = node.id;
        this.label = node.dataset.category;
    }

    get optionsContainer() {
        return RoroDom.qs(this.elt, '.roro-select-category-options-container');
    }
}

/**
 * --------------------------
 *  Selectable (base class)
 * --------------------------
 */
class Selectable extends Input {
    categories = [];
    options = [];
    optionsFiltered = [];
    activeIndex = -1;       // keyboard-active option (a11y combobox)
    closeOnSelect = true;   // single select closes on pick; multi stays open

    constructor(id, prefixId = '', values = null) {
        super('select', id, prefixId);
        this.values = values;

        // Chain init after the wrapper has been resolved (instead of overwriting
        // the parent's promise) to avoid a fragile timing dependency.
        const baseReady = this.ready;
        this.ready = baseReady.then(() => this.init());
    }

    init() {
        if (!this.elt) return this;   // element vanished before init (null-safe, like jQuery)
        this._initializing = true;
        this.readDom();
        this.bindBaseEvents();
        this.showDropDown();
        this.initValues();
        this.handleDisableReadonly();
        this._initializing = false;
        return this;
    }

    // Fire 'roro:change' on the wrapper whenever the value changes — but stay
    // silent during the initial population so handlers don't run on load.
    emitChange() {
        if (this._initializing) return;
        if (this.elt) RoroDom.emit(this.elt, 'roro:change', this.getValue());
    }

    // Read the options + categories already rendered server-side in the dropdown.
    readDom() {
        this.categories = RoroDom.qsa(this.dropdown, '.roro-select-category')
            .map(node => new RoroCategory(node));
        this.options = RoroDom.qsa(this.dropdown, '.roro-select-option')
            .map(node => new RoroOption(node));
        this.options.forEach(option => option.bindClick(this));
    }

    // Child overrides.
    initValues() {}
    actualize() {}
    clearInput() { throw new Error('clearInput() must be implemented in child class'); }
    setHiddenValue() { throw new Error('setHiddenValue() must be implemented in child class'); }
    getValue() { throw new Error('getValue() must be implemented in child class'); }
    handleOptionClick() { throw new Error('handleOptionClick() must be implemented in child class'); }

    /**
     * ---------- Dynamic add (client-side clone, no request) ----------
     */
    addOption(label, value, categoryLabel = null) {
        const optionEl = RoroDom.children(this.templates, '.roro-select-option')[0].cloneNode(true);
        optionEl.id = Selectable.uid('roro-select-option');
        optionEl.dataset.value = value;
        optionEl.dataset.label = label;
        const labelEl = RoroDom.qs(optionEl, '.roro-select-option-label');
        if (labelEl) labelEl.textContent = label;

        const container = categoryLabel ? this.ensureCategory(categoryLabel).optionsContainer : this.dropdown;
        container.appendChild(optionEl);

        const option = new RoroOption(optionEl);
        option.bindClick(this);
        this.options.push(option);
        return option;
    }

    ensureCategory(categoryLabel) {
        const existing = this.categories.find(c => c.label === categoryLabel);
        if (existing) return existing;

        const catEl = RoroDom.children(this.templates, '.roro-select-category')[0].cloneNode(true);
        catEl.id = Selectable.uid('roro-select-category');
        catEl.dataset.category = categoryLabel;
        const labelEl = RoroDom.qs(catEl, '.roro-select-category-label');
        if (labelEl) labelEl.textContent = categoryLabel;
        this.dropdown.appendChild(catEl);

        const category = new RoroCategory(catEl);
        this.categories.push(category);
        return category;
    }

    removeOption(option) {
        this.options = this.options.filter(opt => opt.id !== option.id);
        option.elt.remove();
    }

    static uid(prefix) {
        return `${prefix}-${crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    }

    /**
     * ---------- Filtering ----------
     */
    filterOptions(filterText = '') {
        const needle = filterText.toLowerCase();
        this.optionsFiltered = this.options.filter(o => (o.label ?? '').toLowerCase().includes(needle));
    }

    showFilteredOptions() {
        const text = this.textInput.value || this.textInput.textContent;
        if (!text) {
            this.options.forEach(o => RoroDom.show(o.elt));
            return;
        }
        this.options.forEach(o => RoroDom.hide(o.elt));
        this.optionsFiltered.forEach(o => RoroDom.show(o.elt));
    }

    /**
     * ---------- State ----------
     */
    isDisabled() { return boolData(this.elt, 'disable'); }
    isReadonly() { return boolData(this.elt, 'readonly'); }

    handleDisableReadonly() {
        if (boolData(this.elt, 'disable')) {
            this.disable(true);
        } else {
            this.disable(false);
            this.readonly(boolData(this.elt, 'readonly'));
        }
    }

    disable(disable = true) {
        this.elt.style.pointerEvents = disable ? 'none' : 'auto';
        this.elt.dataset.disable = disable ? '1' : '0';
        if (this.textInput) this.textInput.disabled = disable;
        RoroDom.qsa(this.elt, '.roro-input-hidden').forEach(h => { h.disabled = disable; });
    }

    readonly(readonly = true) {
        this.elt.style.pointerEvents = readonly ? 'none' : 'auto';
        this.elt.dataset.readonly = readonly ? '1' : '0';
        if (this.textInput) this.textInput.readOnly = readonly;
        RoroDom.qsa(this.elt, '.roro-input-hidden').forEach(h => { h.readOnly = readonly; });
    }

    /**
     * ---------- Dropdown (memoized DOM refs) ----------
     */
    get selectWrapper() { return (this._selectWrapper ??= document.getElementById(this.id)); }
    get dropdown() { return (this._dropdown ??= RoroDom.qs(this.selectWrapper, '.roro-select-dropdown')); }
    get templates() { return (this._templates ??= RoroDom.qs(this.selectWrapper, '.roro-select-templates')); }
    get textInput() { return (this._textInput ??= RoroDom.qs(this.elt, '.roro-select-text-input')); }

    showDropDown(show) {
        if (show !== undefined) this.selectWrapper.dataset.show = show ? '1' : '0';
        const open = boolData(this.selectWrapper, 'show');
        if (open) RoroDom.show(this.dropdown); else RoroDom.hide(this.dropdown);
        if (this.isA11y()) {
            this.textInput.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (!open) this.clearActive();
        }
    }

    toggleDropDown() {
        roroShowDropDown(this.id.replace('roro-wrapper-', ''), !boolData(this.selectWrapper, 'show'));
    }

    /**
     * ---------- Events ----------
     */
    bindBaseEvents() {
        RoroDom.on(this.textInput, 'input', () => {
            this.filterOptions((this.textInput.value || '') + (this.textInput.textContent || ''));
            this.showFilteredOptions();
            if (this.isA11y()) this.clearActive();
        });

        RoroDom.on(this.selectWrapper, 'click', () => this.toggleDropDown());

        const clearBtn = RoroDom.qs(this.elt, '.roro-select-clear-button');
        RoroDom.on(clearBtn, 'click', ev => {
            ev.stopPropagation();
            this.clearInput();
        });

        if (this.isA11y()) {
            RoroDom.on(this.textInput, 'keydown', ev => this.handleKeydown(ev));
        }
    }

    /**
     * ---------- Keyboard a11y (ARIA combobox) ----------
     * Active only when the control is a role="combobox" (the raw theme). The
     * Tailwind/Bootstrap themes don't carry the role yet, so they are untouched.
     */
    isA11y() {
        return !!(this.textInput && this.textInput.getAttribute
            && this.textInput.getAttribute('role') === 'combobox');
    }

    // Options currently visible in the dropdown (skips filtered-out + templates).
    navOptions() {
        return this.options.filter(o =>
            o.elt && o.elt.style.display !== 'none' && !o.elt.closest('.roro-select-templates'));
    }

    clearActive() {
        this.options.forEach(o => o.elt.classList.remove('roro-option-active'));
        this.activeIndex = -1;
        if (this.textInput) this.textInput.setAttribute('aria-activedescendant', '');
    }

    setActive(index, list) {
        const options = list || this.navOptions();
        if (!options.length) return;
        if (index < 0) index = options.length - 1;
        if (index >= options.length) index = 0;

        this.options.forEach(o => o.elt.classList.remove('roro-option-active'));
        this.activeIndex = index;
        const opt = options[index];
        opt.elt.classList.add('roro-option-active');
        this.textInput.setAttribute('aria-activedescendant', opt.elt.id || '');
        if (opt.elt.scrollIntoView) opt.elt.scrollIntoView({ block: 'nearest' });
    }

    handleKeydown(ev) {
        const open = boolData(this.selectWrapper, 'show');
        const options = this.navOptions();

        switch (ev.key) {
            case 'ArrowDown':
                ev.preventDefault();
                if (!open) { this.showDropDown(true); this.setActive(0, options); }
                else this.setActive(this.activeIndex + 1, options);
                break;
            case 'ArrowUp':
                ev.preventDefault();
                if (!open) { this.showDropDown(true); this.setActive(options.length - 1, options); }
                else this.setActive(this.activeIndex - 1, options);
                break;
            case 'Home':
                if (open) { ev.preventDefault(); this.setActive(0, options); }
                break;
            case 'End':
                if (open) { ev.preventDefault(); this.setActive(options.length - 1, options); }
                break;
            case 'Enter':
                if (open && this.activeIndex >= 0 && options[this.activeIndex]) {
                    ev.preventDefault();
                    this.handleOptionClick(options[this.activeIndex]);
                    if (this.closeOnSelect) this.showDropDown(false);
                }
                break;
            case 'Escape':
                if (open) { ev.preventDefault(); this.showDropDown(false); }
                break;
            case 'Tab':
                if (open) this.showDropDown(false);
                break;
        }
    }

    /**
     * ---------- Helpers ----------
     */
    setTextInputValue(value) {
        this.textInput.value = value;
    }

    resetOptionMarkers() {
        this.options.forEach(o => o.unmark());
    }
}

/**
 * --------------------------
 *  Single Select
 * --------------------------
 */
class Select extends Selectable {
    optionSelected = null;
    value = null;

    constructor(id, value = null) {
        super(id, 'roro-wrapper');
        this.value = value;
    }

    initValues() {
        this.setOptionSelected(this.value);
    }

    actualize() {
        this.resetOptionMarkers();
        if (this.optionSelected) {
            this.setTextInputValue(this.optionSelected.label);
            this.optionSelected.mark();
        } else {
            this.setTextInputValue('');
        }
    }

    // Reset state, shared between the null case and the not-found case.
    resetSelection() {
        this.optionSelected = null;
        this.value = null;
        this.setHiddenValue('');
        this.setTextInputValue('');
        this.actualize();
    }

    setOptionSelected(optionValue) {
        if (optionValue === null || optionValue === undefined) {
            this.resetSelection();
            return;
        }

        const found = this.options.find(option => option.value == optionValue);
        if (!found) {
            this.resetSelection();
            return;
        }

        this.optionSelected = found;
        this.value = optionValue;
        this.setHiddenValue(optionValue);
        this.actualize();
    }

    handleOptionClick(option) {
        this.setOptionSelected(option.value);
    }

    clearInput() {
        this.setOptionSelected(null);
    }

    setHiddenValue(value) {
        let h = RoroDom.qs(this.elt, '.roro-select-hidden');
        if (h) {
            h.value = value;
        } else {
            h = document.createElement('input');
            h.type = 'hidden';
            h.className = 'roro-select-hidden';
            h.setAttribute('name', this.id);
            h.value = value;
            this.elt.appendChild(h);
        }
        this.emitChange();
    }

    getValue() {
        return this.value;
    }
}

/**
 * --------------------------
 *  Multi Select
 * --------------------------
 */
class MultiSelect extends Selectable {
    listTag = [];
    closeOnSelect = false;   // keep the listbox open while picking multiple

    constructor(id, name, values = []) {
        super(id, 'roro-wrapper', values);
        this.name = name;
        this.ready.then(() => this.actualize());
    }

    initValues() {
        super.initValues();
        this.values.forEach(val => this.toggleOption(val, true));
    }

    actualize() {
        this.listTag = [];
        this.resetOptionMarkers();
        this.textInput.innerHTML = '';

        this.options
            .filter(option => this.values.includes(option.value))
            .forEach(option => {
                // Clone the tag (+ caret zone) from the cached template.
                const tagNodes = RoroDom.children(this.templates, '.tag, .caret-zone')
                    .map(n => n.cloneNode(true));
                const tagId = Selectable.uid('roro-tag');
                const tagSpan = tagNodes.find(n => n.matches('.tag'));

                if (tagSpan) {
                    tagSpan.id = tagId;
                    tagSpan.dataset.value = option.value;
                    const txt = RoroDom.qs(tagSpan, '.roro-multi-select-text-tag-text');
                    if (txt) txt.textContent = option.label;
                }

                tagNodes.forEach(n => this.textInput.appendChild(n));
                option.mark();
                this.listTag.push({ id: tagId, value: option.value, elt: tagNodes });

                if (tagSpan) {
                    const clearBtn = RoroDom.qs(tagSpan, '.roro-multi-select-text-tag-clear-button');
                    RoroDom.on(clearBtn, 'click', () => this.toggleOption(option.value));
                }
            });
    }

    handleOptionClick(option) {
        this.toggleOption(option.value);
    }

    toggleOption(value, init = false) {
        if (!this.values.includes(value)) {
            this.values.push(value);
        } else if (!init) {
            this.values = this.values.filter(v => v !== value);
        }
        this.setHiddenValue(this.values);
        if (!init) {
            this.actualize();
        }
    }

    clearInput() {
        this.values = [];
        this.setHiddenValue([]);
        this.actualize();
    }

    setHiddenValue(values) {
        RoroDom.qsa(this.elt, '.roro-multi-select-hidden').forEach(h => h.remove());
        if (!Array.isArray(values)) values = [];
        values.forEach(v => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.className = 'roro-multi-select-hidden';
            input.setAttribute('name', this.name);
            input.value = v;
            if (this.isDisabled()) input.disabled = true;
            if (this.isReadonly()) input.readOnly = true;
            this.elt.appendChild(input);
        });
        this.emitChange();
    }

    getValue() {
        return this.values;
    }

    filterOptions(filterText = '') {
        const needles = [filterText.toLowerCase().trim()];
        // Only the live caret-zones inside the text input carry typed text; the
        // .roro-select-templates copy is empty and would inject an '' needle that
        // matches every option.
        RoroDom.qsa(this.textInput, '.caret-zone').forEach(function (el) {
            needles.push((el.textContent || '').toLowerCase().trim());
        });
        this.optionsFiltered = this.options.filter(option =>
            needles.some(needle => (option.label ?? '').toLowerCase().trim().includes(needle))
        );
    }

    bindBaseEvents() {
        super.bindBaseEvents();

        // Backspace removes a tag: the tag disappears from the DOM, so drop its value.
        RoroDom.on(this.textInput, 'input', () => {
            this.listTag = this.listTag.filter(tag => {
                if (!this.textInput.querySelector('#' + tag.id)) {
                    this.toggleOption(tag.value);
                    return false;
                }
                return true;
            });
        });
    }
}

/**
 * --------------------------
 *  Exports
 * --------------------------
 */
window.RoroSelectable = Selectable;
window.RoroSelect = Select;
window.RoroMultiSelect = MultiSelect;
