export default function QuotationBuilder() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>New Quotation</h1>
      <p>Build quotations with min $/ton guardrail</p>
      <ul>
        <li>Client select/create + project name</li>
        <li>Product lines: thickness, qty m², auto price, editable with override flag</li>
        <li>Accessory lines: Flashing/Capping with size (300/400/450), Clips/Zips unsized</li>
        <li>Min $/ton guardrail: warn or block based on settings</li>
        <li>Line totals correct to the cent</li>
        <li>Review screen before PDF generation</li>
      </ul>
    </div>
  );
}
