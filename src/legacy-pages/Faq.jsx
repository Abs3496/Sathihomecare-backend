import { Link } from "react-router-dom";
import { faqData } from "../data/faqData";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Faq() {
  usePageSeo({
    title: "Frequently Asked Questions | Sathi Homecare",
    description: "Answers to common questions about Sathi Homecare services, caregivers, booking, payments, counseling, cancellations, and long-term care.",
    canonicalPath: "/faq"
  });

  return (
    <div style={pageStyle} className="page-padding">
      <section style={heroStyle} className="compact-mobile-card">
        <p style={eyebrow}>Support Center</p>
        <h1 style={title}>SathiHomecare Frequently Asked Questions</h1>
        <p style={subtitle}>
          Clear answers for families who want to understand services, bookings, safety, payments, counselling, and long-term care options before they book.
        </p>
        <div style={heroActions}>
          <Link to="/" style={primaryLink}>Back to Home</Link>
          <Link to="/services" style={secondaryLink}>Explore Services</Link>
        </div>
      </section>

      <section style={faqShell}>
        {faqData.map((item, index) => (
          <article key={item.question} style={faqCard} className="compact-mobile-card">
            <div style={faqIndex}>{String(index + 1).padStart(2, "0")}</div>
            <div>
              <h2 style={questionStyle}>{item.question}</h2>
              <p style={answerStyle}>{item.answer}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef9f4 100%)",
  color: "#102542",
  padding: "32px 24px 60px",
  fontFamily: "'Poppins', 'Segoe UI', sans-serif"
};

const heroStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  borderRadius: "30px",
  padding: "32px",
  background: "linear-gradient(135deg, #082f49, #0f766e)",
  color: "#ffffff",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.18)"
};

const eyebrow = {
  margin: 0,
  color: "#99f6e4",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  margin: "12px 0 0",
  fontSize: "clamp(2rem, 4vw, 3.4rem)",
  lineHeight: 1.15
};

const subtitle = {
  margin: "14px 0 0",
  maxWidth: "820px",
  color: "rgba(255,255,255,0.86)",
  lineHeight: 1.8
};

const heroActions = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "22px"
};

const faqShell = {
  maxWidth: "1180px",
  margin: "26px auto 0",
  display: "grid",
  gap: "18px"
};

const faqCard = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e8eef5",
  display: "grid",
  gridTemplateColumns: "72px minmax(0, 1fr)",
  gap: "18px",
  alignItems: "start"
};

const faqIndex = {
  width: "72px",
  height: "72px",
  borderRadius: "20px",
  background: "#e7fbf6",
  color: "#0f8f86",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "24px"
};

const questionStyle = {
  margin: 0,
  fontSize: "24px",
  lineHeight: 1.35,
  color: "#102542"
};

const answerStyle = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.8
};

const primaryLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "#ffffff",
  color: "#102542",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};

const secondaryLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};
