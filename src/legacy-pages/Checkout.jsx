import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSeo } from "../hooks/usePageSeo";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { launchRazorpayPayment } from "../utils/razorpay";

const paymentMethods = [
  { id: "upi", label: "UPI Payment", subtitle: "Pay using any UPI app" },
  { id: "card", label: "Credit / Debit Card", subtitle: "Visa, Mastercard, RuPay supported" },
  { id: "netbanking", label: "Net Banking", subtitle: "Pay directly from your bank" }
];

export default function Checkout() {
  usePageSeo({
    title: "Checkout | Sathi Homecare",
    description: "Complete your Sathi Homecare booking with customer details, secure Razorpay checkout and policy consent."
  });

  const { cart, cartTotal, clearCart, addToCart, removeFromCart } = useCart();
  const { customer, addBooking, createPaymentOrder, verifyPayment, markPaymentFailed } = useAuth();
  const user = customer;
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState("idle");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [patientForm, setPatientForm] = useState({
    customerName: "",
    customerPhone: "",
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientAddress: "",
    patientIssues: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });
  const [lastBooking, setLastBooking] = useState(null);
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState(null);

  const tax = useMemo(() => Math.round(cartTotal * 0.05), [cartTotal]);
  const convenience = cart.length ? 99 : 0;
  const grandTotal = cartTotal + tax + convenience;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  const hasRazorpayKey = razorpayKeyId && !razorpayKeyId.includes("your_key");

  useEffect(() => {
    if (!user) return;

    setPatientForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user.name || "",
      customerPhone: prev.customerPhone || user.phone || ""
    }));
  }, [user]);

  const handleInputChange = (field, value) => {
    setPatientForm((prev) => ({ ...prev, [field]: value }));
  };

  const launchRazorpayCheckout = async ({ booking, order }) => {
    return launchRazorpayPayment({
      razorpayKeyId,
      booking: {
        ...booking,
        patientName: patientForm.patientName
      },
      order,
      prefill: {
        name: patientForm.customerName || user?.name || "",
        email: user?.email || "",
        contact: patientForm.customerPhone || user?.phone || ""
      },
      verifyPayment,
      markPaymentFailed,
      onStepChange: (step) => {
        setPaymentStep(step);
        if (step === "verifying") {
          setOrderMessage("Verifying payment with secure gateway...");
        }
      }
    });
  };

  const handlePlaceOrder = async () => {
    const requiredFields = [
      patientForm.customerName,
      patientForm.customerPhone,
      patientForm.patientName,
      patientForm.patientPhone,
      patientForm.patientAge,
      patientForm.patientAddress,
      patientForm.patientIssues,
      patientForm.city,
      patientForm.state,
      patientForm.pincode
    ];

    if (!cart.length || requiredFields.some((value) => !value?.trim?.())) {
      setOrderError("Please complete cart and fill all required details.");
      return;
    }

    if (cart.length > 1) {
      setOrderError("Backend currently supports one service per booking. Please keep only one service in the cart for checkout.");
      return;
    }

    if (!user) {
      setOrderError("Please login before placing your booking.");
      return;
    }

    if (!policyAccepted) {
      setOrderError("Please accept the Privacy Policy, Terms & Conditions, and Refund Policy before placing the booking.");
      return;
    }

    if (!/^\d{10}$/.test(patientForm.customerPhone.trim()) || !/^\d{10}$/.test(patientForm.patientPhone.trim())) {
      setOrderError("Customer and patient phone numbers must be 10 digits.");
      return;
    }

    if (!/^\d{6}$/.test(patientForm.pincode.trim())) {
      setOrderError("Pincode must be 6 digits.");
      return;
    }

    const patientAge = Number(patientForm.patientAge);
    if (!Number.isFinite(patientAge) || patientAge <= 0) {
      setOrderError("Please enter a valid patient age.");
      return;
    }

    setOrderLoading(true);
    setOrderError(null);
    setOrderMessage("");
    setPaymentStep("creating-booking");

    try {
      const selectedService = cart[0];
      const booking = pendingPaymentBooking || await addBooking({
        serviceId: selectedService?.id,
        service: selectedService?.name || "",
        addressLineOne: address || patientForm.patientAddress,
        addressLineTwo: patientForm.landmark,
        city: patientForm.city,
        state: patientForm.state,
        pincode: patientForm.pincode,
        landmark: patientForm.landmark,
        patientName: patientForm.patientName,
        patientPhone: patientForm.patientPhone,
        patientAge: patientForm.patientAge,
        patientAddress: patientForm.patientAddress,
        patientIssues: patientForm.patientIssues
      });

      setPendingPaymentBooking(booking);
      setPaymentStep("creating-order");
      setOrderMessage("Booking saved. Opening secure payment gateway...");
      const paymentOrder = await createPaymentOrder(booking.id);
      setPaymentStep("awaiting-payment");
      await launchRazorpayCheckout({ booking, order: paymentOrder });

      setLastBooking({
        id: booking.id,
        service: booking.service,
        amount: paymentOrder.amount
      });
      setPendingPaymentBooking(null);
      setOrderMessage("");
      setPaymentStep("success");
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setPaymentStep("failed");
      setOrderError(err?.message || "Failed to place booking. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastBooking) return;

    const receiptLines = [
      "Sathi Homecare Receipt",
      `Order ID: SHC-${lastBooking.id}`,
      `Booking ID: ${lastBooking.id}`,
      `Service: ${lastBooking.service}`,
      `Amount Paid: Rs. ${lastBooking.amount ?? grandTotal}`,
      `Payment Mode: ${paymentMethods.find((item) => item.id === paymentMethod)?.label}`,
      `Customer: ${patientForm.customerName}`,
      `Patient: ${patientForm.patientName}`,
      `Contact: ${patientForm.customerPhone}`,
      `Address: ${address || patientForm.patientAddress}`,
      `Generated At: ${new Date().toLocaleString("en-IN")}`
    ].join("\n");

    const blob = new Blob([receiptLines], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `sathi-receipt-${lastBooking.id}.txt`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  if (orderPlaced) {
    return (
      <div style={pageStyle} className="page-padding">
        <div style={successCard}>
          <p style={sectionEyebrow}>Order confirmed</p>
          <h1 style={successTitle}>Service request placed successfully</h1>
          <p style={successText}>
            Your booking and payment have been recorded successfully. Our team will verify details and connect with you shortly.
          </p>
          <div style={successDetails}>
            <span>Payment mode: {paymentMethods.find((item) => item.id === paymentMethod)?.label}</span>
            <span>Booking ID: #{lastBooking?.id}</span>
            <span>Service: {lastBooking?.service}</span>
            <span>Amount paid: Rs. {lastBooking?.amount ?? grandTotal}</span>
            <span>Patient: {patientForm.patientName}</span>
            <span>Contact: {patientForm.customerPhone}</span>
          </div>
          <div style={receiptAddon}>
            <div>
              <p style={sectionEyebrow}>Receipt Ready</p>
              <h2 style={{ margin: "8px 0 0", fontSize: "24px", color: "#102542" }}>Order confirmation add-on</h2>
              <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
                Order ID: <strong>SHC-{lastBooking?.id}</strong>
              </p>
            </div>
            <button type="button" onClick={handleDownloadReceipt} style={secondaryLinkButton}>
              Download Receipt
            </button>
          </div>
          <Link to="/" style={primaryLink}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <div style={headerRow}>
          <div>
            <p style={sectionEyebrow}>Checkout</p>
            <h1 style={pageTitle}>Complete your service booking</h1>
            <p style={pageSubtitle}>Fill customer and patient details, choose payment mode, and place your request.</p>
          </div>
          <Link to="/services" style={secondaryLink}>
            Add more services
          </Link>
        </div>

        { !user ? (
          <div style={alertBox}>
            <p style={{ margin: 0, fontWeight: 700, color: "#0f3d75" }}>Please login before booking a service.</p>
            <p style={{ margin: "6px 0 0", color: "#4a5b72" }}>
              You need an account to place bookings and view them later. <Link to="/login">Go to login</Link>.
            </p>
          </div>
        ) : null}

        <div style={checkoutGrid} className="checkout-grid">
          <div style={leftColumn}>
            <section style={cardStyle}>
              <h2 style={cardTitle}>Customer and Patient Details</h2>
              <div style={formGrid}>
                <Field label="Customer Name" value={patientForm.customerName} onChange={(value) => handleInputChange("customerName", value)} />
                <Field label="Customer Phone" value={patientForm.customerPhone} onChange={(value) => handleInputChange("customerPhone", value)} />
                <Field label="Patient Name" value={patientForm.patientName} onChange={(value) => handleInputChange("patientName", value)} />
                <Field label="Patient Phone" value={patientForm.patientPhone} onChange={(value) => handleInputChange("patientPhone", value)} />
                <Field label="Patient Age" value={patientForm.patientAge} onChange={(value) => handleInputChange("patientAge", value)} />
                <Field label="Patient Address" value={patientForm.patientAddress} onChange={(value) => handleInputChange("patientAddress", value)} />
              </div>
              <label style={labelStyle}>
                Patient Issues
                <textarea
                  value={patientForm.patientIssues}
                  onChange={(event) => handleInputChange("patientIssues", event.target.value)}
                  placeholder="Describe patient condition, care needs, pain points, recovery details, or specific instructions."
                  style={textareaStyle}
                />
              </label>
            </section>

            <section style={cardStyle}>
              <h2 style={cardTitle}>Service Address</h2>
              <div style={formGrid}>
                <Field label="Address" value={address} onChange={(value) => setAddress(value)} />
                <Field label="City" value={patientForm.city} onChange={(value) => handleInputChange("city", value)} />
                <Field label="State" value={patientForm.state} onChange={(value) => handleInputChange("state", value)} />
                <Field label="Pincode" value={patientForm.pincode} onChange={(value) => handleInputChange("pincode", value)} />
              </div>
              <Field label="Landmark (optional)" value={patientForm.landmark} onChange={(value) => handleInputChange("landmark", value)} />
            </section>

            <section style={cardStyle}>
              <h2 style={cardTitle}>Payment Options</h2>
              <div style={paymentGrid}>
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                  style={{
                      ...paymentOption,
                      borderColor: paymentMethod === method.id ? "#1cb5ac" : "#d7e3ef",
                      background: paymentMethod === method.id ? "#ecfffb" : "#ffffff",
                      opacity: method.id === "cash" ? 0.6 : 1
                    }}
                  >
                    <span style={paymentLabel}>{method.label}</span>
                    <span style={paymentSubtitle}>{method.subtitle}</span>
                  </button>
                ))}
              </div>

              <div style={gatewayInfoCard} className="gateway-info-card">
                <div>
                  <p style={sectionEyebrow}>Secure Gateway</p>
                  <h3 style={{ margin: "8px 0 0", fontSize: "24px", color: "#102542" }}>Pay securely with Razorpay</h3>
                  <p style={{ margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
                    UPI, cards, and net banking are handled through the Razorpay checkout popup after your booking is created.
                  </p>
                  {!hasRazorpayKey ? (
                    <p style={{ margin: "12px 0 0", color: "#b45309", lineHeight: 1.7 }}>
                      Add `VITE_RAZORPAY_KEY_ID` in the frontend environment before testing live popup checkout.
                    </p>
                  ) : null}
                </div>
                <div style={gatewayBadge} className="gateway-badge">
                  <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.08em", color: "#0f766e" }}>RAZORPAY</span>
                  <span style={{ marginTop: "10px", color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
                    Live payment gateway for customer checkout
                  </span>
                </div>
              </div>

              {pendingPaymentBooking ? (
                <div style={retryCard}>
                  <p style={sectionEyebrow}>Payment Pending</p>
                  <h3 style={{ margin: "8px 0 0", fontSize: "22px", color: "#102542" }}>
                    Retry payment for booking #{pendingPaymentBooking.id}
                  </h3>
                  <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
                    Your booking is already saved. Complete payment on the same booking to avoid duplicate service requests.
                  </p>
                </div>
              ) : null}
            </section>
          </div>

          <aside style={summaryColumn} className="summary-column">
            <section style={cardStyle}>
              <h2 style={cardTitle}>Booking Summary</h2>
              {cart.length ? (
                <div style={{ display: "grid", gap: "14px" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={cartItem}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", color: "#102542" }}>{item.name}</h3>
                        <p style={{ margin: "6px 0 0", color: "#5b6878" }}>Rs. {item.price} each</p>
                      </div>
                      <div style={quantityBox}>
                        <button type="button" onClick={() => removeFromCart(item.id)} style={qtyButton}>-</button>
                        <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                        <button type="button" onClick={() => addToCart(item)} style={qtyButton}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: "#5b6878" }}>No items selected yet.</p>
              )}

              <div style={totalsWrap}>
                <div style={totalRow}><span>Subtotal</span><span>Rs. {cartTotal}</span></div>
                <div style={totalRow}><span>Service tax</span><span>Rs. {tax}</span></div>
                <div style={totalRow}><span>Convenience fee</span><span>Rs. {convenience}</span></div>
                <div style={{ ...totalRow, fontWeight: 800, fontSize: "20px", color: "#102542" }}><span>Total</span><span>Rs. {grandTotal}</span></div>
              </div>

              <label style={consentCard}>
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(event) => setPolicyAccepted(event.target.checked)}
                  style={consentCheckbox}
                />
                <span style={{ color: "#475569", lineHeight: 1.7 }}>
                  I agree to the{" "}
                  <Link to="/privacy-policy" target="_blank" rel="noreferrer" style={consentLink}>Privacy Policy</Link>,
                  {" "}
                  <Link to="/terms-conditions" target="_blank" rel="noreferrer" style={consentLink}>Terms & Conditions</Link>,
                  {" "}and{" "}
                  <Link to="/refund-cancellation-policy" target="_blank" rel="noreferrer" style={consentLink}>Refund & Cancellation Policy</Link>.
                </span>
              </label>

              {orderMessage ? <p style={infoMessage}>{orderMessage}</p> : null}
              {paymentStep !== "idle" && !orderPlaced ? (
                <div style={statusCard}>
                  <span style={statusLabel}>Payment Status</span>
                  <strong style={{ color: "#102542" }}>{getPaymentStepLabel(paymentStep)}</strong>
                  {pendingPaymentBooking && paymentStep === "failed" ? (
                    <span style={{ color: "#5b6878", lineHeight: 1.6 }}>
                      Retry will continue with booking #{pendingPaymentBooking.id}.
                    </span>
                  ) : null}
                </div>
              ) : null}
              {orderError ? <p style={{ marginTop: "18px", color: "#d14343", fontWeight: 700 }}>{orderError}</p> : null}
              <button type="button" onClick={handlePlaceOrder} disabled={orderLoading || !user} style={{
                ...placeOrderButton,
                opacity: orderLoading || !user ? 0.65 : 1,
                cursor: orderLoading || !user ? "not-allowed" : "pointer"
              }}>
                {orderLoading ? "Processing..." : pendingPaymentBooking ? "Retry Payment" : user ? "Place Order" : "Login to place order"}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function getPaymentStepLabel(step) {
  switch (step) {
    case "creating-booking":
      return "Creating booking";
    case "creating-order":
      return "Preparing Razorpay order";
    case "awaiting-payment":
      return "Waiting for payment completion";
    case "verifying":
      return "Verifying payment";
    case "failed":
      return "Payment pending";
    case "success":
      return "Payment successful";
    default:
      return "Ready";
  }
}

function Field({ label, value, onChange }) {
  return (
    <label style={labelStyle}>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: "#102542",
  padding: "32px 24px 60px"
};

const shellStyle = {
  maxWidth: "1340px",
  margin: "0 auto"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: "26px"
};

const sectionEyebrow = {
  margin: 0,
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const pageTitle = {
  margin: "10px 0 0",
  fontSize: "clamp(2rem, 4vw, 3.4rem)"
};

const pageSubtitle = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.7,
  maxWidth: "760px"
};

const alertBox = {
  display: "block",
  width: "100%",
  marginBottom: "24px",
  padding: "18px 22px",
  borderRadius: "20px",
  background: "#eef8ff",
  border: "1px solid #bed9f6",
  color: "#0f3d75"
};

const secondaryLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "#102542",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};

const checkoutGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)",
  gap: "22px",
  alignItems: "start"
};

const leftColumn = {
  display: "grid",
  gap: "22px"
};

const summaryColumn = {
  position: "sticky",
  top: "24px"
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "26px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const cardTitle = {
  margin: 0,
  fontSize: "26px"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginTop: "20px"
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 600,
  marginTop: "18px"
};

const inputStyle = {
  minHeight: "48px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "0 14px",
  fontSize: "15px"
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  borderRadius: "16px",
  border: "1px solid #d7e3ef",
  padding: "14px",
  fontSize: "15px",
  resize: "vertical",
  boxSizing: "border-box"
};

const paymentGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginTop: "20px"
};

const paymentOption = {
  border: "1px solid #d7e3ef",
  borderRadius: "18px",
  padding: "16px",
  background: "#ffffff",
  textAlign: "left",
  cursor: "pointer",
  display: "grid",
  gap: "6px"
};

const paymentLabel = {
  fontWeight: 700,
  color: "#102542"
};

const paymentSubtitle = {
  color: "#5b6878",
  fontSize: "14px",
  lineHeight: 1.6
};

const gatewayInfoCard = {
  marginTop: "24px",
  borderRadius: "22px",
  background: "linear-gradient(145deg, #effcf8, #e0f2fe)",
  padding: "22px",
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  alignItems: "center",
  flexWrap: "wrap"
};

const gatewayBadge = {
  width: "180px",
  minHeight: "180px",
  borderRadius: "18px",
  background: "#ffffff",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  boxShadow: "inset 0 0 0 1px #dbeafe"
};

const retryCard = {
  marginTop: "18px",
  borderRadius: "18px",
  padding: "18px",
  background: "#fff7ed",
  border: "1px solid #fdba74"
};

const cartItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  paddingBottom: "14px",
  borderBottom: "1px solid #eef2f7"
};

const quantityBox = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  background: "#f8fbff",
  borderRadius: "14px",
  padding: "8px 10px"
};

const qtyButton = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "none",
  background: "#dbeafe",
  fontWeight: 700,
  cursor: "pointer"
};

const totalsWrap = {
  marginTop: "20px",
  display: "grid",
  gap: "10px"
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  color: "#5b6878"
};

const statusCard = {
  marginTop: "18px",
  borderRadius: "16px",
  padding: "16px",
  background: "#f8fbff",
  border: "1px solid #d7e3ef",
  display: "grid",
  gap: "6px"
};

const statusLabel = {
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "12px"
};

const infoMessage = {
  marginTop: "18px",
  color: "#0f766e",
  fontWeight: 700
};

const consentCard = {
  marginTop: "18px",
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "16px",
  borderRadius: "16px",
  background: "#f8fbff",
  border: "1px solid #d7e3ef",
  cursor: "pointer"
};

const consentCheckbox = {
  marginTop: "4px",
  width: "18px",
  height: "18px",
  accentColor: "#1cb5ac",
  flexShrink: 0
};

const consentLink = {
  color: "#0f766e",
  fontWeight: 700,
  textDecoration: "none"
};

const placeOrderButton = {
  marginTop: "22px",
  width: "100%",
  border: "none",
  borderRadius: "16px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "16px 18px",
  fontWeight: 800,
  fontSize: "16px",
  cursor: "pointer"
};

const successCard = {
  maxWidth: "760px",
  margin: "60px auto",
  background: "#ffffff",
  borderRadius: "28px",
  padding: "32px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const successTitle = {
  margin: "10px 0 0",
  fontSize: "clamp(2rem, 4vw, 3rem)"
};

const successText = {
  margin: "14px 0 0",
  color: "#5b6878",
  lineHeight: 1.7
};

const successDetails = {
  display: "grid",
  gap: "10px",
  marginTop: "20px",
  color: "#334155"
};

const primaryLink = {
  marginTop: "22px",
  display: "inline-flex",
  textDecoration: "none",
  background: "#102542",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};

const receiptAddon = {
  marginTop: "22px",
  padding: "18px",
  borderRadius: "20px",
  background: "#f8fbff",
  border: "1px solid #d7e3ef",
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "center",
  flexWrap: "wrap"
};

const secondaryLinkButton = {
  border: "none",
  borderRadius: "14px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer"
};
