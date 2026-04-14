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
    logout,
    togglePartnerStatus,
    fetchCurrentPartnerProfile,
    fetchPartnerBookings,
    updatePartnerBookingStatus
  } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!partner) return;

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCurrentPartnerProfile(), fetchPartnerBookings()]);
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
  }, [partner, fetchCurrentPartnerProfile, fetchPartnerBookings]);

  const filteredBookings = bookings.filter((booking) => {
    const belongsToPartner = booking.partnerEmployeeId === partner?.id || booking.partnerId === partner?.userId;
    if (!belongsToPartner) return false;
    if (activeTab === "All") return true;
    return booking.status === activeTab;
  });

  return (
    <div style={pageStyle}>
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
