import { useNavigate } from 'react-router-dom';
import { signOut } from '../lib/supabase';
import { useAuth, useRoleGuard } from '../hooks';

interface DashboardProps {
  userRole?: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const role = user?.role || userRole;
    const items: { label: string; path: string; roles: string[] }[] = [
      { label: 'Clients', path: '/clients', roles: ['superadmin', 'sales'] },
      { label: 'New Quotation', path: '/quotations/new', roles: ['superadmin', 'sales'] },
      { label: 'Products & Pricing', path: '/products', roles: ['superadmin', 'sales'] },
      { label: 'PO Import', path: '/po-import', roles: ['superadmin', 'warehouse'] },
      { label: 'Coil Scan (Arrival)', path: '/coil-scan', roles: ['superadmin', 'warehouse'] },
      { label: 'Usage Entry', path: '/usage', roles: ['superadmin', 'warehouse'] },
      { label: 'Stock Balance', path: '/stock', roles: ['superadmin', 'warehouse'] },
      { label: 'DPR Report', path: '/dpr', roles: ['superadmin', 'warehouse'] },
      { label: 'Warranty Lookup', path: '/warranty', roles: ['superadmin', 'sales', 'warehouse'] },
      { label: 'Settings', path: '/settings', roles: ['superadmin'] },
    ];

    return items.filter(item => item.roles.includes(role || ''));
  };

  const menuItems = getMenuItems();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Coil-to-Quote CRM</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem' }}>
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Dashboard</h2>
        
        {/* Quick actions grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 500,
                color: '#2c3e50',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Info cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Welcome</h3>
            <p style={{ color: '#666', margin: 0 }}>
              Logged in as <strong>{user?.name}</strong> with role <strong>{user?.role}</strong>.
              Access the modules above based on your permissions.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Quick Stats</h3>
            <p style={{ color: '#666', margin: 0 }}>
              View stock balance, quotations, and production data from the dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
