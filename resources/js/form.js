window.roroSubmitButton = function (buttonId = null, formId = null) {
    if (!formId || !buttonId) return;

    const form = $('#' + formId);
    const button = $('#' + buttonId);

    if (button.prop('type') !== 'submit') return;

    roroShowOverlay(true);

    const processAjax = () => {
        if (!form[0].reportValidity()) {
            roroShowOverlay(false);
            return;
        }

        const formData = new FormData(form[0]);

        $.ajax({
            url: form.attr('action'),
            type: (form.attr('method') || 'POST').toUpperCase(),
            data: formData,
            contentType: false,
            processData: false,
        })
            .done(response => form.trigger('roro:ajax:success', [response]))
            .fail((xhr, status, error) => {
                form.trigger('roro:ajax:error', [xhr, status, error]);
                if (button.data('ajax-errors') && xhr.responseJSON?.errors) {
                    populateFormErrors(form, xhr.responseJSON.errors);
                }
            })
            .always(() => roroShowOverlay(false));
    };

    const processClassic = () => {
        if (form[0].reportValidity()) {
            form.submit();
        } else {
            roroShowOverlay(false);
        }
    };

    button.data('ajax') ? processAjax() : processClassic();
};

window.roroRegisterButtonOnClick = function (buttonId) {
    const button = $('#' + buttonId);
    if (!button.length) return;

    button.on('click', function (event) {
        event.preventDefault();
        roroSubmitButton(button.attr('id'), button.data('form-id'));
    });
};

window.roroShowOverlay = function (show = true) {
    const overlay = $('#roro-form-overlay');
    if (!overlay.length) return;

    show ? overlay.fadeIn(150) : overlay.fadeOut(150);
};

window.populateFormErrors = function (form, errors) {
    clearFormErrors(form);
    for (let [inputName, messages] of Object.entries(errors)) {
        inputName = normalizeInputName(inputName);
        const input = form.find(`[name="${inputName}"]`);
        if (input.length) {
            roroShowError(input.attr('id'), messages.join(', '), true);
        }
    }
};

window.clearFormErrors = function(form)
{
    form.find('.roro-input').each(function(){
        roroShowError($(this).attr('id'),'',false);
    });
}

$(document).ready(function () {
    $('.roro-btn-submit').each(function () {
        roroRegisterButtonOnClick($(this).attr('id'));
    });

    $('.roro-border-error').each(function () {
        manageBorderError($(this));
    });
});
