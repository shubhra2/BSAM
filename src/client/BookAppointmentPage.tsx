import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getServices, getShopInfo, getAvailableSlots } from 'wasp/client/operations';
import { createAppointment, sendBookingOTP } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';
import { DayPicker } from 'react-day-picker';

const STYLE = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(32px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .rdp-root {
    --rdp-accent-color: #fff;
    --rdp-accent-background-color: rgba(255,255,255,0.15);
    --rdp-background-color: transparent;
    --rdp-selected-font: 700;
    color: #fff;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  .rdp-day_button { border-radius: 50%; }
  .rdp-root button { color: inherit; cursor: pointer; }
  .bsam-input {
    width: 100%; padding: 0.75rem 1rem; border-radius: 0.875rem;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: #fff; font-size: 0.95rem; font-family: inherit; outline: none;
    transition: border-color 300ms cubic-bezier(0.32,0.72,0,1), background 300ms;
    box-sizing: border-box;
  }
  .bsam-input:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); }
  .bsam-input::placeholder { color: rgba(255,255,255,0.25); }
  .bsam-label {
    display: block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
    color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; text-transform: uppercase;
  }
`;

const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i: number, ch: string) => {
    const d = ch.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join(''));
    if (d && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          style={{
            width: '3rem', height: '3.5rem',
            textAlign: 'center', fontSize: '1.25rem', fontWeight: 700,
            borderRadius: '0.875rem',
            background: digits[i] ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${digits[i] ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: '#fff', outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
          }}
        />
      ))}
    </div>
  );
}

type Step = 'info' | 'service' | 'datetime' | 'payment' | 'otp';
const STEPS: Step[] = ['info', 'service', 'datetime', 'payment', 'otp'];
const STEP_LABELS = ['Your Info', 'Service', 'Date & Time', 'Payment', 'Confirm'];

export const BookAppointmentPage = () => {
  const { data: services } = useQuery(getServices);
  const { data: shopInfo } = useQuery(getShopInfo);

  const [step, setStep] = useState<Step>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAY_NOW' | 'PAY_AT_SHOP'>('PAY_AT_SHOP');
  const [paymentProof, setPaymentProof] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<any>(null);

  const slotsArgs = selectedService && selectedDate
    ? { serviceId: selectedService.id, date: selectedDate.toISOString() }
    : undefined;
  const { data: slots } = useQuery(getAvailableSlots, slotsArgs as any, { enabled: !!slotsArgs });

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => setStep(STEPS[stepIndex + 1]);
  const goBack = () => { setStep(STEPS[stepIndex - 1]); setError(''); };

  const handleSendOtp = async () => {
    if (!customerPhone) return setError('Phone number required');
    setLoading(true); setError('');
    try {
      await sendBookingOTP({ phone: customerPhone });
      setOtpSent(true);
      setResendTimer(30);
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!otp || otp.length < 6) return setError('Enter the 6-digit OTP');
    if (!selectedDate || !selectedTime || !selectedService) return setError('Booking details missing');
    setLoading(true); setError('');
    try {
      const result = await createAppointment({
        customerName,
        customerPhone,
        serviceId: selectedService.id,
        date: selectedDate.toISOString(),
        startTime: selectedTime,
        paymentMethod,
        paymentProof: paymentProof || undefined,
        otpCode: otp,
      });
      setConfirmed(result);
    } catch (e: any) {
      setError(e.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  let closedDays: string[] = [];
  try { closedDays = JSON.parse((shopInfo as any)?.closedDays || '[]'); } catch {}
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const disabledDays = [
    { before: new Date() },
    ...closedDays.map(d => ({ dayOfWeek: [DAYS_OF_WEEK.indexOf(d)] } as any)),
  ];

  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: '#050505',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };

  if (confirmed) {
    return (
      <div style={containerStyle}>
        <style>{STYLE}</style>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center', animation: 'fadeUp 700ms cubic-bezier(0.32,0.72,0,1) forwards' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✓</div>
            <div style={{ padding: '0.25rem', borderRadius: '1.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem' }}>
              <div style={{ borderRadius: 'calc(1.75rem - 4px)', background: 'rgba(10,10,10,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)', padding: '2rem' }}>
                <div style={{ marginBottom: '0.375rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(16,185,129,0.8)', fontWeight: 600 }}>
                  Booking Confirmed
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                  See you soon, {confirmed.customerName}!
                </h2>
                {[
                  ['Service', confirmed.service?.name],
                  ['Date', new Date(confirmed.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })],
                  ['Time', confirmed.startTime],
                  ['Payment', confirmed.paymentMethod === 'PAY_NOW' ? 'Online (UPI)' : 'Pay at Shop'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setConfirmed(null); setStep('info'); setCustomerName(''); setCustomerPhone(''); setSelectedService(null); setSelectedDate(undefined); setSelectedTime(''); setOtp(''); setOtpSent(false); setPaymentProof(''); }}
              style={{ padding: '0.75rem 2rem', borderRadius: '9999px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{STYLE}</style>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <div style={{ position: 'relative', zIndex: 10, padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem' }}>
          ← Back
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500 }}>
          Book Appointment
        </span>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
          Step {stepIndex + 1} / {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)', position: 'relative', zIndex: 10 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(139,92,246,0.8), rgba(16,185,129,0.8))',
          width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
          transition: 'width 500ms cubic-bezier(0.32,0.72,0,1)',
        }} />
      </div>

      {/* Step indicator */}
      <div style={{ position: 'relative', zIndex: 10, padding: '1.5rem 2rem 0', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: '1.5rem', height: '1.5rem', borderRadius: '50%',
              background: i === stepIndex ? '#fff' : i < stepIndex ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${i === stepIndex ? '#fff' : i < stepIndex ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700,
              color: i === stepIndex ? '#050505' : i < stepIndex ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 400ms cubic-bezier(0.32,0.72,0,1)',
            }}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.7rem', color: i === stepIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', fontWeight: 500, display: 'none' }}>
              {STEP_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '36rem', animation: 'slideIn 400ms cubic-bezier(0.32,0.72,0,1) forwards' }} key={step}>

          {/* Step header */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', marginTop: '0.25rem', marginBottom: 0 }}>
              {STEP_LABELS[stepIndex]}
            </h2>
          </div>

          {/* STEP 1: Info */}
          {step === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="bsam-label">Full Name</label>
                <input
                  className="bsam-input"
                  type="text"
                  placeholder="e.g., Rahul Kumar"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="bsam-label">Mobile Number</label>
                <input
                  className="bsam-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.375rem' }}>
                  You'll receive an OTP on this number to confirm your booking.
                </p>
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
              <button
                onClick={() => {
                  if (!customerName.trim() || customerName.trim().length < 2) return setError('Please enter your full name (min 2 chars)');
                  if (!customerPhone.trim()) return setError('Phone number is required');
                  setError('');
                  goNext();
                }}
                style={{
                  padding: '0.875rem', borderRadius: '9999px',
                  background: '#fff', color: '#050505',
                  fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                  transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2: Service */}
          {step === 'service' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {(services || []).map(service => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    style={{
                      padding: '0.2rem',
                      borderRadius: '1.25rem',
                      background: selectedService?.id === service.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedService?.id === service.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 300ms cubic-bezier(0.32,0.72,0,1)',
                    }}
                  >
                    <div style={{
                      borderRadius: 'calc(1.25rem - 3px)',
                      background: 'rgba(12,12,12,0.9)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                      overflow: 'hidden',
                    }}>
                      {service.imageUrl && (
                        <img src={service.imageUrl} alt={service.name} style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{service.name}</div>
                        {service.description && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>{service.description}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(service.price)}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                            {service.durationMinutes} min
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(139,92,246,0.15)', color: 'rgba(139,92,246,0.9)' }}>
                            Token: {formatPrice(service.tokenAmount)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${selectedService?.id === service.id ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                        background: selectedService?.id === service.id ? '#fff' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: '#050505',
                        transition: 'all 300ms cubic-bezier(0.32,0.72,0,1)',
                      }}>
                        {selectedService?.id === service.id ? '✓' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} style={{ padding: '0.875rem 1.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 300ms' }}>← Back</button>
                <button
                  onClick={() => { if (!selectedService) return setError('Please select a service'); setError(''); goNext(); }}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '9999px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Date & Time */}
          {step === 'datetime' && (
            <div>
              <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem' }}>
                <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: 'rgba(12,12,12,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={d => { setSelectedDate(d); setSelectedTime(''); }}
                    disabled={disabledDays}
                    startMonth={new Date()}
                  />
                </div>
              </div>

              {selectedDate && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Available times for {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  {!slots ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Loading slots...</p>
                  ) : slots.filter((s: any) => s.available).length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No slots available for this date.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {slots.filter((s: any) => s.available).map((slot: any) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            background: selectedTime === slot.time ? '#fff' : 'rgba(255,255,255,0.07)',
                            border: `1px solid ${selectedTime === slot.time ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                            color: selectedTime === slot.time ? '#050505' : 'rgba(255,255,255,0.7)',
                            fontWeight: 600, fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
                            fontFamily: 'inherit',
                          }}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} style={{ padding: '0.875rem 1.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={() => { if (!selectedDate) return setError('Please pick a date'); if (!selectedTime) return setError('Please pick a time slot'); setError(''); goNext(); }}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '9999px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {step === 'payment' && (
            <div>
              {/* Toggle */}
              <div style={{ padding: '0.25rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-flex', marginBottom: '1.5rem', width: '100%' }}>
                {(['PAY_AT_SHOP', 'PAY_NOW'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 'calc(9999px - 2px)',
                      background: paymentMethod === m ? '#fff' : 'transparent',
                      color: paymentMethod === m ? '#050505' : 'rgba(255,255,255,0.5)',
                      fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 400ms cubic-bezier(0.32,0.72,0,1)',
                    }}
                  >
                    {m === 'PAY_AT_SHOP' ? '🏪 Pay at Shop' : '📱 Pay Now (UPI)'}
                  </button>
                ))}
              </div>

              {paymentMethod === 'PAY_AT_SHOP' ? (
                <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.5rem' }}>
                  <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: 'rgba(12,12,12,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem', textAlign: 'center' }}>🏪</div>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                      A token of <strong style={{ color: '#fff' }}>{selectedService ? formatPrice(selectedService.tokenAmount) : '₹50'}</strong> will be collected at the shop and deducted from your total bill of <strong style={{ color: '#fff' }}>{selectedService ? formatPrice(selectedService.price) : ''}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  {shopInfo?.upiQrImageUrl && (
                    <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem' }}>
                      <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: '#fff', padding: '1.5rem', textAlign: 'center' }}>
                        <img src={shopInfo.upiQrImageUrl} alt="UPI QR Code" style={{ maxWidth: '200px', margin: '0 auto', display: 'block' }} />
                        <p style={{ color: '#050505', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
                          Scan & pay {selectedService ? formatPrice(selectedService.tokenAmount) : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="bsam-label">UPI Transaction ID / Reference</label>
                    <input
                      className="bsam-input"
                      type="text"
                      placeholder="e.g., 123456789012 or UPI Ref ID"
                      value={paymentProof}
                      onChange={e => setPaymentProof(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} style={{ padding: '0.875rem 1.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={() => {
                    if (paymentMethod === 'PAY_NOW' && !paymentProof.trim()) return setError('Please enter your UPI transaction ID after payment');
                    setError('');
                    setStep('otp');
                    if (!otpSent) handleSendOtp();
                  }}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '9999px', background: '#fff', color: '#050505', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: OTP */}
          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary */}
              <div style={{ padding: '0.2rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(12,12,12,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Booking Summary
                  </p>
                  {[
                    ['Service', selectedService?.name],
                    ['Date', selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
                    ['Time', selectedTime],
                    ['Price', selectedService ? formatPrice(selectedService.price) : ''],
                    ['Payment', paymentMethod === 'PAY_NOW' ? 'UPI (Paid)' : 'Pay at Shop'],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  OTP sent to <strong style={{ color: '#fff' }}>{customerPhone}</strong>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                  Enter the 6-digit code to confirm your booking
                </p>
                <OtpInput value={otp} onChange={setOtp} />
                <button
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || loading}
                  style={{
                    marginTop: '1rem',
                    background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    color: resendTimer > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.8rem', fontFamily: 'inherit', textDecoration: 'underline',
                  }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} style={{ padding: '0.875rem 1.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || otp.length < 6}
                  style={{
                    flex: 1, padding: '0.875rem', borderRadius: '9999px',
                    background: loading || otp.length < 6 ? 'rgba(255,255,255,0.2)' : '#fff',
                    color: '#050505', fontWeight: 700, fontSize: '0.95rem',
                    border: 'none', cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#050505', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Confirming...
                    </>
                  ) : 'Confirm Booking ✓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
