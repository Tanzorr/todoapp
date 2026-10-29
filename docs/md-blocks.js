// md-blocks.js — block-level markdown: headings, sections, lists, code fences, paragraphs.
// No DOM, no project names.
import { isTableLine, parseTable } from './md-table.js';

const HEADING = /^(#{1,6})\s+(.*?)\s*#*$/;
const LIST_ITEM = /^\s*([-*]|\d+\.)\s+(.*)$/;
const FENCE = /^\s*```/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*(-{3,}|\*{3,})\s*$/;
const NUMBERING = /^\d+(\.\d+)*\.?\s+/;

export function toLines(markdown) {
    return markdown.replace(/\r\n?/g, '\n').split('\n');
}

function headingOf(line) {
    const match = HEADING.exec(line);
    return match ? { level: match[1].length, text: match[2] } : null;
}

function headings(lines) {
    const found = [];
    let inFence = false;
    lines.forEach((line, index) => {
        if (FENCE.test(line)) inFence = !inFence;
        const heading = inFence ? null : headingOf(line);
        if (heading) found.push({ ...heading, index });
    });
    return found;
}

// "4. Value Drivers" matches "value drivers": numbering and case are ignored.
export function sameTitle(heading, title) {
    return heading.replace(NUMBERING, '').trim().toLowerCase() === title.trim().toLowerCase();
}

export function firstHeading(lines, level = 1) {
    return headings(lines).find((heading) => heading.level === level)?.text ?? null;
}

// Lines under the heading titled `title`, up to the next heading of the same or higher level.
export function findSection(lines, title) {
    const all = headings(lines);
    const at = all.findIndex((heading) => sameTitle(heading.text, title));
    if (at === -1) return null;
    const start = all[at];
    const end = all.slice(at + 1).find((heading) => heading.level <= start.level);
    return lines.slice(start.index + 1, end ? end.index : lines.length);
}

// Every heading at `level` with its lines; `intro` is what comes before the first one.
export function splitByHeading(lines, level) {
    const cuts = headings(lines).filter((heading) => heading.level <= level);
    const parts = cuts
        .map((heading, i) => ({
            level: heading.level,
            title: heading.text,
            lines: lines.slice(heading.index + 1, cuts[i + 1]?.index ?? lines.length),
        }))
        .filter((part) => part.level === level);
    return { intro: lines.slice(0, cuts[0]?.index ?? lines.length), parts };
}

function startsBlock(line) {
    return (
        FENCE.test(line) ||
        headingOf(line) !== null ||
        isTableLine(line) ||
        LIST_ITEM.test(line) ||
        QUOTE.test(line) ||
        RULE.test(line)
    );
}

function takeWhile(lines, from, keep) {
    let end = from;
    while (end < lines.length && keep(lines[end])) end++;
    return end;
}

function readList(lines, from) {
    const ordered = /\d/.test(LIST_ITEM.exec(lines[from])[1]);
    const items = [];
    let i = from;
    while (i < lines.length) {
        const item = LIST_ITEM.exec(lines[i]);
        if (item && !RULE.test(lines[i])) {
            items.push(item[2]);
        } else if (items.length && /^\s+\S/.test(lines[i])) {
            items[items.length - 1] += ` ${lines[i].trim()}`;
        } else {
            break;
        }
        i++;
    }
    return { block: { type: 'list', ordered, items }, next: i };
}

export function parseBlocks(lines) {
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || RULE.test(line)) {
            i++;
        } else if (FENCE.test(line)) {
            const close = lines.findIndex((other, j) => j > i && FENCE.test(other));
            const end = close === -1 ? lines.length : close;
            blocks.push({ type: 'code', text: lines.slice(i + 1, end).join('\n') });
            i = end + 1;
        } else if (headingOf(line)) {
            blocks.push({ type: 'heading', ...headingOf(line) });
            i++;
        } else if (isTableLine(line)) {
            const end = takeWhile(lines, i, isTableLine);
            const table = parseTable(lines.slice(i, end));
            const text = lines.slice(i, end).join(' ');
            blocks.push(table ? { type: 'table', ...table } : { type: 'paragraph', text });
            i = end;
        } else if (LIST_ITEM.test(line)) {
            const { block, next } = readList(lines, i);
            blocks.push(block);
            i = next;
        } else if (QUOTE.test(line)) {
            const end = takeWhile(lines, i, (other) => QUOTE.test(other));
            const text = lines.slice(i, end).map((other) => QUOTE.exec(other)[1]);
            blocks.push({ type: 'quote', text: text.join(' ').trim() });
            i = end;
        } else {
            const end = takeWhile(
                lines,
                i + 1,
                (other) => other.trim() !== '' && !startsBlock(other)
            );
            const text = lines.slice(i, end).map((other) => other.trim());
            blocks.push({ type: 'paragraph', text: text.join(' ') });
            i = end;
        }
    }
    return blocks;
}

export function firstBlock(lines, type) {
    return parseBlocks(lines).find((block) => block.type === type) ?? null;
}
