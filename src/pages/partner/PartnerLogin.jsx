import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const { loginPartner, loginAdmin, partners } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await loginAdmin({ username: employeeId, password });
      navigate("/admin/dashboard");
      return;
    } catch {
      // Fall back to partner login when admin authentication fails.
    }

    try {
      await loginPartner({ employeeId, password });
      navigate("/partner/dashboard");
    } catch (err) {
      setError(err?.message || "Invalid Partner/Admin ID or password.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <Link to="/login" style={backLink}>Back to Login As</Link>
          <p style={eyebrow}>Partner / Admin Access</p>
          <h1 style={title}>Employee Login</h1>
          <p style={subtitle}>Login using Employee ID and Password provided by admin. Admin can also login here using separate admin credentials.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
          <label style={labelStyle}>
            Employee ID
            <input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
          </label>
          {error ? <p style={{ margin: 0, color: "#ef4444" }}>{error}</p> : null}
          <button type="submit" style={buttonStyle}>Login to Dashboard</button>
        </form>

        <div style={hintBox}>
          <strong>Access notes</strong>
          <span>Admin login: Abhishekadmin@sathihomecare.in / adminabhishek@123</span>
          <span>Partner accounts are created by admin from the dashboard.</span>
          {partners.length ? <span>Available partner accounts are managed live by admin.</span> : null}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a2440, #0d594f)",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "30px",
  padding: "30px",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.22)"
};

const backLink = {
  display: "inline-flex",
  textDecoration: "none",
  color: "#102542",
  fontWeight: 700
};

const eyebrow = {
  margin: "20px 0 0",
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  margin: "12px 0 0",
  fontSize: "40px",
  color: "#102542"
};

const subtitle = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.7
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 600
};

const inputStyle = {
  minHeight: "50px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "0 14px",
  fontSize: "15px"
};

const buttonStyle = {
  border: "none",
  borderRadius: "14px",
  background: "#102542",
  color: "#ffffff",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer"
};

const hintBox = {
  marginTop: "24px",
  padding: "16px",
  borderRadius: "18px",
  background: "#f8fbff",
  color: "#475569",
  display: "grid",
  gap: "8px"
};
