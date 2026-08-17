export default function CoilScan() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Coil Scan (Arrival)</h1>
      <p>Scan supplier barcodes on coil arrival</p>
      <ul>
        <li>Camera decodes common symbologies (Code128/EAN/QR)</li>
        <li>Manual entry fallback for damaged labels</li>
        <li>Scan flips in_transit → arrived</li>
        <li>Writes arrival movement to ledger</li>
        <li>Balance reflects immediately</li>
        <li>Duplicate scan warns</li>
        <li>Offline capture with sync queue</li>
      </ul>
    </div>
  );
}
