export const metadata = {
  title: "Partner Login",
  description: "Partner access for Sathi Homecare care professionals.",
  robots: { index: false, follow: false }
};

export default function PartnerLoginPage() {
  return (
    <section className="section">
      <div className="app-notice">
        <strong>Partner login:</strong> Protected dashboard access is available through the authenticated backend API. Please use the production dashboard deployment path configured for staff access.
      </div>
    </section>
  );
}
