// main.js — page entry: fetch the `.ai/` files, render each section, then resolve references.
import { DOCS } from './config.js';
import { el, errorNode, fileLink, markMissingRefs } from './dom.js';
import { toLines } from './md-blocks.js';
import { RENDERERS } from './sections.js';

const ROOT = new URL(DOCS.root, window.location.href);
const files = new Map();

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
    } catch (err) {
        body.append(errorNode(err.message));
    }
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
    Promise.all(rendered).then(() => {
        markMissingRefs(content);
        status.textContent = `Read ${files.size} files at ${new Date().toLocaleTimeString()}.`;
        const target =
            window.location.hash && document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView();
    });
}

main();
