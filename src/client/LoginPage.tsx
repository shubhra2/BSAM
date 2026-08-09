import React, { useState } from 'react';
import './global.css';
import { login } from 'wasp/client/auth';
import { Link } from 'wasp/client/router';
import { ArrowRight, Scissors, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login({ username: username.trim(), password });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Invalid admin credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      {/* Grain overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      {/* Ambient background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '26rem',
          animation: 'fadeUp 700ms cubic-bezier(0.32,0.72,0,1) forwards',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                marginBottom: '1.25rem',
              }}
            >
              <Scissors size={14} style={{ color: 'rgba(255,255,255,0.8)' }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
                BSAM Atelier
              </span>
            </div>
          </Link>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#fff',
              margin: '0 0 0.5rem',
              fontFamily: "'Clash Display', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', margin: 0 }}>
            Sign in to manage appointments & staff
          </p>
        </div>

        {/* Double-Bezel Form Enclosure */}
        <div
          style={{
            padding: '0.25rem',
            borderRadius: '1.75rem',
            background: 'rgba(255,255,255,0.03)',
            border: 'none',
          }}
        >
          <div
            style={{
              borderRadius: 'calc(1.75rem - 4px)',
              background: 'rgba(12,12,12,0.98)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
              padding: '2rem',
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '9999px',
                  background: loading ? 'rgba(255,255,255,0.2)' : '#fff',
                  color: '#050505',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 300ms cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <div
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        background: 'rgba(5,5,5,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
          Need customer booking?{' '}
          <Link to="/book" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
            Book Appointment
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoginPage;

