import LegalLayout from "./LegalLayout";

const sections = [
  {
    title: "Information We Collect",
    body: "We may collect the following information: Full Name, Contact Number, Address, Medical Requirements, and Payment Details."
  },
  {
    title: "How Information Is Used",
    body: "The collected data may be used for service delivery and coordination, customer support and communication, and internal analytics and business improvement. SATHIHOMECARE reserves the right to use anonymized data for operational and analytical purposes."
  },
  {
    title: "Data Sharing",
    body: "We may share data only when required for service delivery or required by law or legal authorities. We are not responsible for any data voluntarily shared by users via phone calls, WhatsApp, or other platforms."
  },
  {
    title: "Data Security",
    body: "We implement reasonable security measures to protect data. However, we do not guarantee absolute security. By using our services, you agree that data transmission is at your own risk."
  },
  {
    title: "User Consent",
    body: "By using our services, you consent to the collection, usage, and processing of your data as outlined in this policy."
  }
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      eyebrow="Privacy Policy"
      title="How Sathi Homecare handles customer information"
      intro="Effective Date: April 14, 2026. At SATHIHOMECARE, we are committed to protecting user data while retaining the right to process and manage information for operational purposes."
      sections={sections}
    />
  );
}
