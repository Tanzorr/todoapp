//constants.js
export const MAX_TASK_LENGTH = 200;

export const TASKS_CHANGED = 'tasks-changed';

export const BUTTON_TEXT = {
    start: 'Start',
    stop: 'Stop',
};

export const ARIA_LABELS = {
    done: (title) => `Mark ${title} as done`,
    start: (title) => `Start timer for ${title}`,
    stop: (title) => `Stop timer for ${title}`,
    edit: (title) => `Edit ${title}`,
    delete: (title) => `Delete ${title}`,
};

export const ICONS = {
    plus: { size: 18, stroke: 2.2, paths: ['M12 5v14M5 12h14'] },
    check: { size: 14, stroke: 3.2, paths: ['M5 12.5 10 17.5 19 7'] },
    start: { size: 14, paths: ['M7 4.5v15l13-7.5z'] },
    stop: {
        size: 14,
        paths: ['M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'],
    },
    edit: { size: 19, stroke: 1.8, paths: ['M4 20h4L19 9l-4-4L4 16v4Z', 'm13.5 6.5 4 4'] },
    trash: {
        size: 19,
        stroke: 1.8,
        paths: ['M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5'],
    },
    alert: {
        size: 18,
        stroke: 2.2,
        paths: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 7.5v5.5M12 16.5v.01'],
    },
    close: { size: 18, stroke: 2.2, paths: ['M6 6l12 12M18 6 6 18'] },
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
    serverDown: "The server isn't responding. Check that it's running, then try again.",
    startFailed: "Couldn't start the timer.",
    stopFailed: "Couldn't stop the timer.",
    doneFailed: "Couldn't update the task.",
};

export const SIGN_IN_PAGE = 'login.html';

export const AUTH_MODES = {
    signIn: {
        heading: 'Sign in',
        submit: 'Sign in',
        switchTo: 'register',
        switchText: 'Create an account',
        passwordAutocomplete: 'current-password',
        passwordHint: '',
    },
    register: {
        heading: 'Create an account',
        submit: 'Create account',
        switchTo: 'signIn',
        switchText: 'I already have an account',
        passwordAutocomplete: 'new-password',
        passwordHint: 'At least 8 characters.',
    },
};
