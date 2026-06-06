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
        this._onClick = (ev) => {
            // Stop the click bubbling to the wrapper's toggle handler — otherwise
            // it would fire on every pick (closing multi-select mid-selection).
            // Single select closes here (mirrors the keyboard Enter path); multi
            // stays open to keep picking.
            if (ev) ev.stopPropagation();
            select.handleOptionClick(this);
            if (select.closeOnSelect) select.showDropDown(false);
        };
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
    activeOption = null;    // keyboard-active option, tracked by identity (a11y combobox)
    closeOnSelect = true;   // single select closes on pick; multi stays open
    nativeMode = false;     // touch / coarse-pointer: a real <select> replaces the custom UI
    nativeSelect = null;

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
        this.maybeEnableNative();
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
        this.refreshNative();
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
        this.refreshNative();
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
        this.syncNativeEnabled();
    }

    readonly(readonly = true) {
        this.elt.style.pointerEvents = readonly ? 'none' : 'auto';
        this.elt.dataset.readonly = readonly ? '1' : '0';
        if (this.textInput) this.textInput.readOnly = readonly;
        RoroDom.qsa(this.elt, '.roro-input-hidden').forEach(h => { h.readOnly = readonly; });
        this.syncNativeEnabled();
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
        if (this.nativeMode) return;   // native <select> owns its own popup
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

        // Clicking inside the dropdown must NOT move focus off the combobox.
        // Otherwise the mousedown blurs it, the focus-out handler below closes the
        // list, and the option is hidden before its click lands — so the pick
        // silently fails (mouse dead, keyboard fine). preventDefault on mousedown
        // keeps focus put; the option's click still fires normally.
        RoroDom.on(this.dropdown, 'mousedown', ev => ev.preventDefault());

        // Close the dropdown once focus leaves the whole widget (Tab away, click
        // outside, focus another field). Clicking an option keeps the combobox
        // focused (mousedown default prevented above), so multi-select stays open.
        RoroDom.on(this.selectWrapper, 'focusout', ev => this.handleFocusOut(ev));

        if (this.isA11y()) {
            RoroDom.on(this.textInput, 'keydown', ev => this.handleKeydown(ev));
        }
    }

    /**
     * ---------- Keyboard a11y (ARIA combobox) ----------
     * Active whenever the control carries role="combobox". All three themes
     * (raw, Tailwind, Bootstrap) now render it, so the keyboard navigation and
     * ARIA state (aria-expanded / aria-activedescendant / aria-selected) apply
     * everywhere. A control without the role stays untouched.
     */
    isA11y() {
        return !!(this.textInput && this.textInput.getAttribute
            && this.textInput.getAttribute('role') === 'combobox');
    }

    // Options in LIVE VISUAL (DOM) order — visible, non-template. We deliberately
    // do NOT trust this.options array order: an option added via addOption() into
    // an existing category lands at the END of the array but MID-DOM, so the two
    // orders diverge and Arrow keys would skip / reverse relative to what the user
    // sees. DOM order is the source of truth.
    navOptions() {
        const byElt = new Map(this.options.map(o => [o.elt, o]));
        return RoroDom.qsa(this.dropdown, '.roro-select-option')
            .filter(el => !el.closest('.roro-select-templates') && RoroDom.isVisible(el))
            .map(el => byElt.get(el))
            .filter(Boolean);
    }

    clearActive() {
        this.options.forEach(o => o.elt.classList.remove('roro-option-active'));
        this.activeOption = null;
        if (this.textInput) this.textInput.setAttribute('aria-activedescendant', '');
    }

    // Set the active option by identity (null clears). Keeps the highlight, the
    // aria-activedescendant pointer and the scroll position in sync.
    setActiveOption(option) {
        this.options.forEach(o => o.elt.classList.remove('roro-option-active'));
        this.activeOption = option || null;
        if (!this.activeOption) {
            if (this.textInput) this.textInput.setAttribute('aria-activedescendant', '');
            return;
        }
        option.elt.classList.add('roro-option-active');
        if (this.textInput) this.textInput.setAttribute('aria-activedescendant', option.elt.id || '');
        if (option.elt.scrollIntoView) option.elt.scrollIntoView({ block: 'nearest' });
    }

    // Move the active option by `delta` (+1 down / -1 up) through the live list,
    // wrapping at the ends. Recomputing the active option's position every time
    // makes navigation immune to the list changing between keystrokes.
    moveActive(delta) {
        const list = this.navOptions();
        if (!list.length) { this.setActiveOption(null); return; }
        let i = this.activeOption ? list.findIndex(o => o.elt === this.activeOption.elt) : -1;
        if (i === -1) i = delta >= 0 ? 0 : list.length - 1;
        else i = (i + delta + list.length) % list.length;
        this.setActiveOption(list[i]);
    }

    // Jump to the first (first=true) or last visible option.
    setActiveEdge(first) {
        const list = this.navOptions();
        this.setActiveOption(first ? list[0] : list[list.length - 1]);
    }

    handleKeydown(ev) {
        if (this.nativeMode) return;   // native <select> handles its own keyboard
        const open = boolData(this.selectWrapper, 'show');

        switch (ev.key) {
            case 'ArrowDown':
                ev.preventDefault();
                if (!open) { this.showDropDown(true); this.setActiveEdge(true); }
                else this.moveActive(1);
                break;
            case 'ArrowUp':
                ev.preventDefault();
                if (!open) { this.showDropDown(true); this.setActiveEdge(false); }
                else this.moveActive(-1);
                break;
            case 'Home':
                if (open) { ev.preventDefault(); this.setActiveEdge(true); }
                break;
            case 'End':
                if (open) { ev.preventDefault(); this.setActiveEdge(false); }
                break;
            case 'Enter':
                if (open && this.activeOption) {
                    ev.preventDefault();
                    this.handleOptionClick(this.activeOption);
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

    // Close the dropdown when focus leaves the whole widget. relatedTarget covers
    // focus moving to another element (Tab, clicking another control); when it is
    // null (blur to a non-focusable target, e.g. empty page area) we re-check
    // document.activeElement on the next tick, once it has settled.
    handleFocusOut(ev) {
        const next = ev && ev.relatedTarget;
        if (next) {
            if (!this.selectWrapper.contains(next)) this.showDropDown(false);
            return;
        }
        setTimeout(() => {
            const active = typeof document !== 'undefined' ? document.activeElement : null;
            if ((!active || !this.selectWrapper.contains(active)) && boolData(this.selectWrapper, 'show')) {
                this.showDropDown(false);
            }
        }, 0);
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

    /**
     * ---------- Native picker fallback (touch / coarse-pointer devices) -------
     * On phones/tablets a real <select> gives the OS picker — better UX and full
     * accessibility for free — so we swap the custom combobox for one. The native
     * element carries NO name: it drives the same hidden input(s) on change, so
     * form submission and the value model are identical to the desktop path.
     * Gate: `(pointer: coarse)`. Force everywhere with window.roroForceNativeSelect
     * = true; opt a single instance out with data-native="0" on its wrapper.
     */
    isMultiple() { return false; }   // MultiSelect overrides → true

    prefersNativeSelect() {
        if (this.selectWrapper && this.selectWrapper.dataset.native === '0') return false;
        if (typeof window === 'undefined') return false;
        if (window.roroForceNativeSelect) return true;
        if (typeof window.matchMedia === 'function') {
            try { return !!window.matchMedia('(pointer: coarse)').matches; } catch (e) { /* unsupported */ }
        }
        return false;
    }

    maybeEnableNative() {
        if (this.prefersNativeSelect()) this.enableNativeMode();
    }

    enableNativeMode() {
        if (this.nativeMode || !this.textInput) return;
        this.nativeMode = true;
        this.buildNativeSelect();
        this.syncNativeFromState();
        this.syncNativeEnabled();
        // Hide the custom UI; the hidden submission input(s) stay in the DOM.
        RoroDom.hide(this.textInput);
        RoroDom.hide(this.dropdown);
        const clear = RoroDom.qs(this.elt, '.roro-select-clear-button');
        if (clear) RoroDom.hide(clear);
    }

    buildNativeSelect() {
        if (this.nativeSelect) return this.nativeSelect;
        const sel = document.createElement('select');
        sel.className = 'roro-select-native';
        sel.style.width = '100%';
        if (this.isMultiple()) sel.multiple = true;
        const inputId = this.id.replace('roro-wrapper-', '');
        if (document.getElementById('label-' + inputId)) {
            sel.setAttribute('aria-labelledby', 'label-' + inputId);
        }
        this.rebuildNativeOptions(sel);
        RoroDom.on(sel, 'change', () => this.onNativeChange());
        this.textInput.parentNode.insertBefore(sel, this.textInput);
        this.nativeSelect = sel;
        return sel;
    }

    // Mirror the dropdown's options/categories into <option>/<optgroup>, in live
    // DOM (visual) order — the same source of truth as the keyboard navigation.
    rebuildNativeOptions(sel) {
        const target = sel || this.nativeSelect;
        if (!target) return;
        target.replaceChildren();
        if (!this.isMultiple()) {
            const ph = document.createElement('option');
            ph.value = '';
            ph.textContent = (this.textInput && this.textInput.getAttribute('placeholder')) || '';
            target.appendChild(ph);
        }
        const byElt = new Map(this.options.map(o => [o.elt, o]));
        const addOpt = (parent, el) => {
            const ro = byElt.get(el);
            if (!ro) return;
            const o = document.createElement('option');
            o.value = ro.value;
            o.textContent = ro.label;
            parent.appendChild(o);
        };
        RoroDom.children(this.dropdown).forEach(child => {
            if (RoroDom.matches(child, '.roro-select-category')) {
                const og = document.createElement('optgroup');
                og.label = child.dataset.category || '';
                RoroDom.qsa(child, '.roro-select-option').forEach(el => addOpt(og, el));
                if (og.children.length) target.appendChild(og);
            } else if (RoroDom.matches(child, '.roro-select-option')) {
                addOpt(target, child);
            }
        });
    }

    syncNativeFromState() {
        if (!this.nativeSelect) return;
        if (this.isMultiple()) {
            const vals = this.getValue() || [];
            RoroDom.qsa(this.nativeSelect, 'option').forEach(o => { o.selected = vals.includes(o.value); });
        } else {
            const v = this.getValue();
            this.nativeSelect.value = (v === null || v === undefined) ? '' : String(v);
        }
    }

    onNativeChange() {
        if (this.isMultiple()) {
            this.values = RoroDom.qsa(this.nativeSelect, 'option').filter(o => o.selected).map(o => o.value);
            this.setHiddenValue(this.values);
            this.actualize();
        } else {
            const v = this.nativeSelect.value;
            this.setOptionSelected(v === '' ? null : v);
        }
    }

    // Native <select> has no readonly attribute: emulate it (and disabled) by
    // disabling the element. Submission is unaffected — the hidden input carries
    // the value and keeps its own readonly/disabled state.
    syncNativeEnabled() {
        if (this.nativeSelect) this.nativeSelect.disabled = this.isDisabled() || this.isReadonly();
    }

    // Keep the native <select> in step after the option set changes at runtime.
    refreshNative() {
        if (!this.nativeMode || !this.nativeSelect) return;
        this.rebuildNativeOptions();
        this.syncNativeFromState();
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

    isMultiple() { return true; }

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
