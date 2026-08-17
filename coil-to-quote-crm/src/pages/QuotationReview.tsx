export default function QuotationReview() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Review Quotation</h1>
      <p>Review and generate PDF quotation</p>
      <ul>
        <li>Shows Client / Project / Product details</li>
        <li>Subtotal / Tax / Total with currency</li>
        <li>Valid-until date (7 days from issue)</li>
        <li>Generate branded PDF</li>
        <li>Share via WhatsApp (wa.me) or email (mailto)</li>
        <li>Status: draft → sent → accepted/rejected</li>
        <li>Expired quotes can be cloned to new quote</li>
      </ul>
    </div>
  );
}
