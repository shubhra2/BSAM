import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getBarbers } from 'wasp/client/operations';
import { createBarber, toggleBarberActive } from 'wasp/client/operations';
import { DashboardLayout } from './components/DashboardLayout';

export const BarbersPage = () => {
  const { data: barbers, refetch } = useQuery(getBarbers);
  const createBr = useAction(createBarber);
  const toggleBr = useAction(toggleBarberActive);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', displayName: '', phone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setError('');
    if (!form.username.trim()) return setError('Username is required');
    if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!form.displayName.trim()) return setError('Display name is required');
    setSaving(true);
    try {
      await createBr({ username: form.username, password: form.password, displayName: form.displayName, phone: form.phone || undefined });
      setDialogOpen(false);
      setForm({ username: '', password: '', displayName: '', phone: '' });
      refetch();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Barbers">
      <div style={{ maxWidth: '42rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space- between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 0.25rem' }}>Barbers</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>{(barbers || []).filter((b: any) => b.isActive).length} active barbers</p>
          </div>
          <button
            onClick={() => { setError(''); setForm({ username: '', password: '', displayName: '', phone: '' }); setDialogOpen(true); }}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '99px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
          >
            + Add Barber
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {(barbers || []).map(barber => (
            <div key={barber.id}>
              <div style={{ padding: '0.2rem', borderRadius: '1.25rem', background: barber.isActive ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', opacity: barber.isActive ? 1 : 0.45 }}>
                <div style={{ borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(10,10,10,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(16,185,129,0.4))', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                    {(barber.displayName || barber.username)[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{barber.displayName || barber.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>@{barber.username}{(barber as any).phone ? ` · ${(barber as any).phone}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, background: barber.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: barber.isActive ? '#10b981' : '#6b7280' }}>
                      {barber.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleBr({ id: barber.id, isActive: !barber.isActive })}
                      style={{ padding: '0.375rem 0.875rem', borderRadius: '99px', background: barber.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: barber.isActive ? '#ef4444' : '#10b981', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {barber.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add dialog */}
      {dialogOpen && (
        <div onClick={() => setDialogOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '24rem', padding: '0.25rem', borderRadius: '1.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ borderRadius: 'calc(1.75rem - 4px)', background: 'rgba(10,10,10,0.98)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>Add New Barber</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { key: 'username', label: 'Username', type: 'text', placeholder: 'barber_karan', required: true },
                  { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', required: true },
                  { key: 'displayName', label: 'Display Name', type: 'text', placeholder: 'Karan Singh', required: true },
                  { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98xxx', required: false },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
                      {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))} 
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setDialogOpen(false)} style={{ padding: '0.75rem', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', flex: 1 }}>Cancel</button>
                <button onClick={handleCreate} disabled={saving} style={{ padding: '0.75rem', borderRadius: '99px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flex: 1, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Adding...' : 'Add Barber'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BarbersPage;