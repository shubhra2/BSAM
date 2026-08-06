import React from "react";
import { useQuery } from "wasp/client/operations";
import { getServices, getShopInfo } from "wasp/client/operations";
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  UserCheck,
} from "lucide-react";

export function LandingPage() {
  const { data: services, isLoading: servicesLoading } = useQuery(getServices);
  const { data: shopInfo } = useQuery(getShopInfo);

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const defaultShopName = shopInfo?.shopName || "Royal Cut Barber Shop";
  const defaultAddress =
    shopInfo?.address || "123 Main St, HSR Layout, Bengaluru, Karnataka";
  const defaultPhone = shopInfo?.phone || "+91 9876543210";
  const openTime = shopInfo?.openTime || "09:00";
  const closeTime = shopInfo?.closeTime || "20:00";

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Sticky Header */}
      <header className="border-b border-white/8 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="tracking-tight">{defaultShopName}</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors px-3 py-2"
            >
              Staff Login
            </a>
            <a
              href="/book"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section — Immersive Gateway */}
      <section className="relative overflow-hidden min-h-screen flex items-center border-b border-white/8">
        {/* Ambient gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900" />
        {/* Amber radial glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(38_96%_50%/0.08)_0%,_transparent_60%)]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-24 lg:py-0 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mobile-First Instant Online Booking</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              The Art of
              <br />
              <span className="text-amber-400">The Perfect Cut</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Skip the long waiting lines. Reserve your preferred time slot online in under 60 seconds with instant SMS verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="/book"
                className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-base"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Your Slot Now</span>
              </a>

              <a
                href="#services"
                className="w-full sm:w-auto px-6 py-4 border border-white/8 hover:bg-neutral-900 text-neutral-300 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
              >
                <span>View Treatment Menu</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No Password Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Verified Stylists</span>
              </div>
            </div>
          </div>

          {/* Right: Floating card with image */}
          <div className="relative mx-auto max-w-md lg:max-w-none w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-white/8 bg-neutral-900/60 aspect-[4/3] sm:aspect-[16/10]">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800"
                alt="Barber Shop Interior"
                className="w-full h-full object-cover"
              />
              {/* Bottom gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

              {/* Operating Hours frosted pill */}
              <div className="absolute bottom-4 left-4 right-4 px-4 py-3 bg-neutral-900/90 border border-white/8 rounded-2xl backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400">Operating Hours</p>
                  <p className="text-sm font-bold text-white">
                    {openTime} AM – {closeTime} PM Daily
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section — Premium Menu Board */}
      <section id="services" className="py-16 border-b border-white/8 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Our Signature Services
            </h2>
            <p className="text-sm text-neutral-400">
              Crafted styling treatments tailored to elevate your personal look.
            </p>
          </div>

          {servicesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-neutral-800/40 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-neutral-900 border border-white/8 hover:border-amber-500/50 rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-neutral-950">
                    <img
                      src={
                        service.imageUrl ||
                        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500"
                      }
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 bg-neutral-950/90 backdrop-blur px-3 py-1.5 rounded-full text-amber-400 font-bold text-sm">
                      {formatINR(service.price)}
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-3 left-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                      {service.durationMinutes} mins
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {service.description || "Professional grooming service with high attention to detail."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {service.durationMinutes} mins
                      </span>
                      <a
                        href="/book"
                        className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Book This</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 text-sm">
              No services currently listed. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* Info Cards Section — Location & Shop Info */}
      <section className="py-16 border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
          {/* Location */}
          <div className="bg-neutral-900/60 border border-white/8 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Visit Our Shop</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{defaultAddress}</p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(defaultAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
            >
              <span>Open in Google Maps</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Hours */}
          <div className="bg-neutral-900/60 border border-white/8 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Shop Hours</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Monday – Sunday:{" "}
                <span className="text-white font-medium">
                  {openTime} - {closeTime}
                </span>
              </p>
              <p className="text-xs text-amber-400/90 mt-1 font-medium">
                Online bookings open 24/7
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-neutral-900/60 border border-white/8 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Contact &amp; Support</h3>
              <p className="text-xs text-neutral-400 mt-1">Call for quick inquiries:</p>
              <a
                href={`tel:${defaultPhone}`}
                className="text-sm font-bold text-white hover:text-amber-400 transition-colors block mt-0.5"
              >
                {defaultPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-white/8 text-neutral-500 text-xs">
        {/* Geometric separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Scissors className="w-4 h-4 text-amber-500" />
            <span>{defaultShopName}</span>
          </div>
          <p>© {new Date().getFullYear()} {defaultShopName}. All rights reserved.</p>
          <a href="/login" className="hover:text-neutral-300 transition-colors">
            Staff Portal
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
