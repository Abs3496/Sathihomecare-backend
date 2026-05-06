import Link from "next/link";
import LocationSearch from "./ui/LocationSearch";
import { publicServices, site, stats } from "../data/publicSiteData";

export default function HomePage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Home healthcare services",
    provider: { "@type": "LocalBusiness", name: site.name },
    areaServed: "India",
    serviceType: publicServices.map((service) => service.name)
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Verified home healthcare support</p>
          <h1>Book trusted nursing, elder care and therapy at home.</h1>
          <p>
            Sathi Homecare helps families arrange patient care, senior support, ayurvedic therapy and counselling with a simple app-like booking experience.
          </p>
          <LocationSearch />
          <div className="hero-actions">
            <Link className="cta" href="/services">Explore Services</Link>
            <Link className="secondary-cta" href="/faq">Get Help</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Care marketplace</p>
            <h2>Services for every care need</h2>
            <p>Clear pricing, practical support categories and booking-ready cards for families comparing care options.</p>
          </div>
        </div>
        <div className="grid">
          {publicServices.slice(0, 6).map((service) => (
            <article className="card" key={service.slug}>
              <strong>{service.type}</strong>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <span className="price">{service.price}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stats-grid">
          {stats.map(([value, label]) => (
            <div className="stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="app-notice">
          <strong>Production upgrade:</strong> This page is now server-rendered with crawlable HTML, structured data, responsive layout rules and production favicon support.
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </>
  );
}
