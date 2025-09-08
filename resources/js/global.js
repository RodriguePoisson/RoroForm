window.roroTriggerChangeAll = function() {
    $('.roro-input').trigger('change');
};

window.roroTrigger = function(inputId, eventName = 'change') {
    let inputWrapper = roroGetWrapper(inputId);
    let inputElement = inputWrapper.find('.roro-input');
    if (inputElement.length) {
        inputElement.trigger(eventName);
    }
};
