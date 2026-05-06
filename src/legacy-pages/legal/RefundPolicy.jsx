import LegalLayout from "./LegalLayout";

const sections = [
  {
    title: "Cancellation Policy",
    body: "24+ hours before service: 90% refund with 10% processing fee applicable. 12 to 24 hours before service: 70% refund. 6 to 12 hours before service: 50% refund. Less than 6 hours before service: no refund."
  },
  {
    title: "After Service Commencement",
    body: "Once the service has started, no refund will be issued under any circumstances."
  },
  {
    title: "Immediate Termination and No Refund Cases",
    body: "No refund will be provided if the client misbehaves with staff, incorrect or misleading information is provided, safety concerns arise, or payment obligations are not fulfilled."
  },
  {
    title: "Deductions",
    body: "SATHIHOMECARE reserves the right to deduct staff allocation charges, travel expenses, and operational and administrative costs from any approved refund."
  },
  {
    title: "Refund Processing Time",
    body: "Refunds will be processed within 3 to 7 working days. The final decision on refunds rests solely with SATHIHOMECARE."
  },
  {
    title: "Medical Equipment",
    body: "If applicable, security deposit is refundable after inspection. Any damage or loss will result in deductions, and late returns may incur additional charges."
  }
];

export default function RefundPolicy() {
  return (
    <LegalLayout
      eyebrow="Refund & Cancellation"
      title="Cancellation and refund guidelines"
      intro="Effective Date: April 14, 2026. This policy explains the refund, cancellation, deduction, and equipment handling rules applicable to SATHIHOMECARE services."
      sections={sections}
    />
  );
}
