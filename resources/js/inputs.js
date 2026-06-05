window.roroShowError = function (inputId, message = '', show = true) {
    const wrapper = roroGetWrapper(inputId);
    if (!wrapper) return;

    const error = RoroDom.qs(wrapper, '.roro-input-error-container');
    const errorMessage = error ? RoroDom.qs(error, '.roro-input-error-message') : null;
    if (!error || !errorMessage) return;

    errorMessage.textContent = message;
    RoroDom.toggle(error, show);
    manageBorderError(RoroDom.qs(wrapper, '.roro-border-error'), show);
};

window.manageBorderError = function (elt, show = null) {
    if (!elt) return;

    // data-show is "1"/"0" (or the legacy "true"/""). When show is given it wins.
    const reveal = show === null
        ? (elt.dataset.show === '1' || elt.dataset.show === 'true')
        : !!show;

    // data-class holds the full error-border class list (incl. the base marker).
    const errorClasses = elt.dataset.class || '';
    if (reveal) {
        RoroDom.addClass(elt, errorClasses);
    } else {
        RoroDom.removeClass(elt, errorClasses);
        elt.classList.add('roro-border-error');
    }
    elt.dataset.show = reveal ? '1' : '0';
};

window.normalizeInputName = function (name) {
    return name
        .split('.')
        .reduce((acc, part, i) => i === 0 ? part : `${acc}[${part}]`, '');
};

window.roroGetWrapper = function (inputId) {
    const input = document.getElementById(inputId);
    let wrapper = document.getElementById('roro-wrapper-' + inputId);

    // A radio has no error container of its own: walk up to ITS parent
    // radio-container (not to ALL .roro-wrapper-radio-container on the page).
    if (input && input.classList.contains('roro-input-radio')) {
        wrapper = input.closest('.roro-wrapper-radio-container');
    }

    return wrapper; // Element or null
};
