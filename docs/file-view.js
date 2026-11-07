// file-view.js — one markdown file under `.ai/`, rendered whole at `#file/<path>`; a heading slug
// after a second `#` scrolls to that heading. dom.js `viewHref` sends `.md` links here.
import { DOCS } from './config.js';
import {
    blocksNode,
    el,
    errorNode,
    inline,
    linkConcepts,
    markMissingRefs,
    viewHref,
} from './dom.js';
import { parseBlocks } from './md-blocks.js';
import { plainText } from './md-inline.js';

const ROOT = new URL(DOCS.root, window.location.href);

function decoded(text) {
    try {
        return decodeURIComponent(text);
    } catch {
        return text;
    }
}

// `ready` settles once every section has rendered, so refs and concept names in the file find
// their cards in `page`.
export function fileView(load, ready, page) {
    const heading = el('h2', '');
    const source = el('a', 'source');
    source.title = 'Raw markdown';
    const body = el('div', 'section-body file-body');
    const node = el(
        'section',
        'docs-section file-view',
        el('div', 'section-head', heading, source),
        body
    );
    node.hidden = true;
    let current = null;
    let rendering = null;
    let title = '';

    async function render(path) {
        const url = new URL(path, ROOT).href;
        title = path;
        node.dataset.folder = path.split('/')[0];
        heading.replaceChildren(path);
        source.replaceChildren(`.ai/${path}`);
        source.href = url;
        body.replaceChildren(el('p', 'muted', 'Loading…'));
        try {
            if (!viewHref(url)) throw new Error(`Not a .md file under .ai/: ${path}`);
            const [doc] = await Promise.all([load(path), ready]);
            if (current !== path) return;
            const blocks = parseBlocks(doc.lines);
            const top = blocks.find((block) => block.type === 'heading' && block.level === 1);
            if (top) {
                title = plainText(top.text);
                heading.replaceChildren(inline(top.text, doc.url));
            }
            const rest = blocks.filter((block) => block !== top);
            body.replaceChildren(blocksNode(rest, doc.url, { shift: 1 }));
            linkConcepts(body, page);
            markMissingRefs(body);
        } catch (err) {
            body.replaceChildren(errorNode(err.message));
        }
    }

    // Shows `<path>` or `<path>#<slug>`; resolves to the file's title.
    async function open(route) {
        const at = route.indexOf('#');
        const path = at === -1 ? route : route.slice(0, at);
        const anchor = at === -1 ? '' : decoded(route.slice(at + 1));
        if (path !== current) {
            current = path;
            rendering = render(path);
        }
        await rendering;
        if (current !== path) return title;
        const target = anchor ? body.querySelector(`[data-slug="${CSS.escape(anchor)}"]`) : null;
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
        return title;
    }

    return { node, open };
}
