import React, { useState } from 'react';
import { LoginForm } from 'wasp/client/auth';
import { Link } from 'wasp/client/router';

export const LoginPage = () => {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      {/* Background orb */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '60vw', height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '26rem', animation: 'fadeUp 700ms cubic-bezier(0.32,0.72,0,1) forwards' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '1rem' }}>✂</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                BSAM Admin
              </span>
            </div>
          </Link>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#fff',
            margin: '0 0 0.5rem',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
            Sign in to manage your shop
          </p>
        </div>

        {/* Login card (double-bezel) */}
        <div style={{
          padding: '0.25rem',
          borderRadius: '1.75rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            borderRadius: 'calc(1.75rem - 4px)',
            background: 'rgba(12,12,12,0.98)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
            padding: '2rem',
          }}>
            <LoginForm />
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
          Customer?{' '}
          <Link to="/book" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
            Book an appointment
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
