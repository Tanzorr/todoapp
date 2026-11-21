ALTER TABLE tasks DROP FOREIGN KEY fk_tasks_user;

ALTER TABLE tasks DROP COLUMN user_id;

DELETE FROM users WHERE email = 'legacy@todo.invalid';
