$(document).ready(function(){
    // File inputs inside a repeatable row are registered by RoroRepeatable
    // itself (with regenerated ids); skip them here to avoid double binding.
    $('.roro-input-file').each(function() {
        if (!$(this).closest('.roro-repeatable-row').length) new RoroFile($(this).attr('id'));
    });
});
