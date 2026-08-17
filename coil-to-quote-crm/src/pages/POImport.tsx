export default function POImport() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>PO Import</h1>
      <p>Import Purchase Orders from CSV template</p>
      <ul>
        <li>CSV columns: po_number, supplier, coil_code, material, thickness_mm, width_mm, weight_kg, length_m, price, price_unit</li>
        <li>Missing price triggers mandatory prompt before arrival</li>
        <li>5-coil CSV creates 5 in_transit coils</li>
        <li>Data validation with warnings/errors</li>
        <li>Auto-create suppliers if unknown</li>
      </ul>
    </div>
  );
}
