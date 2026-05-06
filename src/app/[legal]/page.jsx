import { notFound } from "next/navigation";
import { legalPages } from "../../data/publicSiteData";

export function generateStaticParams() {
  return Object.keys(legalPages).map((legal) => ({ legal }));
}

export function generateMetadata({ params }) {
  const page = legalPages[params.legal];
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${params.legal}` }
  };
}

export default function LegalPage({ params }) {
  const page = legalPages[params.legal];
  if (!page) notFound();

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Legal</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
      </div>
      <div className="faq-list">
        {page.sections.map(([title, body]) => (
          <section className="legal-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </section>
  );
}
