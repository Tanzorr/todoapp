import {taskStoreArray} from './data.js';

import {PROMPTS} from './constants.js';
import {taskValidation} from './validations.js';
import {renderTodoList} from './render.js';

const addButton = document.querySelector('.add-task-btn');

renderTodoList();

//addButton.onclick = addNewTodoToArray;

// function addNewTodoToArray() {
//     //Get input from a user using a prompt
//     const inputValue = window.prompt(PROMPTS.addTask);
//
//     if (taskValidation(inputValue, taskStoreArray)) {
//         taskStoreArray.push(inputValue);
//         renderTodoList();
//     }
// }


const form = document.querySelector('.form');
const taskInput = form.querySelector('.input-task');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (taskValidation(taskInput.value, taskStoreArray)) {
        taskStoreArray.push(taskInput.value);
        renderTodoList();
        taskInput.value = '';
    }
});
