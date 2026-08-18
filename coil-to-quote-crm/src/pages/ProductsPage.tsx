export default function ProductsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Products & Pricing</h1>
      <p>Product types and price book management (Superadmin only)</p>
      <ul>
        <li>Product types with material/thickness options</li>
        <li>Price per m² per thickness</li>
        <li>Accessories: Flashing/Capping with sizes (300/400/450), Clips/Zips unsized</li>
        <li>Editing prices never alters existing quotations (snapshot)</li>
      </ul>
    </div>
  );
}
