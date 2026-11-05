//constants.js
export const MAX_TASK_LENGTH = 200;

export const BUTTON_TEXT = {
    edit: 'edit',
    done: 'done',
    delete: 'delete',
    start: 'start',
    pause: 'pause',
};

export const TASK_SHOW_LABELS = {
    title: 'Task title',
    time: 'Tracked time',
    status: 'Status',
    description: 'Description',
};

export const TASK_STATUS_TEXT = {
    done: 'Done',
    pending: 'In progress',
};

//messages
export const PROMPTS = {
    addTask: 'Enter task title',
    editTask: 'Edit task title',
};

export const ALERTS = {
    emptyTask: 'Enter a task title.',
    maxLength: `Title can be at most ${MAX_TASK_LENGTH} characters.`,
};
