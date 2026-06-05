window.listOfRepeatable = window.listOfRepeatable || [];

// Registry keyed by 'roro-wrapper-<id>'. The public roroGetRepeatable(id) lives
// in the facade (alongside roroGetSelect), reading window.listOfRepeatable.
window.addRepeatable = function (elt) {
    const instance = new RoroRepeatable(elt.dataset.id);
    listOfRepeatable.push(instance);
    return instance;
};

RoroDom.ready(function () {
    RoroDom.qsa('.roro-wrapper-repeatable').forEach(function (el) {
        addRepeatable(el);
    });
});
