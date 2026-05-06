import Link from "next/link";

export const metadata = {
  title: "Login",
  description: "Login to Sathi Homecare customer, partner or admin dashboards.",
  alternates: { canonical: "/login" }
};

export default function LoginPage() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Login</h1>
          <p>Dashboard access is being moved to the new production app architecture. Public pages are now server-rendered for SEO.</p>
        </div>
      </div>
      <div className="grid">
        <article className="card">
          <strong>Customer</strong>
          <h2>Book and manage care</h2>
          <p>Customer login will continue to use the protected API and JWT session flow.</p>
          <Link className="cta" href="/services">Browse services</Link>
        </article>
        <article className="card">
          <strong>Partner</strong>
          <h2>Care professional access</h2>
          <p>Partner dashboards remain protected and require authenticated API access.</p>
          <Link className="cta" href="/partner/login">Partner login</Link>
        </article>
      </div>
    </section>
  );
}
