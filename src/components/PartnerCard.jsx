export default function PartnerCard({ partner }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "26px",
        padding: "24px",
        boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e6eef6"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }} className="partner-card-header">
        <div
          style={{
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
          }}
        >
          {partner.name.charAt(0)}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#102542" }}>{partner.name}</h2>
          <p style={{ margin: "8px 0 0", color: "#1cb5ac", fontWeight: 700 }}>Employee ID: {partner.id}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginTop: "22px" }}>
        <Info label="Phone" value={partner.phone} />
        <Info label="Role" value={partner.role} />
        <Info label="Address" value={partner.address} />
        <Info label="Joining Year" value={partner.joiningDate} />
        <Info label="Status" value={partner.status} highlight />
      </div>
    </div>
  );
}

function Info({ label, value, highlight = false }) {
  return (
    <div style={{ background: highlight ? "#ecfffb" : "#f8fbff", borderRadius: "18px", padding: "14px" }}>
      <div style={{ color: "#667085", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ marginTop: "8px", color: highlight ? "#0f8f86" : "#102542", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
