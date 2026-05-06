import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingCard from "../../components/BookingCard";
import PartnerCard from "../../components/PartnerCard";
import { useAuth } from "../../hooks/useAuth";

const tabs = ["All", "Assigned", "Accepted", "Completed", "Rejected"];

export default function PartnerDashboard() {
  const {
    partner,
    bookings,
    attendance,
    logout,
    togglePartnerStatus,
    fetchCurrentPartnerProfile,
    fetchPartnerBookings,
    updatePartnerBookingStatus,
    fetchPartnerAttendance,
    markPartnerAttendance
  } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    if (!partner) return;

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCurrentPartnerProfile(), fetchPartnerBookings(), fetchPartnerAttendance()]);
        if (!active) return;
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load partner dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [partner, fetchCurrentPartnerProfile, fetchPartnerBookings, fetchPartnerAttendance]);

  const filteredBookings = bookings.filter((booking) => {
    const belongsToPartner = booking.partnerEmployeeId === partner?.id || booking.partnerId === partner?.userId;
    if (!belongsToPartner) return false;
    if (activeTab === "All") return true;
    return booking.status === activeTab;
  });

  const todayAttendance = attendance.find((item) => item.attendanceDate === new Date().toISOString().slice(0, 10));

  const handleAttendance = async (action) => {
    setAttendanceMessage("");
    setAttendanceError("");
    try {
      const response = await markPartnerAttendance(action);
      setAttendanceMessage(action === "in"
        ? `Check-in recorded at ${new Date(response.checkInAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.`
        : `Check-out recorded at ${new Date(response.checkOutAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}.`);
    } catch (err) {
      setAttendanceError(err?.message || "Unable to update attendance right now.");
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <div style={topBar}>
          <div>
            <p style={eyebrow}>Partner Dashboard</p>
            <h1 style={title}>{partner?.name}</h1>
            <p style={subtitle}>Employee ID: {partner?.id}</p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={togglePartnerStatus} style={statusButton}>
              {partner?.status === "Online" ? "Go Offline" : "Go Online"}
            </button>
            <Link to="/" style={ghostLink}>Home</Link>
            <button type="button" onClick={logout} style={dangerButton}>Logout</button>
          </div>
        </div>

        <PartnerCard partner={partner} />

        <section style={attendanceCard}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <p style={eyebrow}>Daily Attendance</p>
              <h2 style={{ margin: "8px 0 0", fontSize: "28px", color: "#102542" }}>Mark today&apos;s attendance</h2>
              <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
                Lightweight attendance stores only one daily check-in and one checkout, so storage usage low rehta hai.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button type="button" onClick={() => handleAttendance("in")} style={statusButton} disabled={Boolean(todayAttendance?.checkedIn)}>
                {todayAttendance?.checkedIn ? "Checked In" : "Check In"}
              </button>
              <button type="button" onClick={() => handleAttendance("out")} style={ghostActionButton} disabled={!todayAttendance?.checkedIn || Boolean(todayAttendance?.checkedOut)}>
                {todayAttendance?.checkedOut ? "Checked Out" : "Check Out"}
              </button>
            </div>
          </div>
          {attendanceMessage ? <p style={{ margin: "14px 0 0", color: "#0f8f86", fontWeight: 700 }}>{attendanceMessage}</p> : null}
          {attendanceError ? <p style={{ margin: "14px 0 0", color: "#ef4444", fontWeight: 700 }}>{attendanceError}</p> : null}
          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {attendance.length ? attendance.slice(0, 5).map((item) => (
              <div key={item.attendanceId} style={attendanceRow}>
                <span>{formatAttendanceDate(item.attendanceDate)}</span>
                <span>{item.checkInAt ? formatAttendanceTime(item.checkInAt) : "--"}</span>
                <span>{item.checkOutAt ? formatAttendanceTime(item.checkOutAt) : "Pending"}</span>
              </div>
            )) : <div style={emptyState}>Attendance records will appear here after check-in.</div>}
          </div>
        </section>

        <section style={{ marginTop: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "30px", color: "#102542" }}>Assigned Bookings</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    background: activeTab === tab ? "#1cb5ac" : "#ffffff",
                    color: activeTab === tab ? "#ffffff" : "#102542",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.06)"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? <p style={{ margin: "18px 0 0", color: "#5b6878" }}>Loading assigned bookings...</p> : null}
          {error ? <p style={{ margin: "18px 0 0", color: "#ef4444" }}>{error}</p> : null}

          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  role="partner"
                  onAccept={(id) => updatePartnerBookingStatus(id, "accept")}
                  onReject={(id) => updatePartnerBookingStatus(id, "reject")}
                  onComplete={(id) => updatePartnerBookingStatus(id, "complete")}
                />
              ))
            ) : (
              <div style={emptyState}>No bookings found for this filter.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatAttendanceDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatAttendanceTime(value) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  padding: "32px 24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const shellStyle = {
  maxWidth: "1200px",
  margin: "0 auto"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  flexWrap: "wrap",
  alignItems: "flex-start",
  marginBottom: "24px"
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

const subtitle = {
  margin: "10px 0 0",
  color: "#5b6878"
};

const statusButton = {
  border: "none",
  borderRadius: "12px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
};

const ghostLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "#102542",
  color: "#ffffff",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 700
};

const dangerButton = {
  border: "none",
  borderRadius: "12px",
  background: "#ef4444",
  color: "#ffffff",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
};

const emptyState = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "22px",
  color: "#5b6878",
  boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)"
};

const attendanceCard = {
  marginTop: "24px",
  background: "#ffffff",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const ghostActionButton = {
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#102542",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
};

const attendanceRow = {
  background: "#f8fbff",
  borderRadius: "16px",
  padding: "14px 16px",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "12px",
  color: "#475569"
};
