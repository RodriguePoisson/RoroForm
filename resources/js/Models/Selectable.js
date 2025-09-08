/**
 * --------------------------
 *  Base Elements
 * --------------------------
 */
class Category extends RoroElement {
    constructor(label, id = null) {
        super('select-category', id, 'roro-select-category', {label}, true);
        this.label = label;
        this.ready.then(() => this.syncDom());
    }

    changeDomLabel(newLabel) {
        this.elt.find('.roro-select-category-label').text(newLabel);
    }

    syncDom() {
        this.changeDomLabel(this.label);
    }
}

class Option extends RoroElement {
    constructor(label, id = null, value = null, category = null) {
        super('select-option', id, 'roro-select-option', {label, value}, true);
        this.label = label;
        this.value = value;
        this.category = category;
        this.ready.then(() => this.syncDom());
    }

    registerEventFromSelect(select, elt) {
        elt.on('click', () => {
            select.handleOptionClick(this);
        });
    }

    changeDomLabel(newLabel) {
        this.elt.find('.roro-select-option-label').text(newLabel);
        this.elt.data('label', newLabel);
    }

    changeDomValue(newValue) {
        this.elt.data('value', newValue);
    }

    syncDom() {
        this.changeDomLabel(this.label);
        this.changeDomValue(this.value);
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

    constructor(id, optionsArray = {}, prefixId = '',values=null) {
        super('select', id, prefixId);
        this.values = values;
        this.ready = this.init(optionsArray);
    }

    /**
     * ---------- Initialization ----------
     */
    async init(optionsArray) {
        await this.createCategoriesAndOptions(optionsArray);
        await this.renderOptions();
        this.showDropDown();
        this.initValues();
        this.handleDisableReadonly();
    }

    initValues() {
    }

    actualize() {
    }

    clearInput() {
        throw new Error("clearInput() must be implemented in child class");
    }

    setHiddenValue() {
        throw new Error("setHiddenValue() must be implemented in child class");
    }

    getValue() {
        throw new Error("getValue() must be implemented in child class");
    }

    handleOptionClick() {
        throw new Error("handleOptionClick() must be implemented in child class");
    }

    /**
     * ---------- Options & Categories ----------
     */
    async createCategoriesAndOptions(optionsTab) {
        if (!optionsTab || typeof optionsTab !== 'object') return;

        for (const [key, value] of Object.entries(optionsTab)) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                const category = new Category(key);
                await category.ready;
                this.categories.push(category);

                for (const [optKey, optLabel] of Object.entries(value)) {
                    const option = new Option(optLabel, null, optKey, category);
                    await option.ready;
                    this.options.push(option);
                }
            } else {
                const option = new Option(value, null, key, null);
                await option.ready;
                this.options.push(option);
            }
        }
    }

    async addOption(option, categoryLabel = null) {
        if (!(option instanceof Option)) throw new Error('Invalid option format');

        if (categoryLabel) {
            let category = this.categories.find(cat => cat.label === categoryLabel);
            if (!category) {
                category = new Category(categoryLabel);
                this.categories.push(category);
            }
            option.category = category;
            await category.ready;
        }

        this.options.push(option);
        option.ready.then(() => {
            option.registerEventFromSelect(this, option.elt);
            this.renderOptions();
        });
    }

    removeOption(option) {
        if (!(option instanceof Option)) throw new Error('Invalid option format');
        this.options = this.options.filter(opt => opt.id !== option.id);
        option.elt.remove();
    }

    removeCategory(category) {
        if (!(category instanceof Category)) throw new Error('Invalid category format');
        this.categories = this.categories.filter(cat => cat.id !== category.id);
        category.elt.remove();
    }

    renderOptions() {

        this.categories.forEach(category => {
            this.dropdown.append(category.elt);
        });
        this.options.forEach(option => {
            if (option.category) {
                option.category.elt.find('.roro-select-category-options-container').append(option.elt);
            } else {
                this.dropdown.append(option.elt);
            }
        });
    }

    filterOptions(filterText = '') {
        this.optionsFiltered = this.options.filter(option =>
            option.label.toLowerCase().includes(filterText.toLowerCase())
        );
    }

    showFilteredOptions(self) {
        if (!self.elt.find('.roro-select-text-input').val() && !self.elt.find('.roro-select-text-input').text() ) {
            self.elt.find('.roro-select-option').show();
        } else {
            self.elt.find('.roro-select-option').hide();
            this.optionsFiltered.forEach(option => option.elt.show());
        }
    }

    /**
     * ---------- States ----------
     */
    isDisabled() {
        return this.elt.data('disabled');
    }

    isReadonly() {
        return this.elt.data('readonly');
    }

    handleDisableReadonly() {
        if (this.elt.data('disable')) {
            this.disable(true);
        } else {
            this.disable(false);
            if (this.elt.data('readonly')) {
                this.readonly(true);
            } else {
                this.readonly(false);
            }
        }
    }

    disable(disable = true) {
        this.elt.css({'pointer-events': disable ? 'none' : 'auto'});
        this.elt.data('disable', disable);
        this.elt.find('.roro-select-text-input').prop('disabled', disable);
        this.elt.find('.roro-input-hidden').prop('disabled', disable);
    }

    readonly(readonly = true) {
        this.elt.css({'pointer-events': readonly ? 'none' : 'auto'});
        this.elt.data('readonly', readonly);
        this.elt.find('.roro-select-text-input').prop('readonly', readonly);
        this.elt.find('.roro-input-hidden').prop('readonly', readonly);
    }

    /**
     * ---------- Dropdown ----------
     */
    get selectWrapper() {
        return $('#' + this.id);
    }

    get dropdown() {
        return this.selectWrapper.find('.roro-select-dropdown');
    }

    showDropDown() {
        if (!this.selectWrapper.length) throw new Error(`No wrapper found for Selectable with id ${this.id}`);
        if (!this.dropdown.length) throw new Error(`No dropdown found for Selectable with id ${this.id}`);
        this.selectWrapper.data('show') ? this.dropdown.slideDown() : this.dropdown.slideUp();
    }

    toggleDropDown() {
        if (!this.selectWrapper.length) throw new Error(`No wrapper found for Selectable with id ${this.id}`);
        roroShowDropDown(this.id.replace('roro-wrapper-', ''), !this.selectWrapper.data('show'));
    }

    /**
     * ---------- Events ----------
     */
    registerEvents() {
        super.registerEvents();

        let self = this;
        self.ready.then(() => {
            let textInput = self.elt.find('.roro-select-text-input');
            textInput.on('input', function () {
                self.filterOptions($(this).val()+$(this).text());
                self.showFilteredOptions(self);
            });

            let wrapper = $('#' + self.id);
            wrapper.on('click', function (e) {
                self.toggleDropDown();
            });

            self.options.forEach(option => {
                option.registerEventFromSelect(self, option.elt);
            });

            self.elt.find('.roro-select-clear-button').on('click', function (ev) {
                ev.stopPropagation();
                self.clearInput();
            });
        });
    }

    /**
     * ---------- Helpers ----------
     */
    setTextInputValue(value) {
        this.elt.find('.roro-select-text-input').val(value);
    }

    addTextInputHtml(select,elt){
        elt.appendTo(select.elt.find('.roro-select-text-input'))
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

    constructor(id, optionsArray = {}, value = null) {
        super(id, optionsArray, 'roro-wrapper');
        this.value = value;
    }

    initValues() {
        this.setOptionSelected(this.value);
    }

    actualize() {
        this.options.forEach(option => {
            option.elt.find('.roro-select-option-check').hide();
            option.elt.find('.roro-select-option-overlay').hide();
        });
        if (this.optionSelected) {
            this.setTextInputValue(this.optionSelected.label);
            this.optionSelected.elt.find('.roro-select-option-check').show();
            this.optionSelected.elt.find('.roro-select-option-overlay').show();
        } else {
            this.setTextInputValue('');
        }
    }

    setOptionSelected(optionValue) {
        if (optionValue === null || optionValue === undefined) {
            this.optionSelected = null;
            this.value = null;
            this.setHiddenValue('');
            this.setTextInputValue('');
            this.actualize();
            return;
        }

        const found = this.options.find(option => option.value == optionValue);
        if (found) {
            this.optionSelected = found;
            this.value = optionValue;
            this.setHiddenValue(optionValue);
            this.actualize();
        } else {
            this.optionSelected = null;
            this.value = null;
            this.setHiddenValue('');
            this.setTextInputValue('');
            this.actualize();
        }
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
            this.elt.append(`<input type="hidden" class="roro-select-hidden" name="${this.id}" value="${value}">`);
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

    constructor(id, name, optionsArray = {}, values = []) {
        super(id, optionsArray, 'roro-wrapper',values);
        this.name = name;
        let self = this;
        this.ready.then(function(){
            self.actualize();
        })

        this.listTag = [];
    }

    initValues() {
        super.initValues();

        this.values.forEach(val => this.toggleOption(val,true));
    }

    actualize() {
        let self = this;
        self.listTag = [];

        this.options.forEach(option => {
            option.elt.find('.roro-select-option-check').hide();
            option.elt.find('.roro-select-option-overlay').hide();
        });

        new RoroElement('multi-select-text-tag', null, '', {}, true).ready.then(function(){
            const labels = self.options
                .filter(opt => self.values.includes(opt.value))
                .map(opt => ({ label: opt.label, value: opt.value,option:opt }));
            self.elt.find('.roro-select-text-input').html('');
            labels.forEach(label => {
                let multiSelectTextTag = new RoroElement('multi-select-text-tag', null, '', {}, true);

                multiSelectTextTag.ready.then(function(){
                    multiSelectTextTag.elt.find('.roro-multi-select-text-tag-text').text(label.label);
                    multiSelectTextTag.elt.data('value',label.value);
                    self.addTextInputHtml(self,multiSelectTextTag.elt);
                    self.listTag.push(multiSelectTextTag);
                    label.option.elt.find('.roro-select-option-check').show();
                    label.option.elt.find('.roro-select-option-overlay').show();
                    multiSelectTextTag.elt.find('.roro-multi-select-text-tag-clear-button').on('click',function(){
                        self.toggleOption(label.value);
                    });
                })
            })
        })
    }

    handleOptionClick(option) {
        this.toggleOption(option.value);
    }

    toggleOption(value,init=false) {
        if (!this.values.includes(value)) {
            this.values.push(value);
        } else if(!init) {
            this.values = this.values.filter(v => v !== value);
        }
        this.setHiddenValue(this.values);
        if(!init){
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
            this.elt.append(
                `<input ${this.isDisabled() ? 'disabled' : ''} ${this.isReadonly() ? 'readonly' : ''} type="hidden" class="roro-multi-select-hidden test-roro" value="${v}" name="${this.name}">`
            );

        });
    }

    getValue() {
        return this.values;
    }

    filterOptions(filterText = '') {
        let searchTab = [filterText.toLowerCase().trim()];
        this.elt.find('.caret-zone').each(function(){
            searchTab.push($(this).text().toLowerCase().trim());
        });
        this.optionsFiltered = this.options.filter(option =>
            searchTab.some(search => option.label.toLowerCase().trim().includes(search))
        );
    }

    registerEvents() {
        super.registerEvents();

        let self = this;
        let textInput = self.elt.find('.roro-select-text-input');
        textInput.on('input', function () {
            self.listTag = self.listTag.filter(tag => {
                if (!self.elt.find('#' + tag.id).length) {

                    self.toggleOption(tag.elt.data('value'));
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
