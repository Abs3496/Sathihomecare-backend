# Sathi Backend

Phase 1 Java backend scaffold for the Sathi Homecare project.

## Included in Phase 1

- Spring Boot + Spring Security + JWT setup
- role-based auth for `CUSTOMER`, `PARTNER`, and `ADMIN`
- customer registration and login
- partner login by employee ID
- admin login
- public services catalog APIs
- customer booking creation and booking history APIs
- partner assigned-booking APIs
- admin booking and partner overview APIs
- starter entities for booking, patient details, address, and payment

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
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `JPA_DDL_AUTO`
- `JPA_SHOW_SQL`

Swagger should then be available at:

- `http://localhost:8080/swagger-ui/index.html`

## Seeded Accounts

- Admin:
  - email: `Abhishekadmin@sathihomecare.in`
  - password: `adminabhishek@123`

Partner accounts should be created by admin.
Customer accounts should be created through the registration API or frontend signup flow.

## Public APIs

- `GET /api/health`
- `POST /api/auth/register/customer`
- `POST /api/auth/login/customer`
- `POST /api/auth/login/partner`
- `POST /api/auth/login/admin`
- `GET /api/services`
- `GET /api/services/{id}`
- `GET /api/services/category/{category}`

## Customer APIs

Requires a customer JWT token.

- `GET /api/customer/me`
- `PUT /api/customer/me`
- `POST /api/customer/bookings`
- `GET /api/customer/bookings`
- `DELETE /api/customer/bookings/{bookingId}`

Booking payload:

```json
{
  "serviceId": 1,
  "bookingDateTime": "2026-04-20T10:30:00",
  "addressLineOne": "NH 344",
  "addressLineTwo": "Near Main Gate",
  "city": "Roorkee",
  "state": "Uttarakhand",
  "pincode": "247661",
  "landmark": "Bhagwanpur Chowk",
  "patientName": "Ramesh",
  "patientPhone": "9876543210",
  "patientAge": 67,
  "patientAddress": "NH 344, Roorkee",
  "patientIssues": "Post surgery recovery and medicine support"
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
- `GET /api/admin/partners`

## What Comes Next in Phase 2

- payment order creation and verification APIs
- partner creation and management APIs
- customer profile APIs
- richer admin analytics
- frontend integration with real JWT and booking persistence
