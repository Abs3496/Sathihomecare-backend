import Link from "next/link";
import { blogSummaries } from "../../data/publicSiteData";

export const metadata = {
  title: "Homecare Blogs",
  description: "Helpful Sathi Homecare guides for patient care, elder care, recovery routines, therapy and family support.",
  alternates: { canonical: "/blogs" }
};

export default function BlogsPage() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Care guides</p>
          <h1>Latest blogs for families</h1>
          <p>Practical guidance for safe bookings, caregiving routines and better care decisions.</p>
        </div>
      </div>
      <div className="grid">
        {blogSummaries.map((blog) => (
          <article className="card" key={blog.slug}>
            <strong>{blog.category}</strong>
            <h2>{blog.title}</h2>
            <p>{blog.excerpt}</p>
            <span className="price">{blog.date}</span>
            <div className="card-actions">
              <Link className="cta" href="/blogs">Read guide</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
