import React, { useState } from "react";
import { useQuery } from "wasp/client/operations";
import { getServices, getShopInfo } from "wasp/client/operations";
import { sendBookingOTP, createAppointment } from "wasp/client/operations";
import { BookingSteps } from "../components/booking/BookingSteps";
import { SlotPicker } from "../components/booking/SlotPicker";
import {
  Scissors,
  User,
  Phone,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const STEPS = ["Details", "Service", "Time", "Payment", "Verify & Book"];

export function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PAY_NOW" | "PAY_AT_SHOP">("PAY_NOW");
  const [paymentProof, setPaymentProof] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // UI state
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Queries
  const { data: services, isLoading: servicesLoading } = useQuery(getServices);
  const { data: shopInfo } = useQuery(getShopInfo);

  const selectedService = services?.find((s) => s.id === selectedServiceId);

  // Formatting helper
  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    setCurrentStep(2);
  };

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setIsSendingOtp(true);
    try {
      await sendBookingOTP({ phone: customerPhone });
      setOtpSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedServiceId || !selectedDate || !selectedSlot) {
      setErrorMessage("Missing booking details. Please review your selection.");
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage("Please enter the OTP sent to your mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = await createAppointment({
        customerName,
        customerPhone,
        serviceId: selectedServiceId,
        date: selectedDate,
        startTime: selectedSlot,
        paymentMethod,
        paymentProof: paymentMethod === "PAY_NOW" ? paymentProof : undefined,
        otpCode,
      });

      setBookingSuccess(appointment);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete appointment booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Appointment Confirmed!</h2>
            <p className="text-sm text-slate-400">
              We look forward to styling you. A confirmation SMS has been dispatched.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 text-left space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Customer</span>
              <span className="font-semibold text-white">{bookingSuccess.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Service</span>
              <span className="font-semibold text-white">{bookingSuccess.service?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Date & Time</span>
              <span className="font-semibold text-emerald-400">
                {bookingSuccess.date ? new Date(bookingSuccess.date).toLocaleDateString("en-IN") : ""}{" "}
                at {bookingSuccess.startTime}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Payment Option</span>
              <span className="font-medium text-slate-200">
                {bookingSuccess.paymentMethod === "PAY_NOW" ? "UPI Token Paid" : "Pay at Shop"}
              </span>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Scissors className="w-5 h-5 text-amber-500" />
            <span>BSAM</span>
          </a>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick Booking
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <BookingSteps currentStep={currentStep} steps={STEPS} />

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" /> Customer Details
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  No account registration needed. Just your name and mobile number.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Mobile Number (India)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <span>Continue to Select Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Service Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-500" /> Select Service
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Choose the grooming treatment you require.
                </p>
              </div>

              {servicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid gap-3">
                  {services.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="space-y-1">
                          <h3 className="font-semibold text-white text-base">{service.name}</h3>
                          {service.description && (
                            <p className="text-xs text-slate-400">{service.description}</p>
                          )}
                          <div className="text-xs text-amber-400/90 font-medium">
                            Duration: {service.durationMinutes} mins
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="text-lg font-bold text-white">
                            {formatINR(service.price)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Token: {formatINR(service.tokenAmount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No services currently listed.</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="button"
                  disabled={!selectedServiceId}
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <span>Select Time Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Slot Picker */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" /> Choose Date & Slot
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Pick an open appointment time for {selectedService?.name}.
                </p>
              </div>

              {selectedServiceId && (
                <SlotPicker
                  date={selectedDate}
                  setDate={setSelectedDate}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                  serviceId={selectedServiceId}
                />
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Selector */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-500" /> Payment Option
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Pay token money via UPI QR to lock your slot, or pay directly at shop.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAY_NOW")}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    paymentMethod === "PAY_NOW"
                      ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold text-sm text-white">Pay Token via UPI</div>
                  <div className="text-xs text-amber-400 mt-1 font-semibold">
                    {selectedService ? formatINR(selectedService.tokenAmount) : "₹50"} Token
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Scan UPI QR & confirm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAY_AT_SHOP")}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    paymentMethod === "PAY_AT_SHOP"
                      ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold text-sm text-white">Pay at Shop</div>
                  <div className="text-xs text-slate-300 mt-1 font-semibold">Full Price</div>
                  <p className="text-[11px] text-slate-400 mt-1">Pay when you arrive</p>
                </button>
              </div>

              {paymentMethod === "PAY_NOW" && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Scan using any UPI App (GPay, PhonePe, Paytm):
                  </p>
                  <div className="bg-white p-3 inline-block rounded-xl mx-auto shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `upi://pay?pa=${encodeURIComponent(
                          shopInfo?.phone || "barbershop@upi"
                        )}&pn=${encodeURIComponent(
                          shopInfo?.shopName || "BSAM Barber Shop"
                        )}&am=${(
                          (selectedService?.tokenAmount || 5000) / 100
                        ).toFixed(2)}&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 block text-left">
                      UPI Ref / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 329104810294"
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(5);
                    handleSendOtp();
                  }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <span>Verify Mobile & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: OTP Verification & Submit */}
          {currentStep === 5 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Enter OTP Code
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a 6-digit OTP code to <span className="text-white font-medium">{customerPhone}</span>.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-2xl font-mono tracking-widest text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleSendOtp}
                    className="text-amber-400 hover:underline disabled:opacity-50 font-medium"
                  >
                    {isSendingOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white border-b border-slate-800 pb-2 mb-2">
                  Booking Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="text-white font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slot:</span>
                  <span className="text-amber-400 font-medium">
                    {selectedDate} at {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="text-slate-200">
                    {paymentMethod === "PAY_NOW" ? "UPI Token" : "Pay at Shop"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !otpCode}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Book Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BSAM. Barber Shop Appointment Manager.
      </footer>
    </div>
  );
}

export default BookAppointmentPage;
