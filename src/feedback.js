// feedback.js — busy state and inline errors. A leaf: it imports only constants, so timer.js,
// actions.js and validations.js can use it without an import cycle through dom-elements.js.
import { ICONS } from './constants.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const refocusAfterBusy = new WeakSet();

export function createIcon(name) {
    const { size, stroke, paths } = ICONS[name];
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', stroke ? 'none' : 'currentColor');
    if (stroke) {
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', stroke);
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
    }
    paths.forEach((d) => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        svg.append(path);
    });
    return svg;
}

export function setBusy(button, busy) {
    if (busy && document.activeElement === button) {
        refocusAfterBusy.add(button);
    }
    button.disabled = busy;
    button.classList.toggle('is-busy', busy);
    button.setAttribute('aria-busy', String(busy));
    if (!busy && refocusAfterBusy.delete(button)) {
        button.focus();
    }
}

export function showInlineError(slot, message) {
    const returnFocusTo = document.activeElement;

    const box = document.createElement('div');
    box.classList.add('inline-error');
    box.setAttribute('role', 'alert');

    const text = document.createElement('span');
    text.classList.add('inline-error-text');
    text.textContent = message;

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.classList.add('btn', 'btn-icon', 'inline-error-dismiss');
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.append(createIcon('close'));
    dismiss.addEventListener('click', () => {
        box.remove();
        returnFocusTo?.focus();
    });

    box.append(createIcon('alert'), text, dismiss);
    slot.replaceChildren(box);
}

export function clearInlineError(slot) {
    slot.replaceChildren();
}

// Account forms: each input has a <p id="<input id>-error">, the form one .form-error.
export function clearFormErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach((input) => {
        input.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error, .form-error').forEach((slot) => {
        slot.textContent = '';
    });
}

// A 400 names the field it is about; anything else belongs to the whole form.
export function showFormError(form, err) {
    const input = err.field ? form.elements[err.field] : null;
    const slot = input ? form.querySelector(`#${input.id}-error`) : null;
    if (!slot) {
        form.querySelector('.form-error').textContent = err.message;
        return;
    }
    input.setAttribute('aria-invalid', 'true');
    slot.textContent = err.message;
    input.focus();
}
