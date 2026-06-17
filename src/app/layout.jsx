import Link from "next/link";
import "./globals.css";
import { navLinks, site } from "../data/publicSiteData";

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Home Nursing & Elder Care Services in India | Sathi Homecare",
    template: "%s | Sathi Homecare"
  },
  description: site.description,
  applicationName: site.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Sathi Homecare | Trusted Home Healthcare",
    description: site.description,
    url: site.url,
    images: [{ url: "/favicon.png", width: 800, height: 800, alt: "Sathi Homecare logo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sathi Homecare | Trusted Home Healthcare",
    description: site.description,
    images: ["/favicon.png"]
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e"
};

export default function RootLayout({ children }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalBusiness"],
    name: site.name,
    url: site.url,
    logo: `${site.url}/favicon.png`,
    image: `${site.url}/favicon.png`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dalibagh Colony",
      addressLocality: "Lucknow",
      addressRegion: "Uttar Pradesh",
      postalCode: "226001",
      addressCountry: "IN"
    },
    areaServed: ["Lucknow", "Uttar Pradesh", "India"],
    medicalSpecialty: ["Home Nursing", "Elder Care", "Patient Care", "Physiotherapy"]
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Sathi Homecare home">
            <img src="/favicon-32x32.png" alt="" width="32" height="32" />
            <span>Sathi Homecare</span>
          </Link>
          <nav className="nav-pills" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </header>
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}

function Footer() {
  const columns = [
    ["Company", [["Home", "/"], ["Services", "/services"], ["Blogs", "/blogs"], ["FAQ", "/faq"], ["Founders", "/founders"]]],
    ["Contact", [["Help & Support", "/faq"], ["Track Booking", "/track-booking"], ["Partner Login", "/partner/login"], ["Admin Login", "/admin"]]],
    ["Legal", [["Terms", "/terms-conditions"], ["Privacy", "/privacy-policy"], ["Refunds", "/refund-cancellation-policy"]]],
    ["Available", [["Lucknow", "/services"], ["Ranchi", "/services"], ["Patna", "/services"], ["Delhi", "/services"]]]
  ];

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="footer-brand">
            <img src="/favicon-32x32.png" alt="" width="36" height="36" />
            <span>Sathi Homecare</span>
          </Link>
          <p>(c) 2026 Sathi Homecare Limited</p>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <h2>{title}</h2>
            <ul>
              {links.map(([label, href]) => (
                <li key={`${title}-${label}`}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
