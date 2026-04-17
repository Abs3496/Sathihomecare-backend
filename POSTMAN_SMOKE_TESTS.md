# Postman Smoke Tests

Use this right after backend deploy.

## 1. Variables

Create these Postman variables:

```text
baseUrl = https://YOUR_RENDER_BACKEND_DOMAIN/api
customerEmail = testcustomer@sathihomecare.in
customerPhone = 9876543210
customerPassword = Test@12345
adminLogin = YOUR_REAL_ADMIN_EMAIL_OR_PHONE
adminPassword = YOUR_REAL_ADMIN_PASSWORD
partnerEmployeeId = EMP001
partnerPassword = partner_password_here
```

## 2. Health Check

### Request

`GET {{baseUrl}}/health`

### Expect

- status `200`

## 3. Customer Register

### Request

`POST {{baseUrl}}/auth/register/customer`

```json
{
  "fullName": "Startup Test Customer",
  "email": "{{customerEmail}}",
  "phone": "{{customerPhone}}",
  "password": "{{customerPassword}}"
}
```

### Expect

- status `201`
- response contains `token`
- response `role` = `CUSTOMER`

## 4. Customer Login

### Request

`POST {{baseUrl}}/auth/login/customer`

```json
{
  "emailOrPhone": "{{customerEmail}}",
  "password": "{{customerPassword}}"
}
```

### Expect

- status `200`
- response contains `token`

## 5. Admin Login

### Request

`POST {{baseUrl}}/auth/login/admin`

```json
{
  "emailOrPhone": "{{adminLogin}}",
  "password": "{{adminPassword}}"
}
```

### Expect

- status `200`
- response contains `token`
- response `role` = `ADMIN`

If this fails:

- check Render env vars `APP_BOOTSTRAP_ADMIN1_EMAIL` and `APP_BOOTSTRAP_ADMIN1_PASSWORD`
- run [backend/sql/mysql/prod_diagnostics.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_diagnostics.sql:1)

## 6. Partner Login

### Request

`POST {{baseUrl}}/auth/login/partner`

```json
{
  "employeeId": "{{partnerEmployeeId}}",
  "password": "{{partnerPassword}}"
}
```

### Expect

- status `200`
- response contains `token`
- response contains `employeeId`

If this fails with `Partner not found`:

- confirm a row exists in `partner_profiles`
- confirm `employee_id` matches exactly
- confirm the partner was created from admin dashboard or SQL-backed data

## 7. Generic Login

### Admin via generic route

`POST {{baseUrl}}/auth/login`

```json
{
  "emailOrPhone": "{{adminLogin}}",
  "password": "{{adminPassword}}"
}
```

### Partner via generic route

`POST {{baseUrl}}/auth/login`

```json
{
  "employeeId": "{{partnerEmployeeId}}",
  "password": "{{partnerPassword}}"
}
```

### Expect

- status `200` for both

## 8. Services Check

### Request

`GET {{baseUrl}}/services`

### Expect

- status `200`
- non-empty array

## 9. Failure Tests

### Invalid admin password

`POST {{baseUrl}}/auth/login/admin`

```json
{
  "emailOrPhone": "{{adminLogin}}",
  "password": "wrong-password"
}
```

Expect:

- status `400`
- message `Invalid credentials`

### Invalid role on register

`POST {{baseUrl}}/auth/register`

```json
{
  "fullName": "Bad Role User",
  "email": "badrole@sathihomecare.in",
  "phone": "9123456780",
  "password": "Test@12345",
  "role": "super-admin"
}
```

Expect:

- status `400`
- message `Invalid role`

## 10. Browser Smoke Test After Postman

After Postman passes:

1. Open frontend
2. Register customer
3. Login as admin from admin mode
4. Login as partner from partner mode
5. Confirm no `404`, `500`, or CORS error in browser devtools
