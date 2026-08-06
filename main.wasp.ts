import { app, action, page, query, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { LandingPage } from "./src/client/pages/LandingPage" with { type: "ref" };
import { BookAppointmentPage } from "./src/client/pages/BookAppointmentPage" with { type: "ref" };
import { LoginPage } from "./src/client/pages/admin/LoginPage" with { type: "ref" };
import { DashboardPage } from "./src/client/pages/admin/DashboardPage" with { type: "ref" };
import { getAvailableSlots, getServices, getShopInfo } from "./src/server/queries" with { type: "ref" };
import { createAppointment, sendBookingOTP } from "./src/server/actions" with { type: "ref" };
import { getAppointments, getDashboardStats, getBarbers } from "./src/server/adminQueries" with { type: "ref" };
import {
  updateAppointmentStatus,
  verifyPaymentStatus,
  createService,
  updateService,
  createBarber,
  toggleBarberActive,
  updateShopSettings,
} from "./src/server/adminActions" with { type: "ref" };

export default app({
  name: "bsam",
  title: "BSAM - Barber Shop Appointment Manager",
  wasp: { version: "^0.24.0" },
  auth: {
    userEntity: "User",
    methods: {
      usernameAndPassword: {},
    },
    onAuthFailedRedirectTo: "/login",
  },
  client: {
    rootComponent: App,
  },
  spec: [
    route("LandingRoute", "/", page(LandingPage)),
    route("BookRoute", "/book", page(BookAppointmentPage)),
    route("LoginRoute", "/login", page(LoginPage)),
    route("DashboardRoute", "/dashboard", page(DashboardPage, { authRequired: true })),
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
