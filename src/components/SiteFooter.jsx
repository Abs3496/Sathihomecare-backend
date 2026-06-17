import { Link } from "react-router-dom";
import { homepageAssets } from "../assets";

const companyLinks = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Blogs", "/blogs"],
  ["FAQs", "/faq"],
  ["Founders", "/founders"],
  ["Book Service", "/checkout"],
  ["Track Booking", "/track-booking"]
];

const contactLinks = [
  ["Help & Support", "/faq"],
  ["Partner Login", "/partner/login"],
  ["Admin Login", "/admin"]
];

const legalLinks = [
  ["Terms & Conditions", "/terms-conditions"],
  ["Privacy Policy", "/privacy-policy"],
  ["Refund Policy", "/refund-cancellation-policy"]
];

const availableCities = ["Lucknow", "Ranchi", "Patna", "Delhi", "Kolkata", "Mumbai"];

const socialLinks = [
  ["in", "https://www.linkedin.com/"],
  ["ig", "https://www.instagram.com/"],
  ["f", "https://www.facebook.com/"],
  ["x", "https://x.com/"]
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand-block">
          <Link to="/" className="footer-brand-row" aria-label="Sathi Homecare home">
            <span className="footer-logo-shell">
              <img src={homepageAssets.logo} alt="" />
            </span>
            <span>Sathi Homecare</span>
          </Link>
          <p className="footer-copy">(c) 2026 Sathi Homecare Limited</p>
        </div>

        <FooterColumn title="Company" links={companyLinks} />

        <div className="footer-stack">
          <FooterColumn title="Contact us" links={contactLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="footer-column">
          <h3>Available in:</h3>
          <div className="footer-link-list">
            {availableCities.map((city) => (
              <span key={city}>{city}</span>
            ))}
            <button type="button" className="footer-city-button">25+ cities</button>
          </div>
        </div>

        <div className="footer-stack">
          <FooterColumn
            title="Life at Sathi"
            links={[
              ["Explore Services", "/services"],
              ["Sathi Blogs", "/blogs"],
              ["Care Stories", "/faq"]
            ]}
          />
          <div className="footer-column">
            <h3>Social Links</h3>
            <div className="footer-social-row">
              {socialLinks.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Sathi Homecare ${label}`}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      <div className="footer-link-list">
        {links.map(([label, to]) => (
          <Link key={label} to={to}>{label}</Link>
        ))}
      </div>
    </div>
  );
}
