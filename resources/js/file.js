RoroDom.ready(function () {
    // File inputs inside a repeatable row are registered by RoroRepeatable
    // itself (with regenerated ids); skip them here to avoid double binding.
    RoroDom.qsa('.roro-input-file').forEach(function (el) {
        if (!el.closest('.roro-repeatable-row')) new RoroFile(el.id);
    });
});
