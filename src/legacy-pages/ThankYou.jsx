import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePageSeo } from "../hooks/usePageSeo";

export default function ThankYou() {
  usePageSeo({
    title: "Booking Received | Sathi Homecare",
    description: "Sathi Homecare booking receipt and confirmation details."
  });

  const location = useLocation();
  const { getReceiptUrl } = useAuth();
  const booking = location.state?.booking;
  const mobileNumber = location.state?.mobileNumber || booking?.customerMobile || "";

  if (!booking) {
    return (
      <div style={pageStyle} className="page-padding">
        <section style={cardStyle}>
          <h1 style={titleStyle}>Booking details unavailable</h1>
          <p style={textStyle}>Use Track Booking to look up your request with Booking ID and mobile number.</p>
          <Link to="/track-booking" style={buttonStyle}>Track Booking</Link>
        </section>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="page-padding">
      <section style={cardStyle}>
        <p style={eyebrow}>Thank you</p>
        <h1 style={titleStyle}>Your booking has been submitted</h1>
        <p style={textStyle}>We emailed your PDF receipt and sent booking notifications. Your request is currently pending.</p>
        <div style={detailsStyle}>
          <span><strong>Booking ID:</strong> {booking.bookingCode}</span>
          <span><strong>Service:</strong> {booking.service}</span>
          <span><strong>Date:</strong> {booking.preferredDate}</span>
          <span><strong>Time Slot:</strong> {booking.preferredTimeSlot}</span>
        </div>
        <div style={actionsStyle}>
          <a href={getReceiptUrl({ bookingId: booking.bookingCode, mobileNumber })} style={buttonStyle}>Download Receipt</a>
          <Link to="/track-booking" style={secondaryButton}>Track Booking</Link>
        </div>
      </section>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#f6f8fb", padding: "42px 24px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const cardStyle = { maxWidth: "760px", margin: "40px auto", background: "#ffffff", borderRadius: "24px", padding: "30px", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" };
const eyebrow = { margin: 0, color: "#1cb5ac", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, fontSize: "13px" };
const titleStyle = { margin: "10px 0 0", color: "#071b3a", fontSize: "clamp(2rem, 4vw, 3rem)" };
const textStyle = { margin: "14px 0 0", color: "#5b6878", lineHeight: 1.7 };
const detailsStyle = { display: "grid", gap: "10px", marginTop: "22px", padding: "18px", borderRadius: "16px", background: "#f8fbff", color: "#334155" };
const actionsStyle = { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" };
const buttonStyle = { display: "inline-flex", textDecoration: "none", border: "none", borderRadius: "14px", background: "#d7263d", color: "#ffffff", padding: "14px 18px", fontWeight: 900 };
const secondaryButton = { ...buttonStyle, background: "#102542" };
