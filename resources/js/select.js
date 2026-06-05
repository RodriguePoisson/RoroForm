window.listOfSelect = window.listOfSelect || [];

// Retrouve l'instance de select dans le registre global (cle 'roro-wrapper-<id>').
function findSelect(inputId) {
    return listOfSelect.find(select => select.id === 'roro-wrapper-' + inputId);
}

/**
 * Ajout dynamique d'UNE option, cote client (synchrone, zero reseau).
 * Ex : roroAddOption('pays', 'France', 'fr', 'Europe')
 */
window.roroAddOption = function (inputId, label, value, categoryLabel = null) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => select.addOption(label, value, categoryLabel));
};

/**
 * Ajout dynamique d'options depuis TON endpoint JSON.
 * GET `url` (avec `params`) doit renvoyer un tableau d'objets :
 *   [{ "label": "France", "value": "fr", "category": "Europe" }, ...]
 * (la cle "category" est optionnelle).
 * Renvoie une promesse resolue avec la liste recue.
 *
 * Ex : roroAddOptionsAjax('pays', '/api/pays', { q: 'fr' })
 */
window.roroAddOptionsAjax = function (inputId, url, params = {}) {
    const select = findSelect(inputId);
    if (!select) return Promise.resolve([]);

    return Promise.all([select.ready, $.getJSON(url, params)]).then(([, options]) => {
        (options || []).forEach(opt => select.addOption(opt.label, opt.value, opt.category ?? null));
        return options || [];
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
    listOfSelect.push(new RoroSelect(elt.data('id'), elt.data('value')));
};

window.addMultiSelect = function (elt) {
    listOfSelect.push(new RoroMultiSelect(elt.data('id'), elt.data('name'), elt.data('values')));
};

$(document).ready(function () {
    $('.roro-wrapper-select').each(function () {
        addSelect($(this));
    });

    $('.roro-wrapper-multi-select').each(function () {
        addMultiSelect($(this));
    });
});
