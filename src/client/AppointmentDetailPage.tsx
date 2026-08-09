import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getAppointmentById, getBarbers } from 'wasp/client/operations';
import { updateAppointmentStatus, verifyPaymentStatus } from 'wasp/client/operations';
import { DashboardLayout } from './components/DashboardLayout';
import { useParams, useNavigate } from 'react-router';

const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;

export const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aptId = parseInt(id || '0', 10);

  const { data: apt, refetch } = useQuery(getAppointmentById, { id: aptId }, { enabled: !!aptId });
  const { data: barbers } = useQuery(getBarbers);

  const updateStatus = useAction(updateAppointmentStatus);
  const verifyPayment = useAction(verifyPaymentStatus);

  const [selectedBarber, setSelectedBarber] = useState<number | ''>(apt?.assignedBarberId || '');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  React.useEffect(() => {
    if (apt?.assignedBarberId) setSelectedBarber(apt.assignedBarberId);
  }, [apt]);

  const doUpdate = async (fn: () => Promise<void>) => {
    setUpdating(true); setMsg('');
    try { await fn(); await refetch(); }
    catch (e: any) { setMsg(e.message); }
    finally { setUpdating(false); }
  };

  if (apt === undefined) return (
    <DashboardLayout title="Appointment">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</span>
      </div>
    </DashboardLayout>
  );

  if (!apt) return (
    <DashboardLayout title="Appointment">
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Appointment not found.</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '0.625rem 1.5rem', borderRadius: '99px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    </DashboardLayout>
  );

  const cardStyle = { padding: '0.2rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' };
  const innerStyle = { borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(10,10,10,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1.5rem' };

  return (
    <DashboardLayout title={`Appointment #${apt.id}`}>
      <div style={{ maxWidth: '42rem' }}>
        {/* Status + Nav */} 
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: 0, marginBottom: '0.75rem' }}>
            ← Back to Dashboard
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>Appointment #{apt.id}</h2>
        </div>

        {/* Appointment details */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Date & Time</p>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{apt.startTime}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Customer</p>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{apt.customerName}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{apt.customerPhone}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Service</p>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{apt.service?.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>{apt.service?.durationMinutes} min · {formatPrice(apt.service?.price || 0)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Payment</p>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{apt.paymentMethod === 'PAY_NOW' ? 'UPI' : 'Pay at Shop'}</p>
                <span style={{ padding: '0.2rem 0.625rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, background: apt.paymentStatus === 'VERIFIED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: apt.paymentStatus === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>
                  {apt.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assign Barber */}
        <div style={cardStyle}>
          <div style={{ ...innerStyle }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.75rem' }}>Assign Barber</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              <button onClick={() => doUpdate(async () => { await updateStatus({ id: aptId, status: apt.status as any, assignedBarberId: null }); })} style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: !apt.assignedBarberId ? '#fff' : 'rgba(255,255,255,0.06)', color: !apt.assignedBarberId ? '#050505' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>Unassigned</button>
              {(barbers || []).filter((b: any) => b.isActive).map((b: any) => (
                <button
                  key={b.id}
                  onClick={() => doUpdate(async () => { await updateStatus({ id: aptId, status: apt.status as any, assignedBarberId: b.id }); })}
                  style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: apt.assignedBarberId === b.id ? '#fff' : 'rgba(255,255,255,0.06)', color: apt.assignedBarberId === b.id ? '#050505' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all 200ms' }}
                >{b.displayName}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div style={cardStyle}>
          <div style={innerStyle}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.75rem' }}>Status</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button
                  key={s} onClick={() => s !== apt.status && doUpdate(async () => { await updateStatus({ id: aptId, status: s }); })}
                  style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: apt.status === s ? '#fff' : 'rgba(255,255,255,0.06)', color: apt.status === s ? '#050505' : 'rgba(255,255,255,0.5)', border: 'none', cursor: s !== apt.status ? 'pointer' : 'default', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', transition: 'all 200ms' }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment verification (if PAY_NOW) */} 
        {apt.paymentMethod === 'PAY_NOW' && apt.paymentStatus !== 'VERIFIED' && apt.paymentStatus !== 'UNPAID' && (
          <div style={cardStyle}>
            <div style={innerStyle}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.75rem' }}>Verify Payment</p>
              {apt.paymentProof && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>Payment Reference:</p>
                  <code style={{ display: 'block', padding: '0.5rem 0.875rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>
                    {apt.paymentProof}
                  </code>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => doUpdate(async () => { await verifyPayment({ id: aptId, paymentStatus: 'VERIFIED' }); })} style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✓ Verify Payment
                </button>
                <button onClick={() => doUpdate(async () => { await verifyPayment({ id: aptId, paymentStatus: 'REJECTED' }); })} style={{ flex: 1, padding: '0.75rem', borderRadius: '99px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {msg && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{msg}</p>}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetailPage;