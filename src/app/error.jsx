"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }) {
  return (
    <section className="section">
      <div className="app-notice">
        <strong>Something went wrong.</strong>
        <p>{error?.message || "Please retry or return to the home page."}</p>
        <div className="hero-actions">
          <button className="cta" type="button" onClick={() => reset()}>Retry</button>
          <Link className="secondary-cta" href="/">Home</Link>
        </div>
      </div>
    </section>
  );
}
