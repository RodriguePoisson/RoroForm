window.listOfSelect = window.listOfSelect || [];

// Retrouve l'instance de select dans le registre global (cle 'roro-wrapper-<id>').
function findSelect(inputId) {
    return listOfSelect.find(select => select.id === 'roro-wrapper-' + inputId);
}

window.roroAddOption = function (inputId, key, value, categoryLabel = null) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => {
        const option = new Option(key, null, value);
        option.ready.then(() => select.addOption(option, categoryLabel));
    });
};

window.roroDisableSelect = function (inputId, disable = true) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => select.disable(disable));
};

window.roroReadonlySelect = function (inputId, readonly = true) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => select.readonly(readonly));
};

window.roroShowDropDown = function (inputId, show = true) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => select.showDropDown(show));
};

window.addSelect = function (elt) {
    listOfSelect.push(new RoroSelect(elt.data('id'), elt.data('options'), elt.data('value')));
};

window.addMultiSelect = function (elt) {
    listOfSelect.push(new RoroMultiSelect(elt.data('id'), elt.data('name'), elt.data('options'), elt.data('values')));
};

$(document).ready(function () {
    $('.roro-wrapper-select').each(function () {
        addSelect($(this));
    });

    $('.roro-wrapper-multi-select').each(function () {
        addMultiSelect($(this));
    });
});
