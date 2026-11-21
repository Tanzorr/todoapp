import { renderTodoList } from './render.js';
import { initPageAction } from './action-button.js';
import { initAccount } from './account.js';

initAccount();
await renderTodoList();
initPageAction();
