import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getAppointments, getDashboardStats } from 'wasp/client/operations';
import { DashboardLayout } from './components/DashboardLayout';
import { Link, routes } from 'wasp/client/router';
import { Link as RouterLink } from 'react-router';

const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  CONFIRMED: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  COMPLETED: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
  NO_SHOW: { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.2)' },
};

const PAYMENT_COLORS: Record<string, { bg: string; color: string }> = {
  UNPAID: { bg: 'rgba(245,158,11,0.08)', color: 'rgba(245,158,11,0.7)' },
  PENDING_VERIFICATION: { bg: 'rgba(168,85,247,0.08)', color: 'rgba(168,85,247,0.7)' },
  VERIFIED: { bg: 'rgba(16,185,129,0.08)', color: 'rgba(16,185,129,0.7)' },
  REJECTED: { bg: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)' },
};

function StatusBadge({ label, colors }: { label: string; colors: { bg: string; color: string; border?: string } }) {
  return (
    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', background: colors.bg, color: colors.color, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${colors.border || 'transparent'}` }}>
      {label.replace('_', ' ')}
    </span>
  );
}

export const DashboardPage = () => {
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: stats } = useQuery(getDashboardStats);

  const queryArgs: any = {};
  if (filterDate) queryArgs.date = filterDate;
  if (filterStatus !== 'ALL') queryArgs.status = filterStatus;
  const { data: appointments } = useQuery(getAppointments, queryArgs, { enabled: true });

  const stats_ = [
    {
      val: stats?.totalToday ?? 0,
      label: 'Today',
      sub: 'Appointments',
      accent: 'rgba(139,92,246,0.8)',
      bg: 'rgba(139,92,246,0.06)',
      border: 'rgba(139,92,246,0.12)',
    },
    {
      val: stats?.pendingPayments ?? 0,
      label: 'Pending',
      sub: 'Payments',
      accent: 'rgba(245,158,11,0.8)',
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.12)',
    },
    {
      val: stats?.completedToday ?? 0,
      label: 'Completed',
      sub: 'Today',
      accent: 'rgba(16,185,129,0.8)',
      bg: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.12)',
    },
    {
      val: formatPrice(stats?.totalRevenuePaise ?? 0),
      label: 'Revenue',
      sub: 'All time',
      accent: 'rgba(255,255,255,0.7)',
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.875rem', marginBottom: '2rem' }}> 
        {stats_.map((s, i) => (
          <div key={i} style={{ padding: '0.2rem', borderRadius: '1.25rem', background: s.bg, border: `1px solid ${s.border}` }}>
            <div style={{ borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(8,8,8,0.8)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: s.accent, marginBottom: '0.25rem' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{
            padding: '0.5rem 0.875rem', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', fontSize: '0.8rem', fontFamily: 'inherit',
            outline: 'none', cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', gap: '0.375rem', background: 'rgba(255,255,255,0.03)', borderRadius: '9999px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.35rem 0.875rem', borderRadius: '9999px',
                background: filterStatus === s ? '#fff' : 'transparent',
                color: filterStatus === s ? '#050505' : 'rgba(255,255,255,0.45)',
                fontWeight: 600, fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
              }}
            >{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
          ))}
        </div>
        <button
          onClick={() => { setFilterDate(''); setFilterStatus('ALL'); }}
          style={{
            padding: '0.35rem 0.875rem', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: '0.75rem', cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Appointment list */}
      {(!appointments || appointments.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
            No appointments found
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
            {filterDate || filterStatus !== 'ALL' ? 'Try adjusting your filters.' : 'Appointments will appear here once customers book.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {appointments.map((apt: any) => {
            const statusStyle = STATUS_COLORS[apt.status] || STATUS_COLORS.PENDING;
            const paymentStyle = PAYMENT_COLORS[apt.paymentStatus] || PAYMENT_COLORS.UNPAID;

            return (
              <div key={apt.id}>
                <RouterLink
                  to={routes.AppointmentDetailRoute.build({ params: { id: apt.id } })}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '0.2rem',
                    borderRadius: '1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 300ms cubic- bezier(0.32,0.72,0,1)',
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <div style={{
                      borderRadius: 'calc(1.25rem - 3px)',
                      background: 'rgba(10,10,10,0.95)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)',
                      padding: '1rem 1.25rem',
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                    }}>
                      {/* Time block */}
                      <div style={{ textAlign: 'center', minWidth: '3.5rem' }}> 
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                          {apt.startTime}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                          {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '1px', height: '2.5rem', background: 'rgba(255,255,255,0.06)' }} />

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {apt.customerName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                          {apt.service?.name} · {apt.service?.durationMinutes}min
                        </div>
                        {apt.assignedBarber && (
                          <div style={{ fontSize: '0.7rem', color: 'rgba(139,92,246,0.6)', marginTop: '0.2rem' }}>
                            Assigned: {apt.assignedBarber.displayName}
                          </div>
                        )}
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
                        <StatusBadge label={apt.status} colors={statusStyle} />
                        <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', background: paymentStyle.bg, color: paymentStyle.color, fontSize: '0.7rem', fontWeight: 600 }}>
                          {apt.paymentStatus === 'VERIFIED' ? 'Paid' : apt.paymentStatus === 'UNPAID' ? 'Unpaid' : apt.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>→</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;