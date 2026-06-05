/**
 * --------------------------
 *  Option / Categorie
 *  De simples enveloppes autour des noeuds DOM rendus cote serveur.
 *  (Plus aucune instanciation AJAX : on lit / clone le DOM existant.)
 * --------------------------
 */
class RoroOption {
    constructor($node) {
        this.elt = $node;
        this.id = $node.attr('id');
        this.value = $node.data('value');
        this.label = $node.data('label');
    }

    get categoryLabel() {
        const $cat = this.elt.closest('.roro-select-category');
        return $cat.length ? $cat.data('category') : null;
    }

    bindClick(select) {
        // namespace .roro + off() prealable => zero double-binding apres re-render.
        this.elt.off('click.roro').on('click.roro', () => select.handleOptionClick(this));
    }

    mark() {
        this.elt.find('.roro-select-option-check, .roro-select-option-overlay').show();
    }

    unmark() {
        this.elt.find('.roro-select-option-check, .roro-select-option-overlay').hide();
    }
}

class RoroCategory {
    constructor($node) {
        this.elt = $node;
        this.id = $node.attr('id');
        this.label = $node.data('category');
    }

    get optionsContainer() {
        return this.elt.find('.roro-select-category-options-container');
    }
}

/**
 * --------------------------
 *  Selectable (classe de base)
 * --------------------------
 */
class Selectable extends Input {
    categories = [];
    options = [];
    optionsFiltered = [];

    constructor(id, prefixId = '', values = null) {
        super('select', id, prefixId);
        this.values = values;

        // On CHAINE l'init apres que le wrapper soit recupere (au lieu d'ecraser
        // la promesse du parent) : plus de couplage temporel fragile.
        const baseReady = this.ready;
        this.ready = baseReady.then(() => this.init());
    }

    init() {
        this.readDom();
        this.bindBaseEvents();
        this.showDropDown();
        this.initValues();
        this.handleDisableReadonly();
        return this;
    }

    /** Lit les options + categories deja rendues cote serveur dans le dropdown. */
    readDom() {
        this.categories = this.dropdown.find('.roro-select-category').get()
            .map(node => new RoroCategory($(node)));
        this.options = this.dropdown.find('.roro-select-option').get()
            .map(node => new RoroOption($(node)));
        this.options.forEach(option => option.bindClick(this));
    }

    // Surcharges enfant.
    initValues() {}
    actualize() {}
    clearInput() { throw new Error('clearInput() must be implemented in child class'); }
    setHiddenValue() { throw new Error('setHiddenValue() must be implemented in child class'); }
    getValue() { throw new Error('getValue() must be implemented in child class'); }
    handleOptionClick() { throw new Error('handleOptionClick() must be implemented in child class'); }

    /**
     * ---------- Ajout dynamique (clone client-side, zero reseau) ----------
     */
    addOption(label, value, categoryLabel = null) {
        const $option = this.templates.children('.roro-select-option').clone();
        $option.attr('id', Selectable.uid('roro-select-option'));
        $option.attr('data-value', value).data('value', value);
        $option.attr('data-label', label).data('label', label);
        $option.find('.roro-select-option-label').text(label);

        const container = categoryLabel ? this.ensureCategory(categoryLabel).optionsContainer : this.dropdown;
        container.append($option);

        const option = new RoroOption($option);
        option.bindClick(this);
        this.options.push(option);
        return option;
    }

    ensureCategory(categoryLabel) {
        const existing = this.categories.find(c => c.label === categoryLabel);
        if (existing) return existing;

        const $cat = this.templates.children('.roro-select-category').clone();
        $cat.attr('id', Selectable.uid('roro-select-category'));
        $cat.attr('data-category', categoryLabel).data('category', categoryLabel);
        $cat.find('.roro-select-category-label').text(categoryLabel);
        this.dropdown.append($cat);

        const category = new RoroCategory($cat);
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
     * ---------- Filtrage ----------
     */
    filterOptions(filterText = '') {
        const needle = filterText.toLowerCase();
        this.optionsFiltered = this.options.filter(o => (o.label ?? '').toLowerCase().includes(needle));
    }

    showFilteredOptions() {
        const text = this.textInput.val() || this.textInput.text();
        if (!text) {
            this.options.forEach(o => o.elt.show());
            return;
        }
        this.options.forEach(o => o.elt.hide());
        this.optionsFiltered.forEach(o => o.elt.show());
    }

    /**
     * ---------- Etats ----------
     */
    isDisabled() { return this.elt.data('disable'); }
    isReadonly() { return this.elt.data('readonly'); }

    handleDisableReadonly() {
        if (this.elt.data('disable')) {
            this.disable(true);
        } else {
            this.disable(false);
            this.readonly(!!this.elt.data('readonly'));
        }
    }

    disable(disable = true) {
        this.elt.css({ 'pointer-events': disable ? 'none' : 'auto' });
        this.elt.data('disable', disable);
        this.textInput.prop('disabled', disable);
        this.elt.find('.roro-input-hidden').prop('disabled', disable);
    }

    readonly(readonly = true) {
        this.elt.css({ 'pointer-events': readonly ? 'none' : 'auto' });
        this.elt.data('readonly', readonly);
        this.textInput.prop('readonly', readonly);
        this.elt.find('.roro-input-hidden').prop('readonly', readonly);
    }

    /**
     * ---------- Dropdown (refs DOM memoisees) ----------
     */
    get selectWrapper() { return (this._selectWrapper ??= $('#' + this.id)); }
    get dropdown() { return (this._dropdown ??= this.selectWrapper.find('.roro-select-dropdown')); }
    get templates() { return (this._templates ??= this.selectWrapper.find('.roro-select-templates')); }
    get textInput() { return (this._textInput ??= this.elt.find('.roro-select-text-input')); }

    showDropDown(show) {
        if (show !== undefined) this.selectWrapper.data('show', show);
        this.selectWrapper.data('show') ? this.dropdown.slideDown() : this.dropdown.slideUp();
    }

    toggleDropDown() {
        roroShowDropDown(this.id.replace('roro-wrapper-', ''), !this.selectWrapper.data('show'));
    }

    /**
     * ---------- Evenements ----------
     */
    bindBaseEvents() {
        this.textInput.on('input', () => {
            this.filterOptions(this.textInput.val() + this.textInput.text());
            this.showFilteredOptions();
        });

        this.selectWrapper.on('click', () => this.toggleDropDown());

        this.elt.find('.roro-select-clear-button').on('click', ev => {
            ev.stopPropagation();
            this.clearInput();
        });
    }

    /**
     * ---------- Helpers ----------
     */
    setTextInputValue(value) {
        this.textInput.val(value);
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

    // Etat "rien de selectionne" (partage entre le cas null et le cas introuvable).
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
        const $h = this.elt.find('.roro-select-hidden');
        if ($h.length) {
            $h.val(value);
        } else {
            $('<input>', { type: 'hidden', class: 'roro-select-hidden', name: this.id })
                .val(value)
                .appendTo(this.elt);
        }
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
        this.textInput.html('');

        this.options
            .filter(option => this.values.includes(option.value))
            .forEach(option => {
                // Clone le tag depuis le template cache (zero AJAX).
                const $tag = this.templates.children('.tag, .caret-zone').clone();
                const tagId = Selectable.uid('roro-tag');
                const $tagSpan = $tag.filter('.tag');

                $tagSpan.attr('id', tagId).data('value', option.value);
                $tagSpan.find('.roro-multi-select-text-tag-text').text(option.label);
                $tag.appendTo(this.textInput);

                option.mark();
                this.listTag.push({ id: tagId, value: option.value, elt: $tag });

                $tagSpan.find('.roro-multi-select-text-tag-clear-button').on('click', () => {
                    this.toggleOption(option.value);
                });
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
        this.elt.find('.roro-multi-select-hidden').remove();
        if (!Array.isArray(values)) values = [];
        values.forEach(v => {
            const $input = $('<input>', { type: 'hidden', class: 'roro-multi-select-hidden', name: this.name }).val(v);
            if (this.isDisabled()) $input.attr('disabled', true);
            if (this.isReadonly()) $input.attr('readonly', true);
            $input.appendTo(this.elt);
        });
    }

    getValue() {
        return this.values;
    }

    filterOptions(filterText = '') {
        const needles = [filterText.toLowerCase().trim()];
        this.elt.find('.caret-zone').each(function () {
            needles.push($(this).text().toLowerCase().trim());
        });
        this.optionsFiltered = this.options.filter(option =>
            needles.some(needle => (option.label ?? '').toLowerCase().trim().includes(needle))
        );
    }

    bindBaseEvents() {
        super.bindBaseEvents();

        // Suppression d'un tag au backspace : le tag disparait du DOM -> on
        // retire la valeur correspondante.
        this.textInput.on('input', () => {
            this.listTag = this.listTag.filter(tag => {
                if (!this.textInput.find('#' + tag.id).length) {
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
