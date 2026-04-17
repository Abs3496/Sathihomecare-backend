import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { loginCustomer, registerCustomer } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "login" && (!form.email || !form.password)) {
      setError("Please enter both email and password.");
      return;
    }

    if (mode === "register" && (!form.fullName || !form.email || !form.phone || !form.password)) {
      setError("Please fill all registration details.");
      return;
    }

    try {
      if (mode === "login") {
        await loginCustomer(form);
      } else {
        await registerCustomer(form);
      }
      navigate("/user/dashboard");
    } catch (err) {
      setError(err?.message || (mode === "login"
        ? "Unable to login. Please check your credentials."
        : "Unable to create account right now."));
    }
  };

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle} className="login-shell">
        <div style={leftPane}>
          <p style={eyebrow}>Choose your role</p>
          <h1 style={title}>Login As</h1>
          <p style={subtitle}>
            Customers can log in to manage bookings. Partners can log in using employee credentials provided by admin.
          </p>

          <div style={partnerCard}>
            <h3 style={{ margin: 0, fontSize: "24px" }}>Partner / Admin Access</h3>
            <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
              Employee ID and Password based secure login for partners. Admin can also login from the same section using separate credentials.
            </p>
            <Link to="/partner/login" style={partnerLink}>
              Go to Partner Login
            </Link>
          </div>
        </div>

        <div style={rightPane}>
          <Link to="/" style={backLink}>Back to Home</Link>
          <p style={{ ...eyebrow, color: "#1cb5ac", marginTop: "18px" }}>Customer Access</p>
          <h2 style={{ margin: "10px 0 0", fontSize: "34px", color: "#102542" }}>
            {mode === "login" ? "User Login" : "Create Customer Account"}
          </h2>
          <p style={{ margin: "12px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
            {mode === "login"
              ? "Login with your customer account or switch to registration to create a new one."
              : "Create a real customer account and continue directly into the dashboard."}
          </p>

          <div style={toggleWrap}>
            <button type="button" onClick={() => setMode("login")} style={{ ...toggleButton, ...(mode === "login" ? activeToggle : {}) }}>
              Login
            </button>
            <button type="button" onClick={() => setMode("register")} style={{ ...toggleButton, ...(mode === "register" ? activeToggle : {}) }}>
              Register
            </button>
          </div>

          <form id="customerLoginForm" onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", marginTop: "22px" }}>
            {mode === "register" ? (
              <>
                <Field label="Full Name" id="fullName" name="fullName" value={form.fullName} onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))} />
                <Field label="Phone Number" id="phone" name="phone" type="tel" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
              </>
            ) : null}
            <Field label="Email Address" id="email" name="email" type="email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
            <Field label="Password" id="password" name="password" type="password" value={form.password} onChange={(value) => setForm((prev) => ({ ...prev, password: value }))} />
            {error ? <p style={{ margin: 0, color: "#ef4444" }}>{error}</p> : null}
            <button type="submit" style={buttonStyle}>
              {mode === "login" ? "Continue to User Dashboard" : "Create Account and Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, name, type = "text", value, onChange }) {
  return (
    <label htmlFor={id} style={{ display: "grid", gap: "8px", color: "#334155", fontWeight: 600 }}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ minHeight: "50px", borderRadius: "14px", border: "1px solid #d7e3ef", padding: "0 14px", fontSize: "15px" }}
        required
      />
    </label>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a2440, #0d594f)",
  padding: "32px 24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const shellStyle = {
  maxWidth: "1160px",
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: "32px",
  overflow: "hidden",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.22)",
  display: "grid",
  gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1.1fr)"
};

const leftPane = {
  background: "linear-gradient(160deg, #102542, #0d594f)",
  color: "#ffffff",
  padding: "34px"
};

const rightPane = {
  padding: "34px"
};

const eyebrow = {
  margin: 0,
  color: "#8de3d4",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "13px",
  fontWeight: 700
};

const title = {
  margin: "12px 0 0",
  fontSize: "clamp(2.2rem, 4vw, 3.8rem)"
};

const subtitle = {
  margin: "14px 0 0",
  color: "rgba(255,255,255,0.82)",
  lineHeight: 1.8
};

const partnerCard = {
  marginTop: "28px",
  background: "rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.1)"
};

const partnerLink = {
  marginTop: "18px",
  display: "inline-flex",
  textDecoration: "none",
  background: "#ffffff",
  color: "#102542",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};

const backLink = {
  display: "inline-flex",
  textDecoration: "none",
  color: "#102542",
  fontWeight: 700
};

const buttonStyle = {
  border: "none",
  borderRadius: "14px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer"
};

const toggleWrap = {
  marginTop: "22px",
  display: "inline-flex",
  gap: "8px",
  background: "#edf4f7",
  padding: "6px",
  borderRadius: "14px"
};

const toggleButton = {
  border: "none",
  background: "transparent",
  color: "#355164",
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: "pointer"
};

const activeToggle = {
  background: "#ffffff",
  color: "#102542",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
};
