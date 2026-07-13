// action-button.js
// Provides a consistent floating page action button behaviour across pages.
export function initPageAction() {
    const btn = document.querySelector('.page-action-btn');
    if (!btn) return;

    const form = document.querySelector('.form');
    const taskShow = document.querySelector('.task-show');

    if (form) {
        // If a form is present, make the floating button submit it
        btn.addEventListener('click', () => {
            if (typeof form.requestSubmit === 'function') {
                form.requestSubmit();
            } else {
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });
        return;
    }

    // No form on page — use the button for navigation:
    btn.addEventListener('click', () => {
        // If we are on the show page (task card present) — go to edit
        const taskId = localStorage.getItem('taskId');
        if (taskShow && taskId) {
            window.location.href = 'edit.html';
            return;
        }

        // Default action — open add page
        window.location.href = 'add.html';
    });
}

