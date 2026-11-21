ALTER TABLE users
    ADD COLUMN name VARCHAR(80) NULL AFTER email,
    ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER password_hash;
