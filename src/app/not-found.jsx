import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="app-notice">
        <strong>Page not found.</strong>
        <p>The page may have moved or the link may be outdated.</p>
        <Link className="cta" href="/">Go home</Link>
      </div>
    </section>
  );
}
