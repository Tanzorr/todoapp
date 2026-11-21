// account.js — the signed-in User in the page header: name, Users link, sign out.
import { getCurrentUser, signOut } from './api-client.js';
import { SIGN_IN_PAGE } from './constants.js';

async function handleSignOut() {
    try {
        await signOut();
        window.location.href = SIGN_IN_PAGE;
    } catch (err) {
        alert(err.message);
    }
}

export function renderAccount(user) {
    const account = document.querySelector('.account');
    if (!account) return;
    account.querySelector('.account-name').textContent = user.name || user.email;
    account.querySelector('.account-users').hidden = user.role !== 'admin';
}

// Not awaited by the pages; the page's own API calls report a server that is down.
export async function initAccount() {
    const account = document.querySelector('.account');
    if (!account) return;
    try {
        renderAccount(await getCurrentUser());
        account.querySelector('.account-sign-out').addEventListener('click', handleSignOut);
        account.hidden = false;
    } catch {
        account.hidden = true;
    }
}
