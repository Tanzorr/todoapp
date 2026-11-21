//users.js — the admin's list of every User.
import { getUsers } from './api-client.js';
import { initAccount } from './account.js';
import { USERS_TEXT } from './constants.js';
import { createUserRow } from './dom-elements.js';

const message = document.querySelector('.page-message');
const list = document.querySelector('.user-list');

initAccount();

try {
    const users = await getUsers();
    list.replaceChildren(...users.map(createUserRow));
    list.hidden = false;
} catch (err) {
    if (err.status === 404) {
        message.textContent = USERS_TEXT.adminOnly;
        message.hidden = false;
    } else {
        alert(err.message);
    }
}
