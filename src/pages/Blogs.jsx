import { Link } from "react-router-dom";
import { blogsData } from "../data/blogsData";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Blogs() {
  usePageSeo({
    title: "Blogs | Sathi Homecare",
    description: "Read Sathi Homecare blogs on patient care, elder care, ayurvedic therapy, counselling, and safe homecare booking tips.",
    keywords: "Sathi Homecare blogs, patient care blog, elderly care tips, home nursing articles, therapy guide",
    canonicalPath: "/blogs"
  });

  return (
    <div style={pageStyle} className="page-padding">
      <section style={heroStyle}>
        <p style={eyebrow}>Sathi Blogs</p>
        <h1 style={title}>Homecare insights for families and caregivers</h1>
        <p style={subtitle}>
          Articles, checklists, and practical guidance around safe bookings, patient support, elder care, therapy, and counselling.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" }}>
          <Link to="/" style={primaryLink}>Back to Home</Link>
          <Link to="/services" style={secondaryLink}>Explore Services</Link>
        </div>
      </section>

      <section style={gridStyle}>
        {blogsData.map((blog) => (
          <article key={blog.id} style={cardStyle}>
            <div style={categoryChip}>{blog.category}</div>
            <h2 style={cardTitle}>{blog.title}</h2>
            <p style={cardExcerpt}>{blog.excerpt}</p>
            <div style={metaRow}>
              <span>{blog.date}</span>
              <span>{blog.readTime}</span>
            </div>
            <div style={inlineNote}>
              Full blog detail page later add ho sakti hai; abhi yahan se saare blog summaries accessible hain.
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  color: "#102542",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  padding: "32px 24px 60px"
};

const heroStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  borderRadius: "30px",
  padding: "32px",
  background: "linear-gradient(135deg, #0a2440, #0d594f)",
  color: "#ffffff",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.18)"
};

const eyebrow = {
  margin: 0,
  color: "#8de3d4",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 700,
  fontSize: "13px"
};

const title = {
  margin: "12px 0 0",
  fontSize: "clamp(2rem, 4vw, 3.5rem)",
  lineHeight: 1.15
};

const subtitle = {
  margin: "14px 0 0",
  maxWidth: "760px",
  color: "rgba(255,255,255,0.84)",
  lineHeight: 1.8
};

const gridStyle = {
  maxWidth: "1180px",
  margin: "26px auto 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px"
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
  border: "1px solid #eef2f7"
};

const categoryChip = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#e7fbf6",
  color: "#0f8f86",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase"
};

const cardTitle = {
  margin: "16px 0 0",
  fontSize: "24px",
  color: "#102542",
  lineHeight: 1.35
};

const cardExcerpt = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.75
};

const metaRow = {
  marginTop: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  color: "#64748b",
  fontSize: "14px"
};

const inlineNote = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "16px",
  background: "#f8fbff",
  color: "#475569",
  fontSize: "14px",
  lineHeight: 1.6
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
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.16)",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: 700
};
