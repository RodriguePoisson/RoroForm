window.roroShowError = function(inputId, message = '', show = true) {
    let inputWrapper = roroGetWrapper(inputId);
    if (!inputWrapper.length) return;

    let error = inputWrapper.find('.roro-input-error-container');
    let errorMessage = error.find('.roro-input-error-message');

    if (!error.length || !errorMessage.length) return;

    errorMessage.text(message);
    error.toggle(show);
    manageBorderError(inputWrapper.find('.roro-border-error'), show);
};


window.manageBorderError = function(elt,show=null)
{
    if(show !== null){
        elt.data('show', show);
    }
    if(elt.data('show')){
        elt.removeClass(elt.data('class'))
        elt.addClass(elt.data('class'))
        elt.data('show', false);
    }else{
        elt.removeClass(elt.data('class'))
        elt.addClass('roro-border-error');
        elt.data('show', true);
    }
}

window.normalizeInputName = function(name) {
    return name
        .split('.')
        .reduce((acc, part, i) => i === 0 ? part : `${acc}[${part}]`, '');
};


window.roroGetWrapper = function(inputId) {
    let input = $(`#${inputId}`);
    let wrapper = $(`#roro-wrapper-${inputId}`);

    // Un radio n'a pas son propre conteneur d'erreur : on remonte a SON
    // radio-container parent (et non a TOUS les .roro-wrapper-radio-container).
    if (input.hasClass('roro-input-radio')) {
        wrapper = input.closest('.roro-wrapper-radio-container');
    }

    return wrapper;
};
