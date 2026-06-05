window.listOfSelect = window.listOfSelect || [];

// Find the select instance in the global registry (keyed by 'roro-wrapper-<id>').
function findSelect(inputId) {
    return listOfSelect.find(select => select.id === 'roro-wrapper-' + inputId);
}

/**
 * Add a single option client-side (synchronous, no request).
 * Example: roroAddOption('country', 'France', 'fr', 'Europe')
 */
window.roroAddOption = function (inputId, label, value, categoryLabel = null) {
    const select = findSelect(inputId);
    if (!select) return;
    select.ready.then(() => select.addOption(label, value, categoryLabel));
};

/**
 * Add options fetched from a JSON endpoint.
 * GET `url` (with `params`) must return an array of objects:
 *   [{ "label": "France", "value": "fr", "category": "Europe" }, ...]
 * ("category" is optional). Returns a promise resolved with the received list.
 *
 * Example: roroAddOptionsAjax('country', '/api/countries', { q: 'fr' })
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
