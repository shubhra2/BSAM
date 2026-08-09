import React, { useState } from 'react';
import { Link as WaspLink } from 'wasp/client/router';
import { Link, useLocation } from 'react-router';
import { useAuth, logout } from 'wasp/client/auth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', adminOnly: false },
  { path: '/dashboard/services', label: 'Services', icon: '✂', adminOnly: true },
  { path: '/dashboard/barbers', label: 'Barbers', icon: '👤', adminOnly: true },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙', adminOnly: true },
];

export function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { data: user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = (user as any)?.role === 'ADMIN';
  const navItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const sidebarStyle: React.CSSProperties = {
    width: '16rem',
    background: 'rgba(8,8,8,0.98)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 40,
    transition: 'transform 400ms cubic-bezier(0.32,0.72,0,1)',
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#050505',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: '#fff',
      display: 'flex',
    }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...sidebarStyle,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✂</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.02em', color: '#fff' }}>BSAM</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Admin Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path as any}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.75rem',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontWeight: 600, fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
              >
                <span style={{ fontSize: '1rem', opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
                {active && <span style={{ marginLeft: 'auto', width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#fff' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            padding: '0.2rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ borderRadius: 'calc(1rem - 3px)', background: 'rgba(12,12,12,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                  {((user as any)?.displayName || (user as any)?.username || 'A')[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(user as any)?.displayName || (user as any)?.username}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    {isAdmin ? 'Admin' : 'Barber'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  color: 'rgba(239,68,68,0.7)', fontWeight: 600, fontSize: '0.75rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 200ms, color 200ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.9)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: '16rem', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        {/* Top bar */}
        <header style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5,5,5,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>
            {title || 'Dashboard'}
          </h1>
          <Link
            to="/book"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none',
            }}
          >
            ↗ Booking Page
          </Link>
        </header>

        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar { transform: translateX(-100%); }
          .dashboard-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
