// dom.js — DOM factories. File text enters only as text nodes (I-8), never parsed as HTML.
import { DOCS } from './config.js';
import { parseInline, plainText, tokensText } from './md-inline.js';

const REF_SPLIT = new RegExp(`(${DOCS.refPattern.source})`);
const REF_ONLY = new RegExp(`^(?:${DOCS.refPattern.source})$`);
const usedIds = new Set();

export function el(tag, className, ...children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(
        ...children.filter((child) => child !== null && child !== undefined && child !== '')
    );
    return node;
}

export function isRef(text) {
    return REF_ONLY.test(text);
}

function refLink(id, ...label) {
    const link = el('a', 'ref', ...(label.length ? label : [id]));
    link.href = `#${id}`;
    return link;
}

function safeUrl(href, base) {
    try {
        const url = new URL(href, base);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}

function linkNode(token, base) {
    const label = renderTokens(token.children, base, false);
    const text = tokensText(token.children);
    if (isRef(text)) return refLink(text, ...label);
    const url = safeUrl(token.href, base);
    if (!url) return el('span', '', ...label);
    const link = el('a', '', ...label);
    link.href = url;
    return link;
}

function renderToken(token, base, withRefs) {
    switch (token.type) {
        case 'code': {
            const code = el('code', '', token.text);
            return withRefs && isRef(token.text) ? [refLink(token.text, code)] : [code];
        }
        case 'strong':
            return [el('strong', '', ...renderTokens(token.children, base, withRefs))];
        case 'em':
            return [el('em', '', ...renderTokens(token.children, base, withRefs))];
        case 'link':
            return withRefs ? [linkNode(token, base)] : renderTokens(token.children, base, false);
        default:
            if (!withRefs) return [token.text];
            return token.text.split(REF_SPLIT).map((part, i) => (i % 2 ? refLink(part) : part));
    }
}

function renderTokens(tokens, base, withRefs) {
    return tokens.flatMap((token) => renderToken(token, base, withRefs));
}

// Inline markdown → nodes. `base` is the URL of the file the text came from.
export function inline(source, base) {
    const fragment = document.createDocumentFragment();
    fragment.append(...renderTokens(parseInline(source), base, true));
    return fragment;
}

function listNode(block, base, checklist) {
    const list = el(block.ordered ? 'ol' : 'ul', checklist ? 'checklist' : '');
    for (const item of block.items) {
        if (!checklist) {
            list.append(el('li', '', inline(item, base)));
            continue;
        }
        const box = el('input');
        box.type = 'checkbox';
        list.append(el('li', '', el('label', '', box, el('span', '', inline(item, base)))));
    }
    return list;
}

export function tableNode({ headers, rows }, base) {
    const head = el('tr', '', ...headers.map((header) => el('th', '', inline(header, base))));
    const body = rows.map((cells) =>
        el('tr', '', ...cells.map((cell) => el('td', '', inline(cell, base))))
    );
    return el(
        'div',
        'table-wrap',
        el('table', '', el('thead', '', head), el('tbody', '', ...body))
    );
}

export function blocksNode(blocks, base, { checklist = false } = {}) {
    const fragment = document.createDocumentFragment();
    for (const block of blocks) {
        if (block.type === 'heading') {
            fragment.append(el(`h${Math.min(block.level + 2, 6)}`, '', inline(block.text, base)));
        } else if (block.type === 'paragraph') {
            fragment.append(el('p', '', inline(block.text, base)));
        } else if (block.type === 'quote') {
            fragment.append(el('blockquote', '', inline(block.text, base)));
        } else if (block.type === 'list') {
            fragment.append(listNode(block, base, checklist));
        } else if (block.type === 'table') {
            fragment.append(tableNode(block, base));
        } else if (block.type === 'code') {
            fragment.append(el('pre', '', el('code', '', block.text)));
        }
    }
    return fragment;
}

// A card whose head starts with a reference (V-1, TASK-009…) gets its prefix as `data-kind`
// and the reference as element id, the id once per page.
export function card(head, ...children) {
    const heads = [head].flat();
    const node = el('article', 'card', el('header', 'card-head', ...heads), ...children);
    const id = heads[0];
    if (typeof id === 'string' && isRef(id)) {
        node.dataset.kind = id.split('-')[0];
        if (!usedIds.has(id)) {
            node.id = id;
            usedIds.add(id);
        }
    }
    return node;
}

export function fieldList(pairs, base, className = 'fields') {
    const list = el('dl', className);
    for (const [label, value] of pairs) {
        list.append(el('dt', '', inline(label, base)), el('dd', '', inline(value, base)));
    }
    return list;
}

export function fileLink(url, label) {
    const link = el('a', 'source', label ?? decodeURI(new URL(url).pathname.split('/').pop()));
    link.href = url;
    return link;
}

// Table row → card: first cell is the head; with three or more columns the second is the title
// and the rest are labelled fields, label above value.
export function rowCard(headers, cells, base) {
    const node = card(plainText(cells[0]));
    if (cells.length <= 2) {
        node.append(el('p', '', inline(cells[1] ?? '', base)));
        return node;
    }
    const pairs = headers.slice(2).map((header, i) => [header, cells[i + 2] ?? '']);
    node.append(
        el('p', 'card-title', inline(cells[1], base)),
        fieldList(pairs, base, 'fields fields-stacked')
    );
    return node;
}

export function grid(nodes, className = '') {
    return el('div', `grid ${className}`.trim(), ...nodes);
}

export function part(title, base, ...children) {
    return el('div', 'part', el('h3', 'part-title', inline(title, base)), ...children);
}

export function errorNode(message) {
    return el('p', 'error', message);
}

// Links to an id no card carries are marked, so a stale reference is visible on the page.
export function markMissingRefs(root) {
    for (const link of root.querySelectorAll('a.ref')) {
        if (document.getElementById(link.getAttribute('href').slice(1))) continue;
        link.classList.add('ref-missing');
        link.title = 'No card with this id on the page';
    }
}
