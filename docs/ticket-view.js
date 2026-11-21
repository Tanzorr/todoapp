// ticket-view.js — a ticket file laid out for a reader who has not seen one: its fields as facts,
// each field and part with what it tells the reader (the `DOCS.tickets.guide` table), boxes
// counted, `DOCS.tickets.folded` parts closed. A file is a ticket when its first block, after the
// title, is a `Field | Value` table.
import { DOCS } from './config.js';
import { blocksNode, el, inline } from './dom.js';
import { findSection } from './md-blocks.js';
import { plainText } from './md-inline.js';
import { findTables, hasColumns } from './md-table.js';

const STATUS_WORD = /`([^`]+)`/;

function key(title) {
    return plainText(title).trim().toLowerCase();
}

// The guide table as `{ url, hints: part → text }`; null when the file has no such table.
export function readGuide(doc) {
    const lines = findSection(doc.lines, DOCS.tickets.guide);
    const [table] = lines ? findTables(lines) : [];
    if (!table) return null;
    return {
        url: doc.url,
        hints: new Map(table.rows.map(([part, text = '']) => [key(part), text])),
    };
}

export function isTicket(blocks) {
    const [first] = blocks;
    return first?.type === 'table' && hasColumns(first, ['Field', 'Value']);
}

function hintNode(guide, title) {
    const text = guide?.hints.get(key(title));
    return text ? el('span', 'hint', inline(text, guide.url)) : null;
}

function factsNode({ rows }, guide, base) {
    const list = el('dl', 'ticket-facts');
    for (const [field = '', value = ''] of rows) {
        const hint = hintNode(guide, field);
        const fact = el(
            'div',
            'fact',
            el('dt', '', plainText(field)),
            el('dd', '', inline(value, base)),
            hint ? el('dd', '', hint) : null
        );
        const status = STATUS_WORD.exec(value);
        if (key(field) === 'status' && status) {
            fact.classList.add('fact-status', `status-${status[1].trim().toLowerCase()}`);
        }
        list.append(fact);
    }
    return list;
}

// Counts the boxes the file states, not a reader's checklist.
function progressNode(content) {
    const boxes = [...content.querySelectorAll('input[type=checkbox]:disabled')];
    if (!boxes.length) return null;
    const done = boxes.filter((box) => box.checked).length;
    const fill = el('span', 'progress-fill');
    fill.style.width = `${(done / boxes.length) * 100}%`;
    return el(
        'p',
        'progress',
        el('span', 'progress-bar', fill),
        `${done} of ${boxes.length} checked`
    );
}

function partNode(heading, blocks, guide, base) {
    const head = blocksNode([heading], base, { shift: 1 });
    const content = blocksNode(blocks, base, { shift: 1 });
    const progress = progressNode(content);
    const hint = hintNode(guide, heading.text);
    if (!DOCS.tickets.folded.some((title) => key(title) === key(heading.text))) {
        return el('div', 'ticket-part', head, hint, progress, content);
    }
    return el('details', 'ticket-part', el('summary', '', head, hint), progress, content);
}

// `blocks` is the file without its title; `guide` may be null, then parts show without hints.
export function ticketNode(blocks, base, guide) {
    const [table, ...rest] = blocks;
    const node = el('div', 'ticket', factsNode(table, guide, base));
    if (!guide) {
        const where = `.ai/${DOCS.tickets.file}`;
        node.append(el('p', 'warn', `No “${DOCS.tickets.guide}” table in ${where}`));
    }
    const cuts = rest.flatMap((block, i) =>
        block.type === 'heading' && block.level === 2 ? [i] : []
    );
    node.append(blocksNode(rest.slice(0, cuts[0] ?? rest.length), base, { shift: 1 }));
    cuts.forEach((cut, i) => {
        const blocksAfter = rest.slice(cut + 1, cuts[i + 1] ?? rest.length);
        node.append(partNode(rest[cut], blocksAfter, guide, base));
    });
    return node;
}
