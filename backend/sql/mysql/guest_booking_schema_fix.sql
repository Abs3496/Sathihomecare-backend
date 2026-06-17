-- Allows direct customer bookings without a customer login row.
-- Run this on production MySQL if /api/bookings returns 500 while creating guest bookings.

ALTER TABLE bookings MODIFY customer_id BIGINT NULL;

-- Some older deployments had payment_status constrained to payment-only values.
-- The app now stores NOT_REQUIRED for no-payment bookings.
ALTER TABLE bookings MODIFY payment_status VARCHAR(32) NOT NULL;
