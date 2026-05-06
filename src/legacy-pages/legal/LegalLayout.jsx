import { Link } from "react-router-dom";

export default function LegalLayout({ eyebrow, title, intro, sections }) {
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <Link to="/" style={backLink}>Back to Home</Link>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={introStyle}>{intro}</p>

        <div style={noticeCard}>
          <strong>Content Placeholder</strong>
          <p style={{ margin: "8px 0 0", lineHeight: 1.7 }}>
            This page is ready for your final company-approved legal text. Share the exact wording anytime and I will replace these sections.
          </p>
        </div>

        <div style={{ display: "grid", gap: "18px", marginTop: "26px" }}>
          {sections.map((section) => (
            <section key={section.title} style={sectionCard}>
              <h2 style={sectionTitle}>{section.title}</h2>
              <p style={sectionBody}>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  padding: "32px 24px 60px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const shellStyle = {
  maxWidth: "920px",
  margin: "0 auto"
};

const backLink = {
  display: "inline-flex",
  textDecoration: "none",
  color: "#102542",
  fontWeight: 700
};

const eyebrowStyle = {
  margin: "20px 0 0",
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const titleStyle = {
  margin: "10px 0 0",
  color: "#102542",
  fontSize: "clamp(2.2rem, 4vw, 3.5rem)"
};

const introStyle = {
  margin: "14px 0 0",
  color: "#5b6878",
  lineHeight: 1.8,
  fontSize: "16px"
};

const noticeCard = {
  marginTop: "22px",
  background: "#eef8ff",
  border: "1px solid #bfdbfe",
  borderRadius: "20px",
  padding: "20px",
  color: "#0f3d75"
};

const sectionCard = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const sectionTitle = {
  margin: 0,
  color: "#102542",
  fontSize: "24px"
};

const sectionBody = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.8
};
