export default function StockBalance() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Stock Balance</h1>
      <p>Live stock balance computed from movement ledger</p>
      <ul>
        <li>Grouped by material + thickness</li>
        <li>Tons on hand</li>
        <li>Balance coil list with remaining weight and length</li>
        <li>Computed from append-only ledger (no stored totals)</li>
        <li>Matches physical count within tolerance</li>
      </ul>
    </div>
  );
}
