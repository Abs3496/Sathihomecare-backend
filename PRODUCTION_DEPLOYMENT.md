# Sathi Homecare Production Deployment Guide

This guide is the final handoff for deploying the Sathi Homecare website and verifying it before launch.

## 1. Production Inputs Required

Before deployment, keep these ready:

- frontend domain
- backend domain
- production database credentials
- live Razorpay Key ID
- live Razorpay Key Secret
- final JWT secret
- support email and phone

## 2. Frontend Environment

Create a production `.env` file using [.env.production.example](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/.env.production.example:1).

Required values:

- `VITE_API_BASE_URL=https://your-backend-domain/api`
- `VITE_RAZORPAY_KEY_ID=your_live_key_id`

## 3. Backend Environment

Create backend environment values using [backend/.env.example](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/.env.example:1).

Required values:

- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## 4. Deployment Order

Recommended order:

1. Deploy production database
2. Deploy backend with production env values
3. Verify backend health endpoint
4. Deploy frontend with production env values
5. Verify frontend can reach backend correctly
6. Run final smoke tests

## 5. Backend Checks After Deploy

Confirm:

- backend starts without errors
- database connection succeeds
- admin login works
- `/api/health` or actuator health is reachable
- CORS allows your frontend domain
- payment order creation works with live/test keys as intended

## 6. Frontend Checks After Deploy

Confirm:

- homepage loads correctly
- services page loads correctly
- customer registration works
- login works
- checkout opens Razorpay popup
- legal pages open from footer
- admin dashboard loads
- customer dashboard loads

## 7. Final Pre-Launch Test Flow

Run this exact end-to-end test:

1. Register a fresh customer account
2. Login as customer
3. Add one service to cart
4. Open checkout
5. Fill patient and address details
6. accept legal checkbox
7. place booking
8. complete payment successfully
9. confirm booking appears in customer dashboard as paid
10. login as admin
11. confirm booking appears in admin dashboard
12. assign employee to booking
13. login as employee
14. confirm assigned booking appears in employee dashboard

## 8. Failure Case Testing

Test these before launch:

- invalid login
- payment popup close without payment
- payment failure from gateway
- retry payment from customer dashboard
- booking remains unassignable until payment success
- customer cancellation flow

## 9. Launch Blocking Issues

Do not launch until these are confirmed:

- real Razorpay keys are configured
- backend is on production database
- JWT secret is changed from placeholder
- admin login works in production
- customer booking + payment flow works
- admin assignment works
- legal pages are visible
- support contact details are correct

## 10. Post-Launch Recommendations

After launch, strongly consider:

- image optimization for faster loading
- log monitoring
- database backups
- uptime monitoring
- analytics tracking

## 11. Short Go-Live Checklist

- [ ] backend deployed
- [ ] frontend deployed
- [ ] env values configured
- [ ] DB connected
- [ ] Razorpay live keys added
- [ ] legal pages verified
- [ ] customer booking tested
- [ ] payment tested
- [ ] admin assignment tested
- [ ] employee access tested
- [ ] support info checked
