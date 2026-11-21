// auth-form.js — the sign-in / create-account form on login.html.
import { register, signIn } from './api-client.js';
import { AUTH_MODES } from './constants.js';
import { setBusy } from './feedback.js';

// Only a page of this site, so ?next= cannot send the user elsewhere.
const PAGE_NAME = /^[a-z-]+\.html$/;

function nextPage() {
    const next = new URLSearchParams(window.location.search).get('next');
    return next && PAGE_NAME.test(next) ? next : 'index.html';
}

export function initAuthForm(form) {
    const { email, password } = form.elements;
    const heading = form.querySelector('.auth-heading');
    const hint = form.querySelector('.auth-hint');
    const formError = form.querySelector('.auth-error');
    const submit = form.querySelector('.auth-submit');
    const switchButton = form.querySelector('.auth-switch');
    let mode = 'signIn';

    const fieldError = (input) => form.querySelector(`#${input.id}-error`);

    function clearErrors() {
        formError.textContent = '';
        [email, password].forEach((input) => {
            input.removeAttribute('aria-invalid');
            fieldError(input).textContent = '';
        });
    }

    // A 400 names the field it is about; anything else belongs to the whole form.
    function showError(err) {
        const input = err.field ? form.elements[err.field] : null;
        if (!input) {
            formError.textContent = err.message;
            return;
        }
        input.setAttribute('aria-invalid', 'true');
        fieldError(input).textContent = err.message;
        input.focus();
    }

    function setMode(next) {
        mode = next;
        const text = AUTH_MODES[mode];
        heading.textContent = text.heading;
        document.title = `${text.heading} — My todo`;
        submit.textContent = text.submit;
        switchButton.textContent = text.switchText;
        password.autocomplete = text.passwordAutocomplete;
        hint.textContent = text.passwordHint;
        clearErrors();
    }

    switchButton.addEventListener('click', () => setMode(AUTH_MODES[mode].switchTo));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();
        setBusy(submit, true);
        try {
            if (mode === 'register') {
                await register(email.value, password.value);
                setMode('signIn');
            }
            await signIn(email.value, password.value);
            window.location.href = nextPage();
        } catch (err) {
            showError(err);
            setBusy(submit, false);
        }
    });
}
