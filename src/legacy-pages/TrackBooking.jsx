import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePageSeo } from "../hooks/usePageSeo";

export default function TrackBooking() {
  usePageSeo({
    title: "Track Booking | Sathi Homecare",
    description: "Track Sathi Homecare booking status by booking ID and mobile number."
  });

  const { trackPublicBooking, getReceiptUrl } = useAuth();
  const [form, setForm] = useState({ bookingId: "", mobileNumber: "" });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      setBooking(await trackPublicBooking(form));
    } catch (err) {
      setError(err?.message || "Booking not found. Please check the Booking ID and mobile number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <Link to="/checkout" style={backLink}>Book a service</Link>
        <section style={cardStyle}>
          <p style={eyebrow}>Track Booking</p>
          <h1 style={titleStyle}>Check booking status</h1>
          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={labelStyle}>
              Booking ID
              <input value={form.bookingId} onChange={(event) => setForm((prev) => ({ ...prev, bookingId: event.target.value }))} placeholder="SHC-2026-00001" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Mobile Number
              <input value={form.mobileNumber} onChange={(event) => setForm((prev) => ({ ...prev, mobileNumber: event.target.value }))} placeholder="10 digit mobile" style={inputStyle} />
            </label>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Checking..." : "Track Booking"}</button>
          </form>
          {error ? <p style={errorStyle}>{error}</p> : null}
          {booking ? (
            <div style={resultStyle}>
              <h2 style={{ margin: 0, color: "#071b3a" }}>{booking.bookingCode}</h2>
              <span style={statusStyle}>{booking.status}</span>
              <p style={textStyle}>{booking.service}</p>
              <p style={textStyle}>{booking.preferredDate} | {booking.preferredTimeSlot}</p>
              <a href={getReceiptUrl({ bookingId: booking.bookingCode, mobileNumber: form.mobileNumber })} style={secondaryButton}>Download Receipt</a>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#f6f8fb", padding: "42px 24px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const shellStyle = { maxWidth: "720px", margin: "0 auto" };
const backLink = { display: "inline-flex", color: "#102542", fontWeight: 800, textDecoration: "none", marginBottom: "16px" };
const cardStyle = { background: "#ffffff", borderRadius: "24px", padding: "28px", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" };
const eyebrow = { margin: 0, color: "#1cb5ac", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, fontSize: "13px" };
const titleStyle = { margin: "10px 0 0", color: "#071b3a", fontSize: "clamp(2rem, 4vw, 3rem)" };
const formStyle = { display: "grid", gap: "16px", marginTop: "22px" };
const labelStyle = { display: "grid", gap: "8px", color: "#334155", fontWeight: 700 };
const inputStyle = { minHeight: "50px", borderRadius: "12px", border: "1px solid #d7e3ef", padding: "0 14px", fontSize: "15px", background: "#ffffff" };
const buttonStyle = { border: "none", borderRadius: "14px", background: "#d7263d", color: "#ffffff", padding: "15px 18px", fontWeight: 900, cursor: "pointer" };
const secondaryButton = { ...buttonStyle, display: "inline-flex", textDecoration: "none", marginTop: "12px" };
const errorStyle = { margin: "18px 0 0", color: "#d7263d", fontWeight: 800 };
const resultStyle = { marginTop: "22px", padding: "18px", borderRadius: "16px", background: "#f8fbff", display: "grid", gap: "8px" };
const statusStyle = { width: "fit-content", borderRadius: "999px", padding: "7px 12px", background: "#ecfffb", color: "#0f766e", fontWeight: 900 };
const textStyle = { margin: 0, color: "#5b6878", lineHeight: 1.6 };
