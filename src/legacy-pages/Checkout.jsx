import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageSeo } from "../hooks/usePageSeo";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const timeSlots = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM"
];

const initialForm = {
  patientName: "",
  patientAge: "",
  gender: "",
  mobileNumber: "",
  email: "",
  address: "",
  serviceId: "",
  serviceType: "",
  preferredDate: "",
  preferredTimeSlot: "",
  additionalNotes: ""
};

export default function Checkout() {
  usePageSeo({
    title: "Book Service | Sathi Homecare",
    description: "Book Sathi Homecare services quickly without customer login or online payment."
  });

  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { services = [], fetchAdminServices, createPublicBooking } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminServices?.().catch(() => {});
  }, [fetchAdminServices]);

  useEffect(() => {
    if (!cart.length || form.serviceId) return;
    const service = cart[0];
    setForm((prev) => ({
      ...prev,
      serviceId: String(service.id),
      serviceType: service.name
    }));
  }, [cart, form.serviceId]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find((item) => String(item.id) === String(serviceId));
    setForm((prev) => ({
      ...prev,
      serviceId,
      serviceType: service?.name || ""
    }));
  };

  const validate = () => {
    const required = [
      form.patientName,
      form.patientAge,
      form.gender,
      form.mobileNumber,
      form.email,
      form.address,
      form.serviceId,
      form.preferredDate,
      form.preferredTimeSlot
    ];
    if (required.some((value) => !String(value || "").trim())) return "Please complete all required booking fields.";
    if (!/^\d{10}$/.test(form.mobileNumber.trim())) return "Mobile number must be 10 digits.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (Number(form.patientAge) < 1) return "Please enter a valid patient age.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const booking = await createPublicBooking(form);
      clearCart();
      navigate("/thank-you", {
        state: {
          booking,
          mobileNumber: form.mobileNumber
        }
      });
    } catch (err) {
      setError(err?.message || "Unable to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <div style={headerStyle}>
          <p style={eyebrow}>Book in under 2 minutes</p>
          <h1 style={titleStyle}>Book trusted care at home</h1>
          <p style={subtitleStyle}>Share patient details, choose a preferred date and time slot, and our team will confirm staff availability.</p>
        </div>

        <form onSubmit={handleSubmit} style={bookingGrid} noValidate>
          <section style={panelStyle}>
            <h2 style={panelTitle}>Patient Details</h2>
            <div style={formGrid}>
              <Field label="Patient Name" value={form.patientName} onChange={(value) => updateField("patientName", value)} required />
              <Field label="Age" type="number" value={form.patientAge} onChange={(value) => updateField("patientAge", value)} required />
              <label style={labelStyle}>
                Gender
                <select value={form.gender} onChange={(event) => updateField("gender", event.target.value)} style={inputStyle} required>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <Field label="Mobile Number" value={form.mobileNumber} onChange={(value) => updateField("mobileNumber", value)} required />
              <Field label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
            </div>
            <label style={labelStyle}>
              Address
              <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} style={textareaStyle} required />
            </label>
          </section>

          <aside style={panelStyle}>
            <h2 style={panelTitle}>Service & Schedule</h2>
            <label style={labelStyle}>
              Service Type
              <select value={form.serviceId} onChange={(event) => handleServiceChange(event.target.value)} style={inputStyle} required>
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </label>
            <div style={formGrid}>
              <Field label="Preferred Date" type="date" value={form.preferredDate} onChange={(value) => updateField("preferredDate", value)} required />
              <label style={labelStyle}>
                Preferred Time Slot
                <select value={form.preferredTimeSlot} onChange={(event) => updateField("preferredTimeSlot", event.target.value)} style={inputStyle} required>
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </label>
            </div>
            <label style={labelStyle}>
              Additional Notes
              <textarea
                value={form.additionalNotes}
                onChange={(event) => updateField("additionalNotes", event.target.value)}
                placeholder="Care needs, medical concerns, building access, or special instructions."
                style={textareaStyle}
              />
            </label>

            {error ? <p style={errorStyle}>{error}</p> : null}
            <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting booking..." : "Submit Booking"}
            </button>
            <Link to="/track-booking" style={trackLink}>Already booked? Track booking</Link>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label style={labelStyle}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} required={required} />
    </label>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  color: "#102542",
  padding: "32px 24px 60px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};
const shellStyle = { maxWidth: "1180px", margin: "0 auto" };
const headerStyle = { marginBottom: "24px", maxWidth: "820px" };
const eyebrow = { margin: 0, color: "#1cb5ac", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800, fontSize: "13px" };
const titleStyle = { margin: "10px 0 0", fontSize: "clamp(2rem, 4vw, 3.4rem)", color: "#071b3a" };
const subtitleStyle = { margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7 };
const bookingGrid = { display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: "22px", alignItems: "start" };
const panelStyle = { background: "#ffffff", borderRadius: "24px", padding: "24px", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)", border: "1px solid #e6eef6" };
const panelTitle = { margin: 0, color: "#071b3a", fontSize: "26px" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "18px" };
const labelStyle = { display: "grid", gap: "8px", color: "#334155", fontWeight: 700, marginTop: "18px" };
const inputStyle = { minHeight: "50px", borderRadius: "12px", border: "1px solid #d7e3ef", padding: "0 14px", fontSize: "15px", background: "#ffffff" };
const textareaStyle = { minHeight: "124px", borderRadius: "12px", border: "1px solid #d7e3ef", padding: "14px", fontSize: "15px", resize: "vertical", background: "#ffffff" };
const buttonStyle = { marginTop: "22px", width: "100%", border: "none", borderRadius: "14px", background: "#0f766e", color: "#ffffff", padding: "16px 18px", fontWeight: 900, fontSize: "16px", cursor: "pointer" };
const errorStyle = { margin: "18px 0 0", color: "#d7263d", fontWeight: 800, lineHeight: 1.6 };
const trackLink = { display: "inline-flex", marginTop: "16px", color: "#102542", fontWeight: 800, textDecoration: "none" };
