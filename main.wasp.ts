import { app, action, page, query, route } from "@wasp.sh/spec";

import { LandingPage } from "./src/client/LandingPage" with { type: "ref" };
import { LoginPage } from "./src/client/LoginPage" with { type: "ref" };
import { BookAppointmentPage } from "./src/client/BookAppointmentPage" with { type: "ref" };
import { DashboardPage } from "./src/client/DashboardPage" with { type: "ref" };
import { AppointmentDetailPage } from "./src/client/AppointmentDetailPage" with { type: "ref" };
import { ServicesPage } from "./src/client/ServicesPage" with { type: "ref" };
import { BarbersPage } from "./src/client/BarbersPage" with { type: "ref" };
import { SettingsPage } from "./src/client/SettingsPage" with { type: "ref" };

import { getAvailableSlots, getServices, getShopInfo } from "./src/server/queries" with { type: "ref" };
import { createAppointment, sendBookingOTP } from "./src/server/actions" with { type: "ref" };
import { getAppointments, getDashboardStats, getBarbers, getAppointmentById } from "./src/server/adminQueries" with { type: "ref" };
import {
  updateAppointmentStatus,
  verifyPaymentStatus,
  createService,
  updateService,
  createBarber,
  toggleBarberActive,
  updateShopSettings,
} from "./src/server/adminActions" with { type: "ref" };

import { seedFn } from "./src/server/seed" with { type: "ref" };

export default app({
  name: "bsam",
  title: "BSAM - Barber Shop Appointment Manager",
  wasp: { version: "^0.25.0" },
  db: {
    seeds: [seedFn],
  },
  head: [
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />',
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Clash+Display:wght@700;800&amp;display=swap" rel="stylesheet" />',
  ],
  auth: {
    userEntity: "User",
    methods: {
      usernameAndPassword: {},
    },
    onAuthFailedRedirectTo: "/login",
    onAuthSucceededRedirectTo: "/dashboard",
  },
  spec: [
    route("LandingRoute", "/", page(LandingPage)),
    route("LoginRoute", "/login", page(LoginPage)),
    route("BookRoute", "/book", page(BookAppointmentPage)),
    route("DashboardRoute", "/dashboard", page(DashboardPage, { authRequired: true })),
    route("AppointmentDetailRoute", "/dashboard/appointment/:id", page(AppointmentDetailPage, { authRequired: true })),
    route("ServicesRoute", "/dashboard/services", page(ServicesPage, { authRequired: true })),
    route("BarbersRoute", "/dashboard/barbers", page(BarbersPage, { authRequired: true })),
    route("SettingsRoute", "/dashboard/settings", page(SettingsPage, { authRequired: true })),

    query(getAvailableSlots, {
      entities: ["Appointment", "ShopSettings", "Service"],
      auth: false,
    }),
    query(getServices, { entities: ["Service"], auth: false }),
    query(getShopInfo, { entities: ["ShopSettings"], auth: false }),
    action(sendBookingOTP, { entities: ["OTPVerification"], auth: false }),
    action(createAppointment, {
      entities: ["Appointment", "OTPVerification", "Service", "ShopSettings"],
      auth: false,
    }),
    query(getAppointments, {
      entities: ["Appointment", "Service", "User"],
      auth: true,
    }),
    query(getDashboardStats, {
      entities: ["Appointment", "Service"],
      auth: true,
    }),
    query(getBarbers, {
      entities: ["User"],
      auth: true,
    }),
    query(getAppointmentById, {
      entities: ["Appointment", "Service", "User"],
      auth: true,
    }),
    action(updateAppointmentStatus, {
      entities: ["Appointment"],
      auth: true,
    }),
    action(verifyPaymentStatus, {
      entities: ["Appointment"],
      auth: true,
    }),
    action(createService, {
      entities: ["Service"],
      auth: true,
    }),
    action(updateService, {
      entities: ["Service"],
      auth: true,
    }),
    action(createBarber, {
      entities: ["User"],
      auth: true,
    }),
    action(toggleBarberActive, {
      entities: ["User"],
      auth: true,
    }),
    action(updateShopSettings, {
      entities: ["ShopSettings"],
      auth: true,
    }),
  ],
});
