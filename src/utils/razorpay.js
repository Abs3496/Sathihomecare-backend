export async function ensureRazorpayLoaded() {
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[data-razorpay-sdk="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpaySdk = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function launchRazorpayPayment({
  razorpayKeyId,
  booking,
  order,
  prefill,
  verifyPayment,
  markPaymentFailed,
  onStepChange
}) {
  const hasRazorpayKey = razorpayKeyId && !razorpayKeyId.includes("your_key");
  if (!hasRazorpayKey) {
    throw new Error("Razorpay frontend key is missing. Add VITE_RAZORPAY_KEY_ID to enable the checkout popup.");
  }

  const loaded = await ensureRazorpayLoaded();
  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay checkout. Check your internet connection and try again.");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: razorpayKeyId,
      amount: Math.round(Number(order.amount || 0) * 100),
      currency: order.currency || "INR",
      name: "Sathi Homecare",
      description: booking.service || "Homecare service booking",
      order_id: order.gatewayOrderId,
      prefill,
      notes: {
        bookingId: String(booking.id),
        patientName: booking.patientName || ""
      },
      theme: {
        color: "#1cb5ac"
      },
      handler: async (response) => {
        try {
          onStepChange?.("verifying");
          await verifyPayment({
            bookingId: booking.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await markPaymentFailed?.({
              bookingId: booking.id,
              razorpayOrderId: order.gatewayOrderId,
              failureReason: "Payment popup closed before completing payment."
            });
          } catch {
            // Keep checkout retryable even if the failure status endpoint is temporarily unreachable.
          }
          reject(new Error("Payment popup closed before completing payment. You can retry payment for the same booking."));
        }
      }
    });

    razorpay.on("payment.failed", async (response) => {
      const message = response?.error?.description || "Payment failed. Please try again.";
      try {
        await markPaymentFailed?.({
          bookingId: booking.id,
          razorpayOrderId: order.gatewayOrderId,
          razorpayPaymentId: response?.error?.metadata?.payment_id || "",
          failureReason: message
        });
      } catch {
        // Keep checkout retryable even if the failure status endpoint is temporarily unreachable.
      }
      reject(new Error(message));
    });

    razorpay.open();
  });
}
