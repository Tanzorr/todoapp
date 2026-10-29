// md-inline.js — inline markdown → tokens: text, code, strong, em, link.
// Anything else stays text. No DOM.

const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)/;
const BOLD_LEAD = /^\*\*(.+?)\*\*\s*(?:[—–:-]\s*)?([\s\S]*)$/;

function closing(source, marker, from) {
    const end = source.indexOf(marker, from);
    return end > from && source[end - 1] !== ' ' ? end : -1;
}

export function parseInline(source) {
    const tokens = [];
    let text = '';
    const flush = () => {
        if (text) tokens.push({ type: 'text', text });
        text = '';
    };
    const push = (token) => {
        flush();
        tokens.push(token);
    };

    let i = 0;
    while (i < source.length) {
        const ch = source[i];
        const rest = source.slice(i);

        if (ch === '\\' && i + 1 < source.length) {
            text += source[i + 1];
            i += 2;
            continue;
        }
        if (ch === '`') {
            const fence = /^`+/.exec(rest)[0];
            const end = source.indexOf(fence, i + fence.length);
            if (end !== -1) {
                push({ type: 'code', text: source.slice(i + fence.length, end).trim() });
                i = end + fence.length;
                continue;
            }
        }
        if (rest.startsWith('**') && source[i + 2] !== ' ') {
            const end = closing(source, '**', i + 2);
            if (end !== -1) {
                push({ type: 'strong', children: parseInline(source.slice(i + 2, end)) });
                i = end + 2;
                continue;
            }
        }
        if (ch === '*' && source[i + 1] !== ' ' && source[i + 1] !== '*') {
            const end = closing(source, '*', i + 1);
            if (end !== -1) {
                push({ type: 'em', children: parseInline(source.slice(i + 1, end)) });
                i = end + 1;
                continue;
            }
        }
        if (ch === '[') {
            const link = LINK.exec(rest);
            if (link) {
                push({ type: 'link', href: link[2], children: parseInline(link[1]) });
                i += link[0].length;
                continue;
            }
        }
        text += ch;
        i++;
    }
    flush();
    return tokens;
}

export function tokensText(tokens) {
    return tokens
        .map((token) => (token.children ? tokensText(token.children) : token.text))
        .join('');
}

export function plainText(source) {
    return tokensText(parseInline(source));
}

export function firstLink(source) {
    return parseInline(source).find((token) => token.type === 'link') ?? null;
}

// `**S-1** — text` → { lead: 'S-1', rest: 'text' }; null when the text has no bold lead.
export function splitBoldLead(source) {
    const match = BOLD_LEAD.exec(source.trim());
    return match ? { lead: match[1], rest: match[2] } : null;
}
