// main.js — page entry: fetch the `.ai/` files, render each section, resolve references, then
// show the section the URL hash names.
import { browse } from './browse.js';
import { DOCS } from './config.js';
import { el, errorNode, fileLink, markMissingRefs } from './dom.js';
import { toLines } from './md-blocks.js';
import { RENDERERS } from './sections.js';

const ROOT = new URL(DOCS.root, window.location.href);
const TITLE = document.title;
const files = new Map();
const reveals = new Map();

async function fetchLines(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    return { url, lines: toLines(await res.text()) };
}

// Each file is fetched once per load, however many sections read it.
function load(path, base = ROOT) {
    const url = new URL(path, base).href;
    if (!files.has(url)) files.set(url, fetchLines(url));
    return files.get(url);
}

function sectionShell(section) {
    const source = new URL(section.file, ROOT).href;
    const body = el('div', 'section-body');
    const head = el(
        'div',
        'section-head',
        el('h2', '', section.title),
        fileLink(source, `.ai/${section.file}`)
    );
    const node = el('section', 'docs-section', head, body);
    node.id = section.id;
    node.hidden = true;
    return { node, body };
}

function navLink(section) {
    const link = el('a', '', section.title);
    link.href = `#${section.id}`;
    return link;
}

async function renderSection(section, body) {
    try {
        body.append(await RENDERERS[section.kind](section, load));
        reveals.set(section.id, browse(body, { pageSize: DOCS.pageSize, label: section.title }));
    } catch (err) {
        body.append(errorNode(err.message));
    }
}

// One section shows at a time. The hash names a section, or a card — then the card's section
// shows, at the list page holding the card; either is scrolled to, as the browser would for a
// visible element. Anything else shows the first section from the top.
function route(nav, content) {
    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    const shown = target?.closest('.docs-section') ?? content.firstElementChild;
    if (!shown) return;
    for (const section of content.children) section.hidden = section !== shown;
    for (const link of nav.children) {
        if (link.getAttribute('href') === `#${shown.id}`) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    }
    const section = DOCS.sections.find((candidate) => candidate.id === shown.id);
    document.title = `${section.title} · ${TITLE}`;
    if (!target) {
        window.scrollTo(0, 0);
        return;
    }
    if (target !== shown) reveals.get(shown.id)?.(target);
    target.scrollIntoView();
}

function main() {
    const nav = document.querySelector('.docs-nav');
    const content = document.querySelector('.docs-content');
    const status = document.querySelector('.docs-status');
    const rendered = DOCS.sections.map((section) => {
        const { node, body } = sectionShell(section);
        nav.append(navLink(section));
        content.append(node);
        return renderSection(section, body);
    });
    const show = () => route(nav, content);
    window.addEventListener('hashchange', show);
    show();
    Promise.all(rendered).then(() => {
        markMissingRefs(content);
        status.textContent = `Read ${files.size} files at ${new Date().toLocaleTimeString()}.`;
        show();
    });
}

main();
