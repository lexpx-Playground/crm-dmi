export default function WarrantyLookup() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Warranty Lookup</h1>
      <p>Trace coil to supplier PO for warranty claims</p>
      <ul>
        <li>Scan batch QR or search by client</li>
        <li>One screen shows: batch date, coil IDs, supplier PO number, arrival date, material/thickness spec, client/project</li>
        <li>Cross-check against supplier paperwork</li>
        <li>Graceful "not found" for nonexistent QR</li>
      </ul>
    </div>
  );
}
