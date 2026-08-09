import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getServices } from 'wasp/client/operations';
import { createService, updateService } from 'wasp/client/operations';
import { DashboardLayout } from './components/DashboardLayout';

const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
  'https://images.unsplash.com/photo-1599351431202-180f0b22f462?w=400',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
];

const SERVICE_FORM_FIELDS = [
  { key: 'name', label: 'Service Name', type: 'text', placeholder: 'e.g., Haircut + Beard Trim', required: true },
  { key: 'description', label: 'Description', type: 'text', placeholder: 'Brief description (optional)', required: false },
  { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number', placeholder: '30', required: true },
  { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '300', required: true },
  { key: 'tokenAmount', label: 'Token Amount (₹)', type: 'number', placeholder: '50', required: true },
];

export const ServicesPage = () => {
  const { data: services, refetch } = useQuery(getServices);
  const createSvc = useAction(createService);
  const updateSvc = useAction(updateService);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', durationMinutes: '30', price: '', tokenAmount: '50', imageUrl: UNSPLASH_IMAGES[0] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingService(null);
    setForm({ name: '', description: '', durationMinutes: '30', price: '', tokenAmount: '50', imageUrl: UNSPLASH_IMAGES[0] });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (svc: any) => {
    setEditingService(svc);
    setForm({
      name: svc.name,
      description: svc.description || '',
      durationMinutes: String(svc.durationMinutes),
      price: String(Math.round((svc.price || 0) / 100)),
      tokenAmount: String(Math.round((svc.tokenAmount || 0) / 100)),
      imageUrl: svc.imageUrl || UNSPLASH_IMAGES[0],
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    const pricePaise = Math.round(parseFloat(form.price || '0') * 100);
    const tokenPaise = Math.round(parseFloat(form.tokenAmount || '0') * 100);
    if (!form.name.trim()) return setError('Service name is required');
    if (!form.durationMinutes || isNaN(parseInt(form.durationMinutes))) return setError('Duration is required');
    if (pricePaise <= 0) return setError('Price must be greater than 0');
    if (tokenPaise < 0) return setError('Token amount must be 0 or more');

    setSaving(true);
    try {
      if (editingService) {
        await updateSvc({
          id: editingService.id,
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
          durationMinutes: parseInt(form.durationMinutes),
          price: pricePaise,
          tokenAmount: tokenPaise,
        });
      } else {
        await createSvc({
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
          durationMinutes: parseInt(form.durationMinutes),
          price: pricePaise,
          tokenAmount: tokenPaise,
        });
      }
      setDialogOpen(false);
      refetch();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (svc: any) => {
    await updateSvc({ id: svc.id, isActive: !svc.isActive });
    refetch();
  };

  return (
    <DashboardLayout title="Services">
      <div style={{ maxWidth: '60rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 0.25rem' }}>Services</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>{(services || []).length} active service{(services || []).length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openAdd}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '99px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            + Add Service
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1rem' }}>
          {(services || []).map(svc => (
            <div key={svc.id}>
              <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: svc.isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.07)', opacity: svc.isActive ? 1 : 0.45 }}>
                <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: 'rgba(10,10,10,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  {svc.imageUrl && (
                    <div style={{ height: '120px', overflow: 'hidden' }}>
                      <img src={svc.imageUrl} alt={svc.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: svc.isActive ? 'none' : 'grayscale(1)' }} />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.375rem' }}>{svc.name}</h3>
                    {svc.description && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{svc.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{formatPrice(svc.price)}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.375rem' }}>· {svc.durationMinutes}min</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => openEdit(svc)} style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                        <button onClick={() => toggleActive(svc)} style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: svc.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: 'none', color: svc.isActive ? '#ef4444' : '#10b981', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{svc.isActive ? '✕' : '↺'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div
          onClick={() => setDialogOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '28rem', padding: '0.25rem', borderRadius: '1.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div style={{ borderRadius: 'calc(1.75rem - 4px)', background: 'rgba(10,10,10,0.98)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>{editingService ? 'Edit Service' : 'Add New Service'}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {SERVICE_FORM_FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
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

                {/* Image selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {UNSPLASH_IMAGES.map((url, i) => (
                      <button key={i} onClick={() => setForm({ ...form, imageUrl: url })} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: `2px solid ${form.imageUrl === url ? '#fff' : 'rgba(255,255,255,0.08)'}`, padding: 0, cursor: 'pointer' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setDialogOpen(false)} style={{ padding: '0.75rem', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', flex: 1 }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem', borderRadius: '99px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flex: 1, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ServicesPage;