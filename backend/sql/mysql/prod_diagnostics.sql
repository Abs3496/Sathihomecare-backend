SELECT id, full_name, email, phone, role, active, created_at, updated_at
FROM users
ORDER BY id DESC;

SELECT id, user_id, employee_id, professional_role, status, joining_date
FROM partner_profiles
ORDER BY id DESC;

SELECT id, full_name, email, phone, role
FROM users
WHERE role = 'ADMIN';

SELECT u.id, u.full_name, u.email, u.phone, u.role, pp.employee_id
FROM users u
LEFT JOIN partner_profiles pp ON pp.user_id = u.id
WHERE u.role IN ('PARTNER', 'ADMIN')
ORDER BY u.id DESC;
