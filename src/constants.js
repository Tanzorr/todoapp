//constants.js
export const MIN_TASK_LENGTH = 5;
export const MAX_TASK_LENGTH = 50;

export const DEFAULT_TIMER_VALUE = 0;

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
    taskExists: 'Task already exists',
    emptyTask: 'Task title cannot be empty',
    minLength: `Task title must be at least ${MIN_TASK_LENGTH} characters long`,
    maxLength: `Task title must be less than ${MAX_TASK_LENGTH} characters long`,
};
