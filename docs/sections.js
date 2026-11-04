// sections.js — one renderer per section kind. Each gets its config entry and `load(path, base)`
// and returns a node; a missing heading or table throws, and the section shows the error.
import { DOCS } from './config.js';
import {
    blocksNode,
    card,
    el,
    fieldList,
    fileLink,
    grid,
    inline,
    part,
    refLink,
    rowCard,
    tableNode,
} from './dom.js';
import {
    findSection,
    firstBlock,
    firstHeading,
    parseBlocks,
    sameTitle,
    splitByHeading,
} from './md-blocks.js';
import { firstLink, plainText, splitBoldLead } from './md-inline.js';
import { findTables, hasColumns, toRecords } from './md-table.js';

const STATUS = /^`([^`]+)`\s*(?:[—–-]\s*)?(.*)$/;
const PLACEHOLDER = /^[—–-]?$/;
const PAGE_COLUMNS = ['Page', 'Parent', 'Purpose', 'Goes to'];
const DOCS_PAGE = new URL('index.html', window.location.href).href;

function sectionLines(doc, title) {
    const lines = findSection(doc.lines, title);
    if (!lines) throw new Error(`No "${title}" heading in ${doc.url}`);
    return lines;
}

function tableIn(doc, title) {
    const [table] = findTables(sectionLines(doc, title));
    if (!table) throw new Error(`No table under "${title}" in ${doc.url}`);
    return table;
}

function listIn(doc, title) {
    const list = firstBlock(sectionLines(doc, title), 'list');
    if (!list) throw new Error(`No list under "${title}" in ${doc.url}`);
    return list.items;
}

function leadCard(item, base) {
    const split = splitBoldLead(item);
    if (!split) return card('', el('p', '', inline(item, base)));
    return card(plainText(split.lead), el('p', '', inline(split.rest, base)));
}

function realRows(table) {
    return table.rows.filter((cells) => !PLACEHOLDER.test(plainText(cells[0] ?? '').trim()));
}

async function value(section, load) {
    const doc = await load(section.file);
    const { drivers, criteria } = section.parts;
    const table = tableIn(doc, drivers);
    return el(
        'div',
        '',
        part(
            drivers,
            doc.url,
            grid(table.rows.map((cells) => rowCard(table.headers, cells, doc.url)))
        ),
        part(criteria, doc.url, grid(listIn(doc, criteria).map((item) => leadCard(item, doc.url))))
    );
}

async function ontology(section, load) {
    const doc = await load(section.file);
    const { concepts, invariants, questions } = section.parts;
    const table = tableIn(doc, invariants);
    return el(
        'div',
        '',
        part(concepts, doc.url, tableNode(tableIn(doc, concepts), doc.url)),
        part(
            invariants,
            doc.url,
            grid(table.rows.map((cells) => rowCard(table.headers, cells, doc.url)))
        ),
        part(
            questions,
            doc.url,
            grid(listIn(doc, questions).map((item) => leadCard(item, doc.url)))
        )
    );
}

function statusOf(source) {
    const match = STATUS.exec(source.trim());
    if (match) return { status: match[1].trim().toLowerCase(), note: match[2] };
    return { status: plainText(source).trim().split(/\s+/)[0].toLowerCase(), note: '' };
}

// The ticket file wins over its INDEX.md row; the row is the fallback when the file is unreadable.
async function readTicket(row, index, load) {
    const link = firstLink(row.ID);
    const ticket = {
        id: plainText(row.ID),
        title: row.Title,
        indexStatus: statusOf(row.Status).status,
        ...statusOf(row.Status),
        fields: [],
        url: null,
        error: null,
    };
    if (!link) return { ...ticket, error: 'INDEX.md row has no link to a ticket file' };
    try {
        const doc = await load(link.href, index.url);
        const heading = firstHeading(doc.lines);
        const [table] = findTables(doc.lines);
        const fields = table ? table.rows.map(([key, val]) => [plainText(key), val ?? '']) : [];
        const status = fields.find(([key]) => key === 'Status');
        return {
            ...ticket,
            ...(status ? statusOf(status[1]) : {}),
            title:
                heading && heading.includes(' — ')
                    ? heading.split(' — ').slice(1).join(' — ')
                    : ticket.title,
            fields: fields.filter(([key]) => key !== 'Status'),
            url: doc.url,
        };
    } catch (err) {
        return { ...ticket, error: err.message };
    }
}

function ticketCard(ticket, indexUrl) {
    const base = ticket.url ?? indexUrl;
    const node = card(ticket.id, el('p', 'card-title', inline(ticket.title, base)));
    if (ticket.note) node.append(el('p', 'note', inline(ticket.note, base)));
    if (ticket.fields.length) node.append(fieldList(ticket.fields, base));
    if (ticket.status !== ticket.indexStatus) {
        node.append(
            el('p', 'warn', `INDEX.md says “${ticket.indexStatus}” — the ticket file wins`)
        );
    }
    if (ticket.error) node.append(el('p', 'warn', ticket.error));
    if (ticket.url) node.append(el('footer', 'card-foot', fileLink(ticket.url)));
    return node;
}

function byStatus(tickets) {
    const groups = new Map();
    for (const ticket of tickets) {
        if (!groups.has(ticket.status)) groups.set(ticket.status, []);
        groups.get(ticket.status).push(ticket);
    }
    const known = DOCS.statusOrder.filter((status) => groups.has(status));
    const other = [...groups.keys()].filter((status) => !DOCS.statusOrder.includes(status));
    return [...known, ...other].map((status) => [status, groups.get(status)]);
}

async function backlog(section, load) {
    const index = await load(section.file);
    const table = tableIn(index, section.parts.tickets);
    if (!hasColumns(table, ['ID', 'Title', 'Status'])) {
        throw new Error(
            `The "${section.parts.tickets}" table in ${index.url} needs ID, Title, Status`
        );
    }
    const rows = toRecords({ ...table, rows: realRows(table) });
    const tickets = await Promise.all(rows.map((row) => readTicket(row, index, load)));
    const groups = byStatus(tickets).map(([status, group]) =>
        el(
            'div',
            `status-group status-${status}`,
            el('h3', 'status-head', status, el('span', 'count', String(group.length))),
            grid(group.map((ticket) => ticketCard(ticket, index.url)))
        )
    );
    return groups.length ? el('div', '', ...groups) : el('p', 'muted', 'No open tickets.');
}

async function archive(section, load) {
    const doc = await load(section.file);
    const parts = splitByHeading(doc.lines, 2)
        .parts.map((piece) => ({ title: piece.title, table: findTables(piece.lines)[0] }))
        .filter((piece) => piece.table);
    if (!parts.length) throw new Error(`No tables in ${doc.url}`);
    return el(
        'div',
        '',
        ...parts.map(({ title, table }) => {
            const rows = realRows(table);
            const cards = rows.map((cells) => rowCard(table.headers, cells, doc.url));
            return part(title, doc.url, cards.length ? grid(cards) : el('p', 'muted', 'None yet.'));
        })
    );
}

// First word of a heading, letters and digits only: "DON'T" → "dont", "Definition of Done" →
// "definition". The stylesheet colours a card by it.
function headingKind(title) {
    return plainText(title)
        .trim()
        .split(/\s+/)[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

async function conventions(section, load) {
    const doc = await load(section.file);
    const { checklist } = section.parts;
    sectionLines(doc, checklist); // throws when the checklist heading is gone
    const cards = splitByHeading(doc.lines, 2).parts.map((piece) => {
        const isChecklist = sameTitle(piece.title, checklist);
        const node = card(
            inline(piece.title, doc.url),
            blocksNode(parseBlocks(piece.lines), doc.url, { checklist: isChecklist })
        );
        node.dataset.kind = headingKind(piece.title);
        if (isChecklist) node.classList.add('card-wide');
        return node;
    });
    return grid(cards);
}

function endpointRow(cells, base) {
    const method = plainText(cells[0]).trim().toUpperCase();
    return el(
        'li',
        `endpoint method-${method.toLowerCase()}`,
        el('span', 'method', method),
        el('span', 'path', inline(cells[1] ?? '', base)),
        el('span', 'success', inline(cells.slice(2).join(' · '), base))
    );
}

async function endpoints(section, load) {
    const doc = await load(section.file);
    const blocks = parseBlocks(sectionLines(doc, section.parts.api));
    const table = blocks.find((block) => block.type === 'table');
    if (!table) throw new Error(`No table under "${section.parts.api}" in ${doc.url}`);
    return el(
        'div',
        '',
        el('ul', 'endpoints', ...table.rows.map((cells) => endpointRow(cells, doc.url))),
        blocksNode(
            blocks.filter((block) => block !== table),
            doc.url
        )
    );
}

function adrCard(piece, base) {
    const [id, ...title] = piece.title.split(' — ');
    return card(
        id.trim(),
        el('p', 'card-title', inline(title.join(' — '), base)),
        blocksNode(parseBlocks(piece.lines), base)
    );
}

async function architecture(section, load) {
    const doc = await load(section.file);
    const { layers, flow, adrs } = section.parts;
    const decisions = splitByHeading(sectionLines(doc, adrs), 3);
    return el(
        'div',
        '',
        part(layers, doc.url, blocksNode(parseBlocks(sectionLines(doc, layers)), doc.url)),
        part(flow, doc.url, blocksNode(parseBlocks(sectionLines(doc, flow)), doc.url)),
        part(
            adrs,
            doc.url,
            blocksNode(parseBlocks(decisions.intro), doc.url),
            grid(
                decisions.parts.map((piece) => adrCard(piece, doc.url)),
                'grid-wide'
            )
        )
    );
}

async function readPage(row, base, load) {
    const page = { row, name: plainText(row.Page), parent: plainText(row.Parent), url: null };
    const link = firstLink(row.Page);
    if (!link) return { ...page, error: 'Site Map row has no link to a page file' };
    try {
        const { url } = await load(link.href, base);
        return { ...page, url, error: null };
    } catch (err) {
        return { ...page, error: err.message };
    }
}

// Following Parent from `page` comes back to it, so a walk down from the top would never reach it.
function parentLoops(page, byName) {
    const seen = new Set();
    let at = byName.get(page.parent);
    while (at && at !== page && !seen.has(at)) {
        seen.add(at);
        at = byName.get(at.parent);
    }
    return at === page;
}

function pageWarnings(page, byName) {
    const warnings = page.error ? [page.error] : [];
    if (PLACEHOLDER.test(page.parent)) return warnings;
    if (!byName.has(page.parent)) warnings.push(`No row names the Parent “${page.parent}”`);
    else if (parentLoops(page, byName)) warnings.push(`Parent “${page.parent}” leads back here`);
    return warnings;
}

function treeItem(node, children = []) {
    return el('li', 'tree-item', node, children.length ? el('ul', 'tree', ...children) : null);
}

function pageItem(page, pages, base) {
    const children = pages
        .filter((child) => child.under === page)
        .map((child) => pageItem(child, pages, base));
    if (page.url === DOCS_PAGE) {
        children.push(...DOCS.sections.map(({ id, title }) => treeItem(card(refLink(id, title)))));
    }
    return treeItem(
        card(
            inline(page.row.Page, base),
            fieldList(
                PAGE_COLUMNS.slice(2).map((column) => [column, page.row[column]]),
                base
            ),
            ...page.warnings.map((warning) => el('p', 'warn', warning))
        ),
        children
    );
}

// A row with a warning goes to the top level, so its children still have somewhere to hang.
async function sitemap(section, load) {
    const doc = await load(section.file);
    const table = tableIn(doc, section.parts.pages);
    if (!hasColumns(table, PAGE_COLUMNS)) {
        throw new Error(
            `The "${section.parts.pages}" table in ${doc.url} needs ${PAGE_COLUMNS.join(', ')}`
        );
    }
    const rows = toRecords({ ...table, rows: realRows(table) });
    const pages = await Promise.all(rows.map((row) => readPage(row, doc.url, load)));
    const byName = new Map(pages.map((page) => [page.name, page]));
    for (const page of pages) {
        page.warnings = pageWarnings(page, byName);
        page.under = page.warnings.length ? undefined : byName.get(page.parent);
    }
    return el(
        'ul',
        'tree',
        ...pages.filter((page) => !page.under).map((page) => pageItem(page, pages, doc.url))
    );
}

export const RENDERERS = {
    value,
    ontology,
    backlog,
    archive,
    conventions,
    endpoints,
    architecture,
    sitemap,
};
