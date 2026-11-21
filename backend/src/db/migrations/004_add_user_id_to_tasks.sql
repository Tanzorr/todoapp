INSERT IGNORE INTO users (email, password_hash) VALUES ('legacy@todo.invalid', '!no-password');

ALTER TABLE tasks ADD COLUMN user_id INT UNSIGNED NULL AFTER id;

UPDATE tasks
SET user_id = (SELECT id FROM users WHERE email = 'legacy@todo.invalid')
WHERE user_id IS NULL;

ALTER TABLE tasks
    MODIFY user_id INT UNSIGNED NOT NULL,
    ADD CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
