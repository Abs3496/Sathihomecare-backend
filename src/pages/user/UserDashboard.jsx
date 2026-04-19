import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { usePageSeo } from "../../hooks/usePageSeo";
import BookingCard from "../../components/BookingCard";
import { useAuth } from "../../hooks/useAuth";
import { launchRazorpayPayment } from "../../utils/razorpay";

export default function UserDashboard() {
  usePageSeo({
    title: "My Dashboard | Sathi Homecare",
    description: "Manage your Sathi Homecare profile, track bookings and retry secure payments from your customer dashboard."
  });

  const { customer, bookings, cancelBooking, logout, updateCustomerProfile, createPaymentOrder, verifyPayment, markPaymentFailed, fetchCustomerProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [payingBookingId, setPayingBookingId] = useState(null);
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

  useEffect(() => {
    fetchCustomerProfile().catch(() => {});
  }, [fetchCustomerProfile]);

  const myBookings = bookings.filter(
    (booking) =>
      booking.customerEmail === customer?.email || booking.customer === customer?.name
  );

  const bookingStats = useMemo(() => ({
    total: myBookings.length,
    active: myBookings.filter((booking) => ["Assigned", "Accepted", "In Progress"].includes(booking.status)).length,
    completed: myBookings.filter((booking) => booking.status === "Completed").length,
    pendingPayment: myBookings.filter((booking) => booking.paymentStatus === "PENDING").length
  }), [myBookings]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      await updateCustomerProfile(profileForm);
      setProfileMessage("Profile updated successfully.");
      setProfileError("");
    } catch (err) {
      setProfileError(err?.message || "Unable to update profile right now.");
      setProfileMessage("");
    }
  };

  const handlePayNow = async (booking) => {
    setPayingBookingId(booking.id);
    setPaymentError("");
    setPaymentMessage("Preparing secure payment gateway...");

    try {
      const order = await createPaymentOrder(booking.id);
      await launchRazorpayPayment({
        razorpayKeyId,
        booking,
        order,
        prefill: {
          name: customer?.name || booking.customer || "",
          email: customer?.email || booking.customerEmail || "",
          contact: customer?.phone || booking.patientPhone || ""
        },
        verifyPayment,
        markPaymentFailed,
        onStepChange: (step) => {
          if (step === "verifying") {
            setPaymentMessage(`Verifying payment for booking #${booking.id}...`);
          }
        }
      });
      setPaymentMessage(`Payment completed successfully for booking #${booking.id}.`);
    } catch (err) {
      setPaymentError(err?.message || "Unable to complete payment right now.");
      setPaymentMessage("");
    } finally {
      setPayingBookingId(null);
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <div style={topBar}>
          <div>
            <p style={eyebrow}>User Dashboard</p>
            <h1 style={title}>Welcome back, {customer?.name}</h1>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/" style={ghostLink}>Go Home</Link>
            <button type="button" onClick={logout} style={dangerButton}>Logout</button>
          </div>
        </div>

        <section style={profileCard} className="profile-card-row compact-mobile-card">
          <div style={avatar}>{customer?.name?.charAt(0) || "U"}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "28px", color: "#102542" }}>{customer?.name}</h2>
            <p style={{ margin: "8px 0 0", color: "#5b6878" }}>{customer?.email}</p>
            <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{customer?.phone}</p>
          </div>
        </section>

        <section style={statsGrid}>
          <DashboardMetric label="Total Bookings" value={bookingStats.total} />
          <DashboardMetric label="Active Care Requests" value={bookingStats.active} />
          <DashboardMetric label="Completed Services" value={bookingStats.completed} />
          <DashboardMetric label="Pending Payments" value={bookingStats.pendingPayment} />
        </section>

        <section style={profileEditor}>
          <div>
            <h2 style={{ margin: 0, fontSize: "28px", color: "#102542" }}>Profile Settings</h2>
            <p style={{ margin: "10px 0 0", color: "#667085" }}>Keep your customer details current for smooth booking communication.</p>
          </div>

          <form onSubmit={handleProfileSave} style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
            <label style={labelStyle}>
              Full Name
              <input
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Email
              <input
                value={profileForm.email}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Phone
              <input
                value={profileForm.phone}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                style={inputStyle}
              />
            </label>
            {profileMessage ? <p style={{ margin: 0, color: "#0f8f86", fontWeight: 700 }}>{profileMessage}</p> : null}
            {profileError ? <p style={{ margin: 0, color: "#ef4444", fontWeight: 700 }}>{profileError}</p> : null}
            <button type="submit" style={saveButton}>Save Profile</button>
          </form>
        </section>

        <section style={profileEditor}>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#102542" }}>Account Safety</h2>
          <p style={{ margin: "10px 0 0", color: "#667085", lineHeight: 1.7 }}>
            Your dashboard works only with authenticated access. Keep your mobile number and email updated so booking and payment verification stays secure.
          </p>
          <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
            {[
              "JWT-based authenticated booking access is active.",
              "Cancelled and paid bookings are refreshed directly from secure backend APIs.",
              "Use only your registered number/email while contacting support."
            ].map((tip) => (
              <div key={tip} style={safetyTip}>{tip}</div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "26px" }}>
          <h2 style={{ margin: 0, fontSize: "30px", color: "#102542" }}>My Bookings</h2>
          <p style={{ margin: "10px 0 0", color: "#667085" }}>Track your bookings, status, and cancel if needed.</p>
          {paymentMessage ? <p style={paymentSuccess}>{paymentMessage}</p> : null}
          {paymentError ? <p style={paymentFailure}>{paymentError}</p> : null}

          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            {myBookings.length ? (
              myBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  role="customer"
                  onCancel={cancelBooking}
                  onPayNow={handlePayNow}
                  paymentLoading={payingBookingId === booking.id}
                />
              ))
            ) : (
              <div style={emptyState}>
                <h3 style={{ margin: 0, fontSize: "24px" }}>No bookings yet</h3>
                <p style={{ margin: "10px 0 0", color: "#667085" }}>Place a service request to start tracking bookings here.</p>
                <Link to="/services" style={primaryLink}>Explore Services</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardMetric({ label, value }) {
  return (
    <div style={metricCard}>
      <p style={{ margin: 0, color: "#667085", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <h3 style={{ margin: "10px 0 0", color: "#102542", fontSize: "32px" }}>{value}</h3>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  padding: "32px 24px"
};

const shellStyle = {
  maxWidth: "1180px",
  margin: "0 auto"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  flexWrap: "wrap",
  alignItems: "flex-start"
};

const eyebrow = {
  margin: 0,
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  margin: "10px 0 0",
  fontSize: "clamp(2rem, 4vw, 3rem)",
  color: "#102542"
};

const profileCard = {
  marginTop: "22px",
  background: "#ffffff",
  borderRadius: "26px",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const avatar = {
  width: "74px",
  height: "74px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #1cb5ac, #102542)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "28px"
};

const ghostLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "#102542",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: 700
};

const dangerButton = {
  border: "none",
  background: "#ef4444",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer"
};

const emptyState = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const profileEditor = {
  marginTop: "22px",
  background: "#ffffff",
  borderRadius: "26px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const primaryLink = {
  marginTop: "18px",
  display: "inline-flex",
  textDecoration: "none",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "12px",
  fontWeight: 700
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 600
};

const inputStyle = {
  minHeight: "48px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "0 14px",
  fontSize: "15px"
};

const saveButton = {
  border: "none",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "14px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  cursor: "pointer"
};

const statsGrid = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px"
};

const metricCard = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "20px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const safetyTip = {
  background: "#f8fbff",
  borderRadius: "16px",
  padding: "14px 16px",
  color: "#475569",
  border: "1px solid #d7e3ef"
};

const paymentSuccess = {
  margin: "14px 0 0",
  color: "#0f8f86",
  fontWeight: 700
};

const paymentFailure = {
  margin: "14px 0 0",
  color: "#ef4444",
  fontWeight: 700
};
