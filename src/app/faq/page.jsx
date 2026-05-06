import { faqItems } from "../../data/publicSiteData";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about Sathi Homecare services, verified caregivers, booking, payments, cancellations and long-term care.",
  alternates: { canonical: "/faq" }
};

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Support</p>
          <h1>Frequently asked questions</h1>
          <p>Quick answers for families before booking home healthcare support.</p>
        </div>
      </div>
      <div className="faq-list">
        {faqItems.map(([question, answer]) => (
          <details className="card" key={question} open>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}
