window.listOfRepeatable = window.listOfRepeatable || [];

// Registry keyed by 'roro-wrapper-<id>'. The public roroGetRepeatable(id) lives
// in the facade (alongside roroGetSelect), reading window.listOfRepeatable.
window.addRepeatable = function (elt) {
    const instance = new RoroRepeatable(elt.data('id'));
    listOfRepeatable.push(instance);
    return instance;
};

$(document).ready(function () {
    $('.roro-wrapper-repeatable').each(function () {
        addRepeatable($(this));
    });
});
