export const metadata = {
  title: "Know the Founders",
  description: "Meet the Sathi Homecare team building reliable home healthcare support for Indian families.",
  alternates: { canonical: "/founders" }
};

const founders = [
  ["Dharmendra", "Care coordination"],
  ["Pinku", "Service support"]
];

export default function FoundersPage() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Team</p>
          <h1>Know the founders</h1>
          <p>Sathi Homecare is built around dependable care coordination and family-first support.</p>
        </div>
      </div>
      <div className="grid">
        {founders.map(([name, role]) => (
          <article className="card" key={name}>
            <strong>{role}</strong>
            <h2>{name}</h2>
            <p>Focused on making home healthcare easier to discover, book and coordinate for families.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
