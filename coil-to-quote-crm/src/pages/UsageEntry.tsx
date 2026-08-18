export default function UsageEntry() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Usage Entry</h1>
      <p>Scan coil for production and enter consumption</p>
      <ul>
        <li>Scan coil → status becomes in_use</li>
        <li>Batch created with system-generated QR</li>
        <li>Batch links coil(s) to client/project</li>
        <li>Manual consumption entry (weight + length)</li>
        <li>Hard validation against remaining quantity</li>
        <li>Coil becomes balance or finished</li>
        <li>Movement logged to append-only ledger</li>
      </ul>
    </div>
  );
}
