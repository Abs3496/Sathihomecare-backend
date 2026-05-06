export const metadata = {
  title: "Admin Login",
  description: "Admin access for Sathi Homecare operations.",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  return (
    <section className="section">
      <div className="app-notice">
        <strong>Admin login:</strong> Admin screens are protected and should only be accessed after authenticated API login.
      </div>
    </section>
  );
}
