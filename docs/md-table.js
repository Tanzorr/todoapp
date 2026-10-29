// md-table.js — pipe tables in markdown lines → headers and rows of raw cell text.
// No DOM, no project names: it only knows the table syntax.

const DELIMITER_ROW = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

export function isTableLine(line) {
    return line.trimStart().startsWith('|');
}

export function splitRow(line) {
    const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    const cells = [];
    let cell = '';
    for (let i = 0; i < body.length; i++) {
        if (body[i] === '\\' && body[i + 1] === '|') {
            cell += '|';
            i++;
        } else if (body[i] === '|') {
            cells.push(cell.trim());
            cell = '';
        } else {
            cell += body[i];
        }
    }
    cells.push(cell.trim());
    return cells;
}

export function parseTable(lines) {
    if (lines.length < 2 || !DELIMITER_ROW.test(lines[1].trim())) return null;
    return { headers: splitRow(lines[0]), rows: lines.slice(2).map(splitRow) };
}

export function findTables(lines) {
    const tables = [];
    let block = [];
    for (const line of [...lines, '']) {
        if (isTableLine(line)) {
            block.push(line);
            continue;
        }
        const table = parseTable(block);
        if (table) tables.push(table);
        block = [];
    }
    return tables;
}

export function toRecords({ headers, rows }) {
    return rows.map((cells) =>
        Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? '']))
    );
}

export function hasColumns({ headers }, names) {
    return names.every((name) => headers.includes(name));
}
