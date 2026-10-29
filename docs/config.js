// config.js — the one map from `.ai/` files to page sections. Paths are relative to `root`;
// `parts` name the headings a section reads, matched without their numbering.

export const DOCS = {
    root: '../.ai/',
    refPattern: /\b(?:[VISQ]-\d+|TASK-\d{3}|ADR-\d{3})\b/,
    statusOrder: ['in-progress', 'blocked', 'planned', 'done'],
    sections: [
        {
            id: 'value',
            title: 'Value',
            kind: 'value',
            file: 'business/VALUE.md',
            parts: { drivers: 'Value Drivers', criteria: 'Success Criteria' },
        },
        {
            id: 'ontology',
            title: 'Ontology',
            kind: 'ontology',
            file: 'context/ontology.md',
            parts: { concepts: 'Concepts', invariants: 'Invariants', questions: 'Open Questions' },
        },
        {
            id: 'backlog',
            title: 'In progress',
            kind: 'backlog',
            file: 'backlog/INDEX.md',
            parts: { tickets: 'Open' },
        },
        {
            id: 'archive',
            title: 'Archive',
            kind: 'archive',
            file: 'archive/INDEX.md',
            parts: {},
        },
        {
            id: 'conventions',
            title: 'Conventions',
            kind: 'conventions',
            file: 'context/conventions.md',
            parts: { checklist: 'Definition of Done' },
        },
        {
            id: 'endpoints',
            title: 'Endpoints',
            kind: 'endpoints',
            file: 'context/architecture.md',
            parts: { api: 'API Surface' },
        },
        {
            id: 'architecture',
            title: 'Architecture',
            kind: 'architecture',
            file: 'context/architecture.md',
            parts: { layers: 'Layers', flow: 'Request Flow', adrs: 'ADRs' },
        },
    ],
};
