-- Run this once on the production MySQL database before or alongside the next Render deploy.
-- It is focused on the auth-critical tables and is safe to re-run on MySQL 8+.

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(255) NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    active BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_phone (phone)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NOT NULL DEFAULT 'Sathi User';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BIT(1) NOT NULL DEFAULT b'1';

CREATE TABLE IF NOT EXISTS partner_profiles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(255) NOT NULL,
    professional_role VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    joining_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
    PRIMARY KEY (id),
    UNIQUE KEY uk_partner_profiles_user_id (user_id),
    UNIQUE KEY uk_partner_profiles_employee_id (employee_id),
    CONSTRAINT fk_partner_profiles_user FOREIGN KEY (user_id) REFERENCES users (id)
);

ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS user_id BIGINT NULL;
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS employee_id VARCHAR(255) NULL;
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS professional_role VARCHAR(255) NOT NULL DEFAULT 'Care Partner';
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS address VARCHAR(255) NOT NULL DEFAULT 'Pending address update';
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS joining_date DATE NOT NULL DEFAULT (CURRENT_DATE);
ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ONLINE';

UPDATE users
SET role = UPPER(role)
WHERE role IS NOT NULL;

UPDATE users
SET role = 'CUSTOMER'
WHERE role IS NULL OR role = '' OR role = 'USER';

UPDATE partner_profiles
SET status = UPPER(status)
WHERE status IS NOT NULL;

UPDATE partner_profiles
SET status = 'ONLINE'
WHERE status IS NULL OR status = '';

-- Admin bootstrap sanity check:
-- after deploying the backend with APP_BOOTSTRAP_ADMIN* vars, confirm at least one admin exists.
SELECT id, full_name, email, phone, role
FROM users
WHERE role = 'ADMIN';
