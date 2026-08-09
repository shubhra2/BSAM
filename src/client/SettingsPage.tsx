import React, { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getShopInfo } from 'wasp/client/operations';
import { updateShopSettings } from 'wasp/client/operations';
import { DashboardLayout } from './components/DashboardLayout';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export const SettingsPage = () => {
  const { data: shopInfo, refetch } = useQuery(getShopInfo);
  const updateSettings = useAction(updateShopSettings);

  const [form, setForm] = useState({
    shopName: '',
    address: '',
    phone: '',
    openTime: '09:00',
    closeTime: '20:00',
    slotDurationMinutes: 30,
    upiQrImageUrl: '',
    closedDays: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shopInfo) {
      let closedDays: string[] = [];
      try { closedDays = JSON.parse((shopInfo as any).closedDays || '[]'); } catch {}
      setForm({
        shopName: shopInfo.shopName || '',
        address: shopInfo.address || '',
        phone: shopInfo.phone || '',
        openTime: shopInfo.openTime || '09:00',
        closeTime: shopInfo.closeTime || '20:00',
        slotDurationMinutes: (shopInfo as any).slotDurationMinutes || 30,
        upiQrImageUrl: shopInfo.upiQrImageUrl || '',
        closedDays,
      });
    }
  }, [shopInfo]);

  const toggleClosedDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      closedDays: prev.closedDays.includes(day)
        ? prev.closedDays.filter(d => d !== day)
        : [...prev.closedDays, day],
    }));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await updateSettings({
        shopName: form.shopName,
        address: form.address,
        phone: form.phone,
        openTime: form.openTime,
        closeTime: form.closeTime,
        slotDurationMinutes: form.slotDurationMinutes,
        upiQrImageUrl: form.upiQrImageUrl || undefined,
      });
      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.875rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem',
  };

  const cardStyle: React.CSSProperties = {
    padding: '0.2rem', borderRadius: '1.25rem',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem',
  };

  const innerStyle: React.CSSProperties = {
    borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(10,10,10,0.95)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1.5rem',
  };

  return (
    <DashboardLayout title="Shop Settings">
      <div style={{ maxWidth: '36rem' }}>

        {/* Shop Info */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1.25rem' }}>Shop Info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Shop Name</label>
                <input style={inputStyle} type="text" value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} placeholder="Royal Cut Barber Shop" />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, Bengaluru" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1.25rem' }}>Hours & Slots</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Open Time</label>
                <input style={inputStyle} type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Close Time</label>
                <input style={inputStyle} type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Slot Duration</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {SLOT_DURATIONS.map(d => (
                  <button key={d} onClick={() => setForm({ ...form, slotDurationMinutes: d })} style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: form.slotDurationMinutes === d ? '#fff' : 'rgba(255,255,255,0.07)', border: 'none', color: form.slotDurationMinutes === d ? '#050505' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 200ms' }}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Closed Days */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1.25rem' }}>Closed Days</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {WEEKDAYS.map(day => (
                <button key={day} onClick={() => toggleClosedDay(day)} style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: form.closedDays.includes(day) ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${form.closedDays.includes(day) ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`, color: form.closedDays.includes(day) ? '#ef4444' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 200ms' }}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {form.closedDays.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(239,68,68,0.6)', marginTop: '0.75rem' }}>
                Closed on: {form.closedDays.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* UPI QR */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '1.25rem' }}>UPI QR Code</p>
            {form.upiQrImageUrl && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff', borderRadius: '0.875rem', display: 'inline-block' }}>
                <img src={form.upiQrImageUrl} alt="UPI QR" style={{ height: '120px', display: 'block' }} />
              </div>
            )}
            <label style={labelStyle}>QR Image URL</label>
            <input
              style={inputStyle}
              type="url"
              value={form.upiQrImageUrl}
              onChange={e => setForm({ ...form, upiQrImageUrl: e.target.value })}
              placeholder="https://... (URL to QR code image)"
            />
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.375rem', lineHeight: 1.5 }}>
              Upload your UPI QR image to a hosting service and paste the URL here.
            </p>
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
        {saved && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.875rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
            ✓ Settings saved successfully
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: '99px',
            background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.95rem',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;