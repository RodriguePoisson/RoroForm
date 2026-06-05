window.roroTriggerChangeAll = function () {
    RoroDom.qsa('.roro-input').forEach(el => RoroDom.emit(el, 'change'));
};

window.roroTrigger = function (inputId, eventName = 'change') {
    const wrapper = roroGetWrapper(inputId);
    if (!wrapper) return;
    const inputElement = RoroDom.qs(wrapper, '.roro-input');
    if (inputElement) RoroDom.emit(inputElement, eventName);
};
