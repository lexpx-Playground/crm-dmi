// Placeholder pages - will be implemented in next steps
import LoadingSpinner from '../components/LoadingSpinner';

export default function ClientsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Clients</h1>
      <p>Client management page - CRUD operations with phone search</p>
      <ul>
        <li>Create client with name, WhatsApp, email, address</li>
        <li>Search by partial phone number</li>
        <li>Duplicate phone warning</li>
        <li>View client history with quotations</li>
      </ul>
    </div>
  );
}
