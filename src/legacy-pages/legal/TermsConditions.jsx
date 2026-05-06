import LegalLayout from "./LegalLayout";

const sections = [
  {
    title: "Nature of Services",
    body: "SATHIHOMECARE provides home healthcare support services only. We are not a hospital, clinic, or medical authority. All medical decisions remain the responsibility of the patient and their doctor."
  },
  {
    title: "Booking & Payment",
    body: "Booking is confirmed only after receiving advance payment. We reserve the right to accept or reject any booking and to cancel or reschedule services at our discretion."
  },
  {
    title: "Service Modifications",
    body: "We reserve the right to replace assigned staff, modify service schedules, and revise pricing with prior notice where applicable."
  },
  {
    title: "Service Termination",
    body: "We may terminate services immediately in case of misbehavior or harassment, unsafe working environment, non-payment or delayed payment, or submission of false information. No refund will be provided in such cases."
  },
  {
    title: "Limitation of Liability",
    body: "SATHIHOMECARE shall not be held liable for any health deterioration of the patient, medical emergencies or complications, errors in doctor-prescribed treatments or medications, or any injury, loss, or death during the service period. Our services are strictly supportive in nature."
  },
  {
    title: "Jurisdiction",
    body: "All disputes shall be subject to the jurisdiction of Lucknow, Uttar Pradesh, India."
  }
];

export default function TermsConditions() {
  return (
    <LegalLayout
      eyebrow="Terms & Conditions"
      title="General terms for using Sathi Homecare"
      intro="Effective Date: April 14, 2026. By accessing or using SATHIHOMECARE services, you agree to comply with the following terms."
      sections={sections}
    />
  );
}
