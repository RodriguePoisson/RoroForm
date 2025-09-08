$(document).ready(function(){
    $('.roro-input-file').each(function() {
        new RoroFile($(this).attr('id'));
    });
});
