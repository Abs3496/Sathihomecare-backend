# Sathi Backend

Phase 1 Java backend scaffold for the Sathi Homecare project.

## Included in Phase 1

- Spring Boot + Spring Security + JWT setup
- role-based auth for `PARTNER` and `ADMIN`
- partner login by employee ID
- admin login
- public services catalog APIs
- public guest booking creation, tracking, and receipt APIs
- partner assigned-booking APIs
- admin booking and partner overview APIs
- PDF receipt generation, customer/business email hooks, and WhatsApp notification hooks

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- MySQL
- JWT
- Lombok
- Springdoc OpenAPI

## Setup

1. Install Java 21
2. Install Maven
3. Configure environment variables using `backend/.env.example`
4. Create a MySQL database named `sathi_homecare`
5. Run the application:

```bash
mvn spring-boot:run
```

Automated tests use the `test` profile with H2 in-memory, so local testing does not require a running MySQL database.

Important environment variables:

- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `APP_SUPPORT_WHATSAPP`
- `APP_WHATSAPP_BUSINESS_NUMBER`
- `APP_WHATSAPP_API_URL`
- `APP_WHATSAPP_API_TOKEN`
- `APP_EMAIL_FROM`
- `APP_EMAIL_ADMIN_TO`
- `RESEND_API_KEY`
- `JPA_DDL_AUTO`
- `JPA_SHOW_SQL`

Swagger should then be available at:

- `http://localhost:8080/swagger-ui/index.html`

## Seeded Accounts

- Admin:
  - email: `Abhishekadmin@sathihomecare.in`
  - password: `adminabhishek@123`

Partner accounts should be created by admin.
Customers do not create website accounts.

## Public APIs

- `GET /api/health`
- `POST /api/auth/login/partner`
- `POST /api/auth/login/admin`
- `GET /api/services`
- `GET /api/services/{id}`
- `GET /api/services/category/{category}`
- `POST /api/bookings`
- `GET /api/bookings/track?bookingId=SHC-2026-00001&mobileNumber=9876543210`
- `GET /api/bookings/receipt?bookingId=SHC-2026-00001&mobileNumber=9876543210`

Booking payload:

```json
{
  "serviceId": 1,
  "patientName": "Ramesh",
  "patientAge": 67,
  "gender": "Male",
  "mobileNumber": "9876543210",
  "email": "customer@example.com",
  "address": "NH 344, Roorkee",
  "preferredDate": "2026-04-20",
  "preferredTimeSlot": "10:00 AM - 12:00 PM",
  "additionalNotes": "Post surgery recovery and medicine support"
}
```

## Partner APIs

Requires a partner JWT token.

- `GET /api/partner/me`
- `GET /api/partner/bookings`
- `PATCH /api/partner/bookings/{bookingId}/accept`
- `PATCH /api/partner/bookings/{bookingId}/reject`
- `PATCH /api/partner/bookings/{bookingId}/complete`

## Admin APIs

Requires an admin JWT token.

- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/{bookingId}/assign/{partnerUserId}`
- `PATCH /api/admin/bookings/{bookingId}/status/{status}`
- `GET /api/admin/bookings/{bookingId}/receipt`
- `GET /api/admin/partners`
