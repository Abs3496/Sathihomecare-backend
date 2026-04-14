# Manual Test Checklist

## Prerequisites

- Frontend is running.
- Backend is running.
- Backend env is configured.
- For payment popup validation, Razorpay sandbox keys are configured in frontend and backend env files.

## Test Accounts

- Admin: `admin@sathi.com / admin123`
- Partner 1: `EMP123 / partner123`
- Partner 2: `EMP456 / caretaker456`
- Customer seeded: `abhishek@sathi.com / customer123`
- Customer fresh flow: create a new account from `/login`

## Public Website Tests

1. Open `/`
   Expected:
   - Hero page loads
   - video/banner area renders
   - service cards are visible
   - login and dashboard entry points are visible

2. Search by location and service
   Expected:
   - location suggestions appear after typing
   - selecting a suggestion updates the field
   - search navigates to `/services` with query params

3. Open `/services`
   Expected:
   - category chips work
   - search filters results
   - service cards show name, description, and price

4. Add and remove cart items
   Expected:
   - add to cart increases quantity
   - plus/minus controls update quantity
   - cart state is reflected in UI

## Customer Flow Tests

1. Open `/login`
   Expected:
   - customer login and register modes both work
   - partner/admin link is visible

2. Register a new customer
   Expected:
   - valid registration navigates to `/user/dashboard`
   - duplicate email/phone shows backend validation message

3. Login as existing customer
   Expected:
   - successful login redirects to `/user/dashboard`
   - invalid credentials show an error

4. Access protected customer route without login
   Steps:
   - open `/user/dashboard` in logged-out state
   Expected:
   - redirected to `/login`

5. Update customer profile on dashboard
   Expected:
   - full name, email, phone update successfully
   - success message appears

6. Browse services and add one service to cart
   Expected:
   - selected service appears in cart

7. Open `/checkout` while logged in
   Expected:
   - form is visible
   - customer name and phone auto-fill when available

8. Submit checkout with missing fields
   Expected:
   - validation error is shown

9. Submit checkout with more than one service in cart
   Expected:
   - checkout blocks with single-service limitation message

10. Submit checkout with one service
    Expected:
    - booking is created
    - payment order is created
    - if Razorpay keys are configured, popup checkout opens
    - if keys are missing, a clear payment-key error is shown

11. Customer dashboard booking history
    Expected:
    - newly created booking appears
    - booking status is visible
    - cancel button is visible unless booking is completed/cancelled

12. Cancel a booking as customer
    Expected:
    - booking status updates to `Cancelled`

## Partner / Employee Flow Tests

1. Open `/partner/login`
   Expected:
   - employee login form renders
   - demo credentials are shown

2. Login with partner credentials
   Expected:
   - successful login redirects to `/partner/dashboard`
   - invalid credentials show error

3. Access protected partner route without login
   Steps:
   - open `/partner/dashboard` in logged-out state
   Expected:
   - redirected to `/partner/login`

4. Check partner profile section
   Expected:
   - partner name and employee ID are visible

5. Toggle partner online/offline state
   Expected:
   - button updates partner state in UI

6. Booking list filtering
   Expected:
   - tabs `All`, `Assigned`, `Accepted`, `Completed`, `Rejected` filter correctly

7. Accept assigned booking
   Precondition:
   - admin has assigned a booking to this partner
   Expected:
   - `Accept` and `Reject` buttons are shown for `Assigned`
   - clicking `Accept` changes status to `Accepted`

8. Reject assigned booking
   Expected:
   - clicking `Reject` changes status to `Rejected`

9. Complete accepted booking
   Expected:
   - `Mark as Completed` appears only for `Accepted`
   - clicking it changes status to `Completed`

## Admin Flow Tests

1. Open `/admin`
   Expected:
   - admin login form renders

2. Login with admin credentials
   Expected:
   - successful login opens admin dashboard
   - stats cards load
   - bookings, partners, and services load

3. Access protected admin route without login
   Steps:
   - open `/admin/dashboard` in logged-out state
   Expected:
   - redirected to `/admin`

4. Add partner
   Expected:
   - all required fields are validated
   - successful creation adds partner to team list

5. Edit partner
   Expected:
   - clicking edit pre-fills partner form
   - update saves changes

6. Delete partner
   Expected:
   - partner is removed from list

7. Add service
   Expected:
   - service appears in service catalogue list

8. Edit service
   Expected:
   - clicking edit pre-fills service form
   - update saves changes

9. Delete service
   Expected:
   - service disappears from active list

10. Assign booking to partner
    Precondition:
    - customer has a booking with successful payment or pending assignment
    Expected:
    - selecting a partner assigns the booking
    - booking becomes visible to that partner

11. Update booking status manually
    Expected:
    - admin can change status using dropdown

## Payment Flow Tests

1. Create booking and start payment
   Expected:
   - `/api/payments/create-order` succeeds for the logged-in customer

2. Retry create-order for same booking
   Expected:
   - existing payment record is reused safely
   - no duplicate payment row issue occurs

3. Verify payment with correct order ID and signature
   Expected:
   - payment becomes `SUCCESS`
   - booking status moves to `PENDING_ASSIGNMENT` or `ASSIGNED`

4. Verify payment with mismatched order ID
   Expected:
   - backend rejects the request

5. Verify an already verified payment again
   Expected:
   - backend rejects duplicate verification

## Known Limitations During Testing

- Checkout supports only one service per booking.
- `Cash on Visit` is visible in UI but intentionally not implemented in backend.
- Full Razorpay popup validation requires real sandbox credentials.
- Local Vite build on this machine previously hit a Windows `spawn EPERM`; CI should be the source of truth for build validation.
