// browse.js — search and pages for the long lists of one rendered section. A list is a container
// whose children are its items; this only shows and hides them. No project names.
import { el } from './dom.js';

// Card grids, endpoint lists, and the rows of a table that sits directly under a part heading.
const LISTS = '.grid, .endpoints, .part > .table-wrap > table > tbody';
// Wrappers hidden while a search leaves nothing in them.
const GROUPS = '.part, .status-group';

function terms(text) {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
}

function hasTerms(item, query) {
    const text = item.textContent.toLowerCase();
    return query.every((term) => text.includes(term));
}

function listOf(node) {
    const items = [...node.children];
    const pager = el('nav', 'pager');
    pager.setAttribute('aria-label', 'List pages');
    return {
        node,
        box: node.closest('.table-wrap') ?? node,
        items,
        matching: items,
        page: 0,
        pager,
    };
}

function pageButton(label, onClick, { title = '', current = false, disabled = false } = {}) {
    const button = el('button', 'pager-button', label);
    button.type = 'button';
    button.disabled = disabled;
    if (title) button.setAttribute('aria-label', title);
    if (current) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', onClick);
    return button;
}

// Shows the current page of the matching items and redraws the buttons under the list.
function showPage(list, pageSize) {
    const count = Math.max(1, Math.ceil(list.matching.length / pageSize));
    list.page = Math.min(Math.max(list.page, 0), count - 1);
    const from = list.page * pageSize;
    const to = Math.min(from + pageSize, list.matching.length);
    const shown = new Set(list.matching.slice(from, to));
    for (const item of list.items) item.hidden = !shown.has(item);

    const hadFocus = list.pager.contains(document.activeElement);
    const go = (page) => () => {
        list.page = page;
        showPage(list, pageSize);
    };
    list.pager.hidden = count === 1;
    list.pager.replaceChildren(
        pageButton('‹', go(list.page - 1), { title: 'Previous page', disabled: list.page === 0 }),
        ...Array.from({ length: count }, (_, page) =>
            pageButton(String(page + 1), go(page), { current: page === list.page })
        ),
        pageButton('›', go(list.page + 1), {
            title: 'Next page',
            disabled: list.page === count - 1,
        }),
        el('span', 'pager-range', `${from + 1}–${to} of ${list.matching.length}`)
    );
    if (hadFocus) list.pager.querySelector('[aria-current]').focus();
}

// Pages every list in `body`; adds a search box above them when they hold more than one page.
// Returns `reveal(node)`, which brings a node inside one of the lists into view.
export function browse(body, { pageSize, label }) {
    const lists = [...body.querySelectorAll(LISTS)].map(listOf).filter((list) => list.items.length);
    for (const list of lists) list.box.after(list.pager);
    const total = lists.reduce((sum, list) => sum + list.items.length, 0);

    const input = el('input', 'search-input');
    input.type = 'search';
    input.placeholder = `Search ${label}…`;
    input.setAttribute('aria-label', `Search ${label}`);
    const found = el('span', 'search-count');
    found.setAttribute('aria-live', 'polite');
    if (total > pageSize) body.prepend(el('div', 'search', input, found));

    function filter() {
        const query = terms(input.value);
        for (const list of lists) {
            list.matching = list.items.filter((item) => hasTerms(item, query));
            list.page = 0;
            list.box.hidden = !list.matching.length;
            showPage(list, pageSize);
        }
        for (const group of body.querySelectorAll(GROUPS)) {
            group.hidden =
                query.length > 0 &&
                !lists.some((list) => list.matching.length && group.contains(list.node));
        }
        const matched = lists.reduce((sum, list) => sum + list.matching.length, 0);
        found.textContent = query.length ? (matched ? `${matched} of ${total}` : 'No matches') : '';
    }

    input.addEventListener('input', filter);
    filter();

    return function reveal(node) {
        const list = lists.find((candidate) => candidate.node.contains(node));
        if (!list) return;
        const item = list.items.find((candidate) => candidate.contains(node));
        if (!list.matching.includes(item)) {
            input.value = '';
            filter();
        }
        list.page = Math.floor(list.matching.indexOf(item) / pageSize);
        showPage(list, pageSize);
    };
}
