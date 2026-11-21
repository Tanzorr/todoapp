// account.js — the signed-in User's email and the sign-out button in the page header.
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

// Not awaited by the pages; the page's own API calls report a server that is down.
export async function initAccount() {
    const account = document.querySelector('.account');
    if (!account) return;
    try {
        const user = await getCurrentUser();
        account.querySelector('.account-email').textContent = user.email;
        account.querySelector('.account-sign-out').addEventListener('click', handleSignOut);
        account.hidden = false;
    } catch {
        account.hidden = true;
    }
}
