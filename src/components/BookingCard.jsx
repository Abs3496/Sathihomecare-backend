export default function BookingCard({
  booking,
  role = "partner",
  onAccept,
  onReject,
  onComplete,
  onCancel,
  onPayNow,
  paymentLoading = false
}) {
  return (
    <article
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        padding: "20px",
        boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)",
        border: "1px solid #e6eef6"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, color: "#102542", fontSize: "22px" }}>{booking.service}</h3>
          <p style={{ margin: "8px 0 0", color: "#5b6878" }}>{booking.customer}</p>
        </div>
        <span
          style={{
            alignSelf: "flex-start",
            background:
              booking.status === "Completed"
                ? "#dcfce7"
                : booking.status === "Accepted"
                  ? "#dbeafe"
                  : booking.status === "Cancelled" || booking.status === "Rejected"
                    ? "#fee2e2"
                    : "#ecfffb",
            color:
              booking.status === "Completed"
                ? "#166534"
                : booking.status === "Accepted"
                  ? "#1d4ed8"
                  : booking.status === "Cancelled" || booking.status === "Rejected"
                    ? "#b91c1c"
                    : "#0f8f86",
            padding: "8px 12px",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "13px"
          }}
        >
          {booking.status}
        </span>
      </div>

      <div style={{ display: "grid", gap: "8px", marginTop: "16px", color: "#475569" }}>
        <span>Address: {booking.address}</span>
        <span>Date & Time: {booking.date}</span>
        {booking.totalAmount ? <span>Amount: Rs. {booking.totalAmount}</span> : null}
        {booking.paymentStatus ? <span>Payment: {formatLabel(booking.paymentStatus)}</span> : null}
        {booking.patientName ? <span>Patient: {booking.patientName}</span> : null}
        {booking.patientIssues ? <span>Issue: {booking.patientIssues}</span> : null}
      </div>

      {role === "customer" && booking.paymentStatus === "PENDING" ? (
        <p style={{ margin: "14px 0 0", color: "#b45309", fontWeight: 700, lineHeight: 1.6 }}>
          Payment is still pending for this booking. Complete payment from checkout before admin can assign an employee.
        </p>
      ) : null}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
        {role === "partner" && booking.status === "Assigned" ? (
          <>
            <button type="button" onClick={() => onAccept?.(booking.id)} style={primaryButton}>Accept</button>
            <button type="button" onClick={() => onReject?.(booking.id)} style={dangerButton}>Reject</button>
          </>
        ) : null}

        {role === "partner" && booking.status === "Accepted" ? (
          <button type="button" onClick={() => onComplete?.(booking.id)} style={primaryButton}>
            Mark as Completed
          </button>
        ) : null}

        {role === "customer" && !["Completed", "Cancelled"].includes(booking.status) ? (
          <button type="button" onClick={() => onCancel?.(booking.id)} style={dangerButton}>
            Cancel Booking
          </button>
        ) : null}

        {role === "customer" && booking.paymentStatus === "PENDING" ? (
          <button
            type="button"
            onClick={() => onPayNow?.(booking)}
            disabled={paymentLoading}
            style={{
              ...primaryButton,
              opacity: paymentLoading ? 0.7 : 1,
              cursor: paymentLoading ? "not-allowed" : "pointer"
            }}
          >
            {paymentLoading ? "Processing..." : "Pay Now"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatLabel(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const primaryButton = {
  border: "none",
  borderRadius: "12px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
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
