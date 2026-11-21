//user.js — profile page: your own, editable; ?id=<other> read-only for the admin.
import { getMyProfile, getUser } from './api-client.js';
import { initAccount, renderAccount } from './account.js';
import { PROFILE_TEXT } from './constants.js';
import { createProfileSummary } from './dom-elements.js';
import { initProfileForms } from './profile-forms.js';

const heading = document.querySelector('.profile-heading');
const summary = document.querySelector('.profile-summary');
const forms = document.querySelector('.profile-forms');
const requestedId = new URLSearchParams(window.location.search).get('id');

function showSummary(user) {
    summary.replaceChildren(createProfileSummary(user));
    summary.hidden = false;
}

initAccount();

try {
    const me = await getMyProfile();
    const own = !requestedId || Number(requestedId) === me.id;
    let user = own ? me : await getUser(requestedId);

    heading.textContent = own ? PROFILE_TEXT.ownHeading : user.name || user.email;
    document.title = `${heading.textContent} — My todo`;
    showSummary(user);

    if (own) {
        document.querySelector('.account-name').setAttribute('aria-current', 'page');
        initProfileForms(forms, user, (updated) => {
            user = { ...user, ...updated };
            showSummary(user);
            renderAccount(user);
        });
    }
} catch (err) {
    // 400 for an id that is not a number: to the reader, also a User that does not exist.
    if (err.status === 404 || err.status === 400) {
        heading.textContent = PROFILE_TEXT.notFound;
    } else {
        alert(err.message);
    }
}
