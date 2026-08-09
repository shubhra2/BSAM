import React, { useEffect, useRef, useState } from 'react';
import './global.css';
import { useQuery } from 'wasp/client/operations';
import { getShopInfo, getServices } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = '', delay = 0, style: extraStyle }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 900ms cubic-bezier(0.32,0.72,0,1) ${delay}ms, transform 900ms cubic-bezier(0.32,0.72,0,1) ${delay}ms, filter 900ms cubic-bezier(0.32,0.72,0,1) ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        filter: visible ? 'blur(0)' : 'blur(4px)',
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

export const LandingPage = () => {
  const { data: shopInfo } = useQuery(getShopInfo);
  const { data: services } = useQuery(getServices);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;
  const shopName = shopInfo?.shopName || 'Royal Cut';

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let closedDays: string[] = [];
  try { closedDays = JSON.parse((shopInfo as any)?.closedDays || '[]'); } catch {}

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        fontFamily: "'Plus Jakarta Sans', 'Geist', system-ui, sans-serif",
        color: '#fff',
        overflowX: 'hidden',
      }}
    >
      {/* Grain overlay - fixed, pointer-events-none */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />

      {/* Radial mesh gradient background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '20%', width: '60vw', height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%', width: '50vw', height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }} />
      </div>

      {/* Floating Nav */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', justifyContent: 'center',
          padding: '1.5rem 1rem 0',
          pointerEvents: 'none',
        }}
      >
        <div
          className="landing-nav-container"
          style={{
            pointerEvents: 'all',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1.5rem',
            padding: '0.625rem 0.75rem 0.625rem 1.25rem',
            borderRadius: '9999px',
            background: scrolled ? 'rgba(5,5,5,0.85)' : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'background 600ms cubic-bezier(0.32,0.72,0,1)',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em', color: '#fff', whiteSpace: 'nowrap' }}>
            ✂ {shopName}
          </span>
          <div className="landing-nav-links" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#services" className="nav-hide-mobile" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'none' }}>
              Services
            </a>
            <a href="#info" className="nav-hide-mobile" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'none' }}>
              Hours
            </a>
            <Link
              to="/login"
              className="nav-hide-mobile"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
            >
              Admin
            </Link>
            <Link
              to="/book"
              className="book-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                borderRadius: '9999px',
                background: '#fff', color: '#050505',
                fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Book Now
              <span style={{
                width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                background: 'rgba(0,0,0,0.08)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem',
                transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
              }}>↗</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8rem 2rem 4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%' }}>

          {/* Eyebrow tag */}
          <div style={{ marginBottom: '2rem', opacity: 0, animation: 'fadeUp 800ms cubic-bezier(0.32,0.72,0,1) 100ms forwards' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Walk-ins & Online Booking
            </span>
          </div>

          {/* Hero headline */}
          <div style={{ opacity: 0, animation: 'fadeUp 900ms cubic-bezier(0.32,0.72,0,1) 200ms forwards' }}>
            <h1 style={{
              fontSize: 'clamp(2.75rem, 8vw, 7rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              margin: '0 0 1.5rem',
              fontFamily: "'Clash Display', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}>
              Look Sharp.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Book Easy.</span>
            </h1>
          </div>

          <div style={{ opacity: 0, animation: 'fadeUp 900ms cubic-bezier(0.32,0.72,0,1) 350ms forwards', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
              color: 'rgba(255,255,255,0.45)',
              margin: 0,
              maxWidth: '28rem',
              lineHeight: 1.6,
            }}>
              {shopInfo?.address || "Bengaluru's finest cuts, booked in under 60 seconds."}
            </p>

            <div className="hero-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <Link
                to="/book"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '9999px',
                  background: '#fff', color: '#050505',
                  fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                  transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1), box-shadow 300ms cubic-bezier(0.32,0.72,0,1)',
                  boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(0.98)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px 0 rgba(255,255,255,0.15)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 rgba(255,255,255,0)';
                }}
              >
                Book Appointment
                <span style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.1)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem',
                }}>↗</span>
              </Link>
              <a
                href="#services"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                  transition: 'background 300ms cubic-bezier(0.32,0.72,0,1)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)')}
              >
                View Services
              </a>
            </div>
          </div>
        </div>

        {/* Hero stats bar */}
        <div style={{ opacity: 0, animation: 'fadeUp 900ms cubic-bezier(0.32,0.72,0,1) 500ms forwards', maxWidth: '72rem', margin: '4rem auto 0', width: '100%' }}>
          <div style={{
            padding: '0.2rem',
            borderRadius: '1.5rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div
              className="hero-stats-grid"
              style={{
                borderRadius: 'calc(1.5rem - 3px)',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}
            >
              {[
                { val: shopInfo?.openTime || '09:00', label: 'Opens' },
                { val: shopInfo?.closeTime || '20:00', label: 'Closes' },
                { val: shopInfo?.phone || '+91 9876543210', label: 'Call us' },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '0.25rem', overflow: 'hidden' }}>
                  <div
                    className="hero-stats-val"
                    style={{
                      fontSize: 'clamp(0.85rem, 3vw, 1.25rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#fff',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {stat.val}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <RevealSection>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.65rem', fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Services
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              margin: '0 0 0.5rem',
              lineHeight: 1.1,
            }}>
              What we offer
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '30rem' }}>
              From quick trims to full grooming sessions — priced fairly, done precisely.
            </p>
          </RevealSection>

          {/* Asymmetrical Bento grid */}
          <div
            className="bento-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '1rem',
            }}
          >
            {(services || []).map((service, i) => {
              const isLarge = i === 0;
              return (
                <RevealSection
                  key={service.id}
                  delay={i * 120}
                  className="bento-card"
                  style={{
                    gridColumn: isLarge ? 'span 7' : 'span 5',
                    gridRow: isLarge ? 'span 1' : undefined,
                  }}
                >
                  <div style={{
                    padding: '0.25rem',
                    borderRadius: '1.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    height: '100%',
                  }}>
                    <div style={{
                      borderRadius: 'calc(1.75rem - 4px)',
                      background: 'rgba(12,12,12,0.9)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.07)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      {service.imageUrl && (
                        <div style={{ height: isLarge ? '220px' : '160px', overflow: 'hidden', flexShrink: 0 }}>
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            onError={e => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop"; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.4rem' }}>
                            {service.name}
                          </h3>
                          {service.description && (
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1rem', lineHeight: 1.6 }}>
                              {service.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                              {formatPrice(service.price)}
                            </span>
                            <span style={{
                              padding: '0.2rem 0.5rem', borderRadius: '9999px',
                              background: 'rgba(255,255,255,0.06)',
                              fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)',
                              fontWeight: 500,
                            }}>
                              {service.durationMinutes} min
                            </span>
                          </div>
                          <Link
                            to="/book"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                              padding: '0.45rem 0.875rem',
                              borderRadius: '9999px',
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#fff',
                              fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none',
                              transition: 'background 300ms cubic-bezier(0.32,0.72,0,1)',
                            }}
                            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.18)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)')}
                          >
                            Book this
                            <span style={{ fontSize: '0.75rem' }}>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shop Info Section */}
      <section id="info" style={{ padding: '4rem 1.5rem 8rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}>
            {/* Hours card */}
            <RevealSection>
              <div style={{
                padding: '0.25rem',
                borderRadius: '1.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  borderRadius: 'calc(1.75rem - 4px)',
                  background: 'rgba(10,10,10,0.95)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                  padding: '1.5rem',
                }}>
                  <span style={{
                    display: 'inline-block', marginBottom: '1rem',
                    padding: '0.3rem 0.75rem', borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.65rem', fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                  }}>Hours</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                    When we're open
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {DAYS.map(day => {
                      const isClosed = closedDays.includes(day);
                      return (
                        <div key={day} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                          <span style={{ fontSize: '0.85rem', color: isClosed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                            {day}
                          </span>
                          <span style={{
                            fontSize: '0.8rem', fontWeight: 600,
                            color: isClosed ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.9)',
                          }}>
                            {isClosed ? 'Closed' : `${shopInfo?.openTime || '09:00'} – ${shopInfo?.closeTime || '20:00'}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Location & CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <RevealSection delay={150}>
                <div style={{
                  padding: '0.25rem',
                  borderRadius: '1.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    borderRadius: 'calc(1.75rem - 4px)',
                    background: 'rgba(10,10,10,0.95)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                    padding: '1.5rem',
                  }}>
                    <span style={{
                      display: 'inline-block', marginBottom: '0.75rem',
                      padding: '0.3rem 0.75rem', borderRadius: '9999px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.65rem', fontWeight: 600,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)',
                    }}>Find us</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                      Location
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {shopInfo?.address || 'HSR Layout, Bengaluru'}
                    </p>
                    {shopInfo?.address && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(shopInfo.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 0.875rem', borderRadius: '9999px',
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none',
                        }}
                      >
                        Open in Maps ↗
                      </a>
                    )}
                    {shopInfo?.phone && (
                      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Call:</span>
                        <a
                          href={`tel:${shopInfo.phone}`}
                          style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}
                        >
                          {shopInfo.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </RevealSection>

              {/* Big CTA card */}
              <RevealSection delay={250}>
                <div style={{
                  padding: '0.25rem',
                  borderRadius: '1.75rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{
                    borderRadius: 'calc(1.75rem - 4px)',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(16,185,129,0.08) 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Ready?
                    </p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>
                      Book in 60 sec.
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.25rem' }}>
                      No account needed. Just your name & phone.
                    </p>
                    <Link
                      to="/book"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '9999px',
                        background: '#fff', color: '#050505',
                        fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                        transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.transform = 'scale(0.97)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)')}
                    >
                      Book Appointment
                      <span style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.08)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}>↗</span>
                    </Link>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 1, position: 'relative',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>✂ {shopName}</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            {shopInfo?.phone}&nbsp;&nbsp;·&nbsp;&nbsp;{shopInfo?.address}
          </span>
        </div>
      </footer>

      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #050505 !important;
          color: #ffffff;
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
          border: none !important;
          outline: none !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @media (max-width: 768px) {
          .nav-hide-mobile { display: none !important; }
          .hero-section { padding: 6rem 1.25rem 3rem !important; }
          .hero-actions { width: 100% !important; margin-left: 0 !important; margin-top: 1rem !important; flex-direction: column !important; }
          .hero-actions > a { width: 100% !important; justify-content: center !important; }
          .hero-stats-grid { padding: 1rem 0.75rem !important; gap: 0.25rem !important; }
          .hero-stats-val { font-size: 0.9rem !important; }
          .bento-card { grid-column: span 12 !important; }
          #info > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
