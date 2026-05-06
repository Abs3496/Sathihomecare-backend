import { publicServices, site } from "../../data/publicSiteData";

export const metadata = {
  title: "Home Nursing, Elder Care, Therapy and Counselling Services",
  description: "Browse Sathi Homecare nursing, elder care, patient care, ayurvedic therapy and counselling services with crawlable pricing and service details.",
  alternates: { canonical: "/services" }
};

export default function ServicesPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sathi Homecare services",
    itemListElement: publicServices.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: { "@type": "LocalBusiness", name: site.name }
      }
    }))
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Service catalogue</p>
          <h1>Home healthcare services</h1>
          <p>Compare support options for nursing, elder care, patient recovery, therapy and counselling.</p>
        </div>
      </div>
      <div className="grid">
        {publicServices.map((service) => (
          <article className="card" key={service.slug}>
            <strong>{service.type}</strong>
            <h2>{service.name}</h2>
            <p>{service.description}</p>
            <span className="price">{service.price}</span>
          </article>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    </section>
  );
}
