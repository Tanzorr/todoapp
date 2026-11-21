'use strict';

function validate(schema, value, field) {
    const result = schema.safeParse(value);
    if (result.success) return result.data;

    const issue = result.error.issues[0];
    const err = new Error(issue.message);
    err.status = 400;
    const issueField = issue.path.length > 0 ? String(issue.path[0]) : field;
    if (issueField) err.field = issueField;
    throw err;
}

module.exports = { validate };
