import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getServices, getShopInfo, getAvailableSlots } from 'wasp/client/operations';
import { createAppointment, sendBookingOTP } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';
import { DayPicker } from 'react-day-picker';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Loader2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Scissors,
} from 'lucide-react';

const FALLBACK_SERVICE_IMAGE = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop";

const STYLE = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Premium High-End Custom DayPicker Styling (Zero Mobile Overflow) */
  .rdp-root {
    --rdp-accent-color: #ffffff;
    --rdp-accent-background-color: rgba(255, 255, 255, 0.12);
    --rdp-background-color: transparent;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    margin: 0 auto;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .rdp-month {
    width: 100%;
  }
  .rdp-month_caption, .rdp-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.25rem 1rem 0.25rem;
    position: relative;
  }
  .rdp-caption_label {
    font-weight: 800;
    font-size: clamp(1rem, 4.5vw, 1.2rem);
    letter-spacing: -0.03em;
    color: #ffffff;
  }
  .rdp-nav {
    display: flex;
    gap: 0.375rem;
  }
  .rdp-button_next, .rdp-button_previous, .rdp-nav_button, .rdp-nav button {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 9999px;
    background: rgba(255,255,255,0.06);
    border: none;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 250ms cubic-bezier(0.32, 0.72, 0, 1);
  }
  .rdp-button_next:hover, .rdp-button_previous:hover, .rdp-nav_button:hover, .rdp-nav button:hover {
    background: rgba(255,255,255,0.18);
    transform: scale(1.05);
  }
  .rdp-month_grid, .rdp-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: clamp(1px, 1.2vw, 5px);
    margin-top: 0.25rem;
  }
  .rdp-weekdays, .rdp-head_row {
    display: table-row;
  }
  .rdp-weekday, .rdp-head_cell {
    font-size: clamp(0.6rem, 2.4vw, 0.7rem);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.35);
    text-align: center;
    padding-bottom: 0.5rem;
  }
  .rdp-day {
    text-align: center;
    padding: 0;
  }
  .rdp-day_button, .rdp-day button {
    width: 100%;
    max-width: 2.5rem;
    height: clamp(2rem, 9vw, 2.5rem);
    aspect-ratio: 1 / 1;
    border-radius: 0.625rem;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.85);
    font-weight: 600;
    font-size: clamp(0.75rem, 3.2vw, 0.9rem);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    cursor: pointer;
    transition: all 200ms cubic-bezier(0.32, 0.72, 0, 1);
  }
  .rdp-day_button:hover:not([aria-disabled='true']), .rdp-day button:hover:not([aria-disabled='true']) {
    background: rgba(255,255,255,0.12) !important;
    color: #ffffff !important;
    transform: scale(1.06);
  }
  .rdp-selected .rdp-day_button, .rdp-selected button, button[aria-selected='true'] {
    background: #ffffff !important;
    color: #050505 !important;
    font-weight: 800 !important;
    box-shadow: 0 0 22px rgba(255,255,255,0.4) !important;
    border: none !important;
    transform: scale(1.08);
  }
  .rdp-day_disabled, button[aria-disabled='true'] {
    opacity: 0.18;
    cursor: not-allowed !important;
    pointer-events: none;
  }
  .rdp-today:not(.rdp-selected) .rdp-day_button, .rdp-today:not(.rdp-selected) button {
    color: #10b981 !important;
    font-weight: 700 !important;
    background: rgba(16, 185, 129, 0.15);
  }

  .bsam-input {
    width: 100%; padding: 0.85rem 1.15rem; border-radius: 0.875rem;
    background: rgba(255,255,255,0.06); border: none;
    color: #fff; font-size: 0.95rem; font-family: inherit; outline: none;
    transition: background 300ms cubic-bezier(0.32,0.72,0,1);
    box-sizing: border-box;
  }
  .bsam-input:focus { background: rgba(255,255,255,0.1); }
  .bsam-input::placeholder { color: rgba(255,255,255,0.25); }
  .bsam-label {
    display: block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em;
    color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; text-transform: uppercase;
  }

  /* High-End Interactive Button Animations & Haptics */
  .bsam-btn-primary {
    width: 100%;
    padding: 0.85rem 1.5rem;
    border-radius: 9999px;
    background: #ffffff;
    color: #050505;
    font-weight: 700;
    font-size: 0.95rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 300ms cubic-bezier(0.32,0.72,0,1);
    box-shadow: 0 4px 20px rgba(255,255,255,0.15);
  }
  .bsam-btn-primary:hover {
    transform: scale(1.015);
    box-shadow: 0 6px 24px rgba(255,255,255,0.25);
  }
  .bsam-btn-primary:active {
    transform: scale(0.97);
  }
  .bsam-btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .bsam-btn-secondary {
    padding: 0.85rem 1.5rem;
    border-radius: 9999px;
    background: rgba(255,255,255,0.07);
    border: none;
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 300ms cubic-bezier(0.32,0.72,0,1);
  }
  .bsam-btn-secondary:hover {
    background: rgba(255,255,255,0.14);
    transform: scale(1.02);
  }
  .bsam-btn-secondary:active {
    transform: scale(0.97);
  }

  .bsam-icon-circle {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: rgba(5,5,5,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 300ms cubic-bezier(0.32,0.72,0,1);
  }
  .bsam-btn-primary:hover .bsam-icon-circle {
    transform: translateX(3px);
  }

  @media (max-width: 480px) {
    .bsam-container-inner {
      padding: 1rem 0.75rem !important;
    }
    .bsam-bezel-padding {
      padding: 0.875rem 0.5rem !important;
    }
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length - 1, 5);
      refs[nextIndex]?.current?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }} onPaste={handlePaste}>
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
          onPaste={handlePaste}
          style={{
            width: 'clamp(2.2rem, 11vw, 3.25rem)', height: 'clamp(2.8rem, 13vw, 3.75rem)',
            textAlign: 'center', fontSize: 'clamp(1.1rem, 5vw, 1.35rem)', fontWeight: 700,
            borderRadius: '0.875rem',
            background: digits[i] ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff', outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
            boxShadow: digits[i] ? '0 0 15px rgba(255,255,255,0.1)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

type Step = 'info' | 'service' | 'datetime' | 'payment' | 'otp';
const STEPS: Step[] = ['info', 'service', 'datetime', 'payment', 'otp'];
const STEP_LABELS = ['Your Info', 'Service', 'Date & Time', 'Token Payment', 'Confirm OTP'];

export const BookAppointmentPage = () => {
  const { data: services } = useQuery(getServices);
  const { data: shopInfo } = useQuery(getShopInfo);

  const [step, setStep] = useState<Step>('info');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
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

  const handlePhoneChange = (val: string) => {
    // Only digits, maximum 10 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(digitsOnly);
    if (error) setError('');
  };

  const validatePhone = (): boolean => {
    if (!customerPhone) {
      setError('Mobile number is required');
      return false;
    }
    if (customerPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;
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
    if (!otp || otp.length < 6) return setError('Enter the 6-digit OTP code');
    if (!selectedDate || !selectedTime || !selectedService) return setError('Booking details missing');
    if (!paymentProof.trim()) return setError('UPI Transaction ID / Reference is required');

    setLoading(true); setError('');
    try {
      const result = await createAppointment({
        customerName,
        customerPhone,
        serviceId: selectedService.id,
        date: selectedDate.toISOString(),
        startTime: selectedTime,
        paymentMethod: 'PAY_NOW',
        paymentProof: paymentProof.trim(),
        otpCode: otp,
      });
      setConfirmed(result);
    } catch (e: any) {
      setError(e.message || 'Booking failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  let closedDays: string[] = [];
  try { closedDays = JSON.parse((shopInfo as any)?.closedDays || '[]'); } catch {}
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDays = [
    { before: today },
    ...closedDays.map(d => ({ dayOfWeek: [DAYS_OF_WEEK.indexOf(d)] } as any)),
  ];

  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: '#050505',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };  if (confirmed) {
    const tokenVal = selectedService?.tokenAmount || 5000;
    const totalVal = selectedService?.price || 0;
    const balanceVal = Math.max(0, totalVal - tokenVal);

    return (
      <div style={containerStyle}>
        <style>{STYLE}</style>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center', animation: 'fadeUp 700ms cubic-bezier(0.32,0.72,0,1) forwards' }}>
            <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#10b981', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
              <Check size={36} strokeWidth={2.5} />
            </div>
            <div style={{ padding: '0.2rem', borderRadius: '1.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '1.5rem' }}>
              <div style={{ borderRadius: 'calc(1.75rem - 4px)', background: 'rgba(10,10,10,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)', padding: '1.75rem 1.25rem' }}>
                <div style={{ marginBottom: '0.375rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(16,185,129,0.9)', fontWeight: 700 }}>
                  Booking Reserved
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                  See you soon, {confirmed.customerName}!
                </h2>
                {[
                  ['Service', confirmed.service?.name],
                  ['Date', new Date(confirmed.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
                  ['Time', confirmed.startTime],
                  ['Token Paid', formatPrice(tokenVal)],
                  ['Balance at Shop', formatPrice(balanceVal)],
                  ['UPI Ref', confirmed.paymentProof || 'Submitted'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: label === 'Balance at Shop' ? '#10b981' : '#fff' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setConfirmed(null); setStep('info'); setCustomerName(''); setCustomerPhone(''); setSelectedService(null); setSelectedDate(undefined); setSelectedTime(''); setOtp(''); setOtpSent(false); setPaymentProof(''); }}
              className="bsam-btn-primary"
              style={{ width: 'auto', margin: '0 auto', padding: '0.85rem 2rem' }}
            >
              <span>Book Another</span>
              <div className="bsam-icon-circle">
                <Sparkles size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{STYLE}</style>

      {/* Ambient Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <div style={{ position: 'relative', zIndex: 10, padding: '1.25rem 1.5rem', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem', transition: 'color 200ms' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500 }}>
          Book Appointment
        </span>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          Step {stepIndex + 1} / {STEPS.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)', position: 'relative', zIndex: 10 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(139,92,246,0.8), rgba(16,185,129,0.8))',
          width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
          transition: 'width 500ms cubic-bezier(0.32,0.72,0,1)',
        }} />
      </div>

      {/* Step Indicator */}
      <div style={{ position: 'relative', zIndex: 10, padding: '1.25rem 1rem 0', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: '1.5rem', height: '1.5rem', borderRadius: '50%',
              background: i === stepIndex ? '#fff' : i < stepIndex ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700,
              color: i === stepIndex ? '#050505' : i < stepIndex ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 400ms cubic-bezier(0.32,0.72,0,1)',
            }}>
              {i < stepIndex ? <Check size={11} strokeWidth={3} /> : i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bsam-container-inner" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.75rem 1.25rem', position: 'relative', zIndex: 1, boxSizing: 'border-box', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '36rem', animation: 'slideIn 400ms cubic-bezier(0.32,0.72,0,1) forwards' }} key={step}>

          {/* Header Title */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', marginTop: '0.25rem', marginBottom: 0, fontFamily: "'Clash Display', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
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
                  onChange={e => { setCustomerName(e.target.value); if (error) setError(''); }}
                />
              </div>
              <div>
                <label className="bsam-label">Mobile Number (10 Digits)</label>
                <input
                  className="bsam-input"
                  type="tel"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={e => handlePhoneChange(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.375rem' }}>
                  A 6-digit OTP will be sent to this number to verify your appointment.
                </p>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

              <button
                onClick={() => {
                  if (!customerName.trim() || customerName.trim().length < 2) return setError('Please enter your full name (min 2 chars)');
                  if (!validatePhone()) return;
                  setError('');
                  goNext();
                }}
                className="bsam-btn-primary"
              >
                <span>Select Service</span>
                <div className="bsam-icon-circle">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Service Selection */}
          {step === 'service' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {(services || []).map(service => (
                  <div
                    key={service.id}
                    onClick={() => { setSelectedService(service); if (error) setError(''); }}
                    style={{
                      padding: '0.2rem',
                      borderRadius: '1.25rem',
                      background: selectedService?.id === service.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: 'none',
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
                      <img
                        src={service.imageUrl || FALLBACK_SERVICE_IMAGE}
                        alt={service.name}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_SERVICE_IMAGE; }}
                        style={{ width: '4.5rem', height: '4.5rem', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{service.name}</div>
                        {service.description && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{service.description}</div>}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(service.price)}</span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                            {service.durationMinutes} min
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600 }}>
                            Token: {formatPrice(service.tokenAmount)}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                        border: 'none',
                        background: selectedService?.id === service.id ? '#fff' : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#050505',
                        transition: 'all 300ms cubic-bezier(0.32,0.72,0,1)',
                      }}>
                        {selectedService?.id === service.id ? <Check size={12} strokeWidth={3} /> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} className="bsam-btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => { if (!selectedService) return setError('Please select a service'); setError(''); goNext(); }}
                  className="bsam-btn-primary"
                  style={{ flex: 1 }}
                >
                  <span>Pick Date & Time</span>
                  <div className="bsam-icon-circle">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Date & Time (High-End Responsive Calendar + Double-Bezel Slot Architecture) */}
          {step === 'datetime' && (
            <div>
              {/* Double-Bezel Calendar Enclosure (Zero Mobile Overflow) */}
              <div style={{
                padding: '0.2rem',
                borderRadius: '1.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: 'none',
                marginBottom: '1.5rem',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <div className="bsam-bezel-padding" style={{
                  borderRadius: 'calc(1.75rem - 4px)',
                  background: 'rgba(12,12,12,0.98)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={d => { setSelectedDate(d); setSelectedTime(''); if (error) setError(''); }}
                    disabled={disabledDays}
                    startMonth={new Date()}
                  />
                </div>
              </div>

              {/* Time Slots Section (High-End Agency Tier) */}
              {selectedDate && (
                <div style={{ marginBottom: '1.75rem', animation: 'fadeUp 400ms cubic-bezier(0.32,0.72,0,1) forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }} />
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(16,185,129,0.9)', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {selectedService?.durationMinutes} min slots
                    </span>
                  </div>

                  {!slots ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
                      <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Fetching live slot availability...
                    </div>
                  ) : slots.filter((s: any) => s.available).length === 0 ? (
                    <div style={{ padding: '1.75rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1.25rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                      Fully booked on this date. Please select another date above.
                    </div>
                  ) : (
                    (() => {
                      const availableList = slots.filter((s: any) => s.available);
                      const getPeriod = (t: string) => {
                        const h = parseInt(t.split(':')[0], 10);
                        if (h < 12) return 'Morning';
                        if (h < 17) return 'Afternoon';
                        return 'Evening';
                      };

                      const periods = [
                        { name: 'Morning', icon: Sun, items: availableList.filter((s: any) => getPeriod(s.time) === 'Morning') },
                        { name: 'Afternoon', icon: Sunset, items: availableList.filter((s: any) => getPeriod(s.time) === 'Afternoon') },
                        { name: 'Evening', icon: Moon, items: availableList.filter((s: any) => getPeriod(s.time) === 'Evening') },
                      ].filter(p => p.items.length > 0);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {periods.map(period => {
                            const IconComponent = period.icon;
                            return (
                              <div key={period.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                  <IconComponent size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
                                  <span>{period.name}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.5rem' }}>
                                  {period.items.map((slot: any) => {
                                    const isSelected = selectedTime === slot.time;
                                    return (
                                      <button
                                        key={slot.time}
                                        onClick={() => { setSelectedTime(slot.time); if (error) setError(''); }}
                                        style={{
                                          padding: '0.15rem',
                                          borderRadius: '0.875rem',
                                          background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.03)',
                                          border: 'none',
                                          cursor: 'pointer',
                                          transition: 'all 250ms cubic-bezier(0.32,0.72,0,1)',
                                          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                                        }}
                                      >
                                        <div style={{
                                          borderRadius: 'calc(0.875rem - 2px)',
                                          background: isSelected ? '#ffffff' : 'rgba(20,20,20,0.85)',
                                          color: isSelected ? '#050505' : 'rgba(255,255,255,0.9)',
                                          padding: '0.65rem 0.5rem',
                                          fontWeight: isSelected ? 800 : 600,
                                          fontSize: '0.85rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '0.35rem',
                                          boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.35)' : 'inset 0 1px 1px rgba(255,255,255,0.06)',
                                          transition: 'all 250ms cubic-bezier(0.32,0.72,0,1)',
                                        }}>
                                          {isSelected && <Check size={12} strokeWidth={3} />}
                                          <span>{slot.time}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} className="bsam-btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedDate) return setError('Please select an appointment date');
                    if (!selectedTime) return setError('Please select an available time slot');
                    setError('');
                    goNext();
                  }}
                  className="bsam-btn-primary"
                  style={{ flex: 1 }}
                >
                  <span>Proceed to Payment</span>
                  <div className="bsam-icon-circle">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Token Payment Only */}
          {step === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Payment Summary Box */}
              <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.04)', border: 'none' }}>
                <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: 'rgba(12,12,12,0.98)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)', padding: '1.5rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      Token Deposit Model
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={13} /> Required to Lock Slot
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Service ({selectedService?.name}):</span>
                      <span style={{ fontWeight: 600 }}>{selectedService ? formatPrice(selectedService.price) : '₹0'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: '0.5rem', borderTop: 'none' }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>Token Payable Now (UPI):</span>
                      <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.15rem' }}>
                        {selectedService ? formatPrice(selectedService.tokenAmount) : '₹50'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', paddingTop: '0.25rem' }}>
                      <span>Balance Payable at Shop:</span>
                      <span>
                        {selectedService ? formatPrice(Math.max(0, selectedService.price - selectedService.tokenAmount)) : '₹0'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                    * The token amount paid now locks your booking slot and will be fully deducted from your final bill when you pay at the shop.
                  </p>
                </div>
              </div>

              {/* UPI QR Code Container */}
              <div style={{ padding: '0.2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.04)', border: 'none' }}>
                <div style={{ borderRadius: 'calc(1.5rem - 3px)', background: '#ffffff', padding: '1.5rem', textAlign: 'center', position: 'relative', minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {(!shopInfo?.upiQrImageUrl || !qrLoaded) && (
                    <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Loader2 size={32} color="#050505" style={{ animation: 'spin 800ms linear infinite' }} />
                      <span style={{ color: 'rgba(5,5,5,0.6)', fontSize: '0.85rem', fontWeight: 600 }}>
                        Loading QR code...
                      </span>
                    </div>
                  )}
                  {shopInfo?.upiQrImageUrl && (
                    <div style={{ display: qrLoaded ? 'block' : 'none', width: '100%' }}>
                      <img
                        src={shopInfo.upiQrImageUrl}
                        alt="UPI QR Code"
                        onLoad={() => setQrLoaded(true)}
                        style={{ maxWidth: '180px', margin: '0 auto', display: 'block', borderRadius: '0.5rem' }}
                      />
                      <p style={{ color: '#050505', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 700 }}>
                        Scan with GPay / PhonePe / Paytm to Pay {selectedService ? formatPrice(selectedService.tokenAmount) : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="bsam-label">UPI Reference / Transaction ID</label>
                <input
                  className="bsam-input"
                  type="text"
                  placeholder="e.g., 123456789012 or UPI Ref ID"
                  value={paymentProof}
                  onChange={e => { setPaymentProof(e.target.value); if (error) setError(''); }}
                />
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} className="bsam-btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    if (!paymentProof.trim()) return setError('Please enter your UPI transaction ID / Reference number to continue');
                    setError('');
                    setStep('otp');
                    if (!otpSent) handleSendOtp();
                  }}
                  className="bsam-btn-primary"
                  style={{ flex: 1 }}
                >
                  <span>Verify OTP</span>
                  <div className="bsam-icon-circle">
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: OTP Verification */}
          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary */}
              <div style={{ padding: '0.2rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                <div style={{ borderRadius: 'calc(1.25rem - 3px)', background: 'rgba(12,12,12,0.95)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Booking Summary
                  </p>
                  {[
                    ['Name', customerName],
                    ['Phone', customerPhone],
                    ['Service', selectedService?.name],
                    ['Date', selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
                    ['Time', selectedTime],
                    ['Token Paid', selectedService ? formatPrice(selectedService.tokenAmount) : ''],
                    ['Balance at Shop', selectedService ? formatPrice(Math.max(0, selectedService.price - selectedService.tokenAmount)) : ''],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  OTP sent to <strong style={{ color: '#fff' }}>+91 {customerPhone}</strong>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                  Enter code (or use <strong style={{ color: '#10b981' }}>123456</strong> in dev environment)
                </p>
                <OtpInput value={otp} onChange={setOtp} />
                <button
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || loading}
                  style={{
                    marginTop: '1.25rem',
                    background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    color: resendTimer > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem', fontFamily: 'inherit', textDecoration: 'underline',
                  }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={goBack} className="bsam-btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || otp.length < 6}
                  className="bsam-btn-primary"
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking</span>
                      <div className="bsam-icon-circle">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    </>
                  )}
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
