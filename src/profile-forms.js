// profile-forms.js — the four forms on the own profile page: name, email, password, delete.
import { changeEmail, changePassword, deleteAccount, updateName } from './api-client.js';
import { PROFILE_TEXT, SIGN_IN_PAGE } from './constants.js';
import { clearFormErrors, setBusy, showFormError } from './feedback.js';

// Each resolves to the updated User, except delete.
const SUBMIT = {
    name: (fields) => updateName(fields.name.value),
    email: (fields) => changeEmail(fields.email.value, fields.currentPassword.value),
    password: (fields) => changePassword(fields.currentPassword.value, fields.newPassword.value),
    delete: (fields) => deleteAccount(fields.currentPassword.value),
};

async function handleSubmit(form, onSaved) {
    const { action } = form.dataset;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    clearFormErrors(form);
    if (status) status.textContent = '';
    setBusy(button, true);
    try {
        const user = await SUBMIT[action](form.elements);
        if (action === 'delete') {
            window.location.href = SIGN_IN_PAGE;
            return;
        }
        form.querySelectorAll('input[type="password"]').forEach((input) => {
            input.value = '';
        });
        status.textContent = PROFILE_TEXT.saved;
        onSaved(user);
    } catch (err) {
        showFormError(form, err);
    }
    setBusy(button, false);
}

export function initProfileForms(container, user, onSaved) {
    container.querySelector('#profile-name').value = user.name;
    container.querySelector('#profile-email').value = user.email;
    container.querySelectorAll('.profile-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleSubmit(form, onSaved);
        });
    });
    container.hidden = false;
}
