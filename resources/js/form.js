window.roroSubmitButton = function (buttonId = null, formId = null) {
    if (!formId || !buttonId) return;

    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);
    if (!form || !button) return;

    if (button.type !== 'submit') return;

    roroShowOverlay(true);

    const processAjax = () => {
        if (!form.reportValidity()) {
            roroShowOverlay(false);
            return;
        }

        const formData = new FormData(form);

        fetch(form.getAttribute('action') || '', {
            method: (form.getAttribute('method') || 'POST').toUpperCase(),
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
        })
            .then(async (response) => {
                const data = await response.clone().json().catch(() => null);
                if (response.ok) {
                    RoroDom.emit(form, 'roro:ajax:success', data);
                } else {
                    RoroDom.emit(form, 'roro:ajax:error', {
                        status: response.status,
                        response,
                        responseJSON: data,
                    });
                    if (button.dataset.ajaxErrors && data && data.errors) {
                        populateFormErrors(form, data.errors);
                    }
                }
            })
            .catch((error) => {
                RoroDom.emit(form, 'roro:ajax:error', { status: 0, error });
            })
            .finally(() => roroShowOverlay(false));
    };

    const processClassic = () => {
        if (form.reportValidity()) {
            form.submit();
        } else {
            roroShowOverlay(false);
        }
    };

    button.dataset.ajax ? processAjax() : processClassic();
};

window.roroRegisterButtonOnClick = function (buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    RoroDom.on(button, 'click', function (event) {
        event.preventDefault();
        roroSubmitButton(button.id, button.dataset.formId);
    });
};

window.roroShowOverlay = function (show = true) {
    const overlay = document.getElementById('roro-form-overlay');
    if (!overlay) return;

    overlay.style.display = show ? 'flex' : 'none';
};

window.populateFormErrors = function (form, errors) {
    clearFormErrors(form);
    for (let [inputName, messages] of Object.entries(errors)) {
        inputName = normalizeInputName(inputName);
        const input = form.querySelector(`[name="${inputName}"]`);
        if (input) {
            roroShowError(input.id, messages.join(', '), true);
        }
    }
};

window.clearFormErrors = function (form) {
    RoroDom.qsa(form, '.roro-input').forEach(function (el) {
        roroShowError(el.id, '', false);
    });
};

RoroDom.ready(function () {
    RoroDom.qsa('.roro-btn-submit').forEach(function (btn) {
        roroRegisterButtonOnClick(btn.id);
    });

    RoroDom.qsa('.roro-border-error').forEach(function (el) {
        manageBorderError(el);
    });
});
