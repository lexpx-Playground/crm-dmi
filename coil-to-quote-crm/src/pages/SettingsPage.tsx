import { useState } from 'react';
import { useSettings, useAuth } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  if (loading || !settings) return <LoadingSpinner />;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setEditing(false);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Settings</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Configure system-wide settings (Superadmin only)
      </p>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Currency */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Currency Code
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.currency_code ?? settings.currency_code}
                onChange={(e) => handleChange('currency_code', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.currency_code}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Currency Symbol
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.currency_symbol ?? settings.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.currency_symbol}</p>
            )}
          </div>

          {/* Tax */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Tax Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.tax_name ?? settings.tax_name}
                onChange={(e) => handleChange('tax_name', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.tax_name}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Tax Rate (%)
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.tax_rate ?? settings.tax_rate}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.tax_rate}%</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Tax Inclusive
            </label>
            {editing ? (
              <select
                value={formData.tax_inclusive ?? settings.tax_inclusive}
                onChange={(e) => handleChange('tax_inclusive', e.target.value === 'true')}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="false">No (Exclusive)</option>
                <option value="true">Yes (Inclusive)</option>
              </select>
            ) : (
              <p>{settings.tax_inclusive ? 'Yes' : 'No'}</p>
            )}
          </div>

          {/* Min $/ton guardrail */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Minimum $/Ton Value
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.min_ton_value ?? settings.min_ton_value}
                onChange={(e) => handleChange('min_ton_value', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.min_ton_value}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Min $/Ton Mode
            </label>
            {editing ? (
              <select
                value={formData.min_ton_mode ?? settings.min_ton_mode}
                onChange={(e) => handleChange('min_ton_mode', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="warn">Warn (allow override)</option>
                <option value="block">Block (prevent)</option>
              </select>
            ) : (
              <p>{settings.min_ton_mode === 'warn' ? 'Warn' : 'Block'}</p>
            )}
          </div>

          {/* Quote validity */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Quote Validity (days)
            </label>
            {editing ? (
              <input
                type="number"
                value={formData.quote_validity_days ?? settings.quote_validity_days}
                onChange={(e) => handleChange('quote_validity_days', parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.quote_validity_days} days</p>
            )}
          </div>

          {/* Company info */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Company Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.company_name ?? settings.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.company_name}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Terms Text
            </label>
            {editing ? (
              <textarea
                value={formData.terms_text ?? settings.terms_text}
                onChange={(e) => handleChange('terms_text', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ) : (
              <p>{settings.terms_text}</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({});
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
