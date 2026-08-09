import { app, action, query } from "@wasp.sh/spec";

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

import { seedFn } from "./src/server/seed" with { type: "ref" };

export default app({
  name: "bsam",
  title: "BSAM - Barber Shop Appointment Manager",
  wasp: { version: "^0.25.0" },
  db: {
    seeds: [seedFn],
  },
  auth: {
    userEntity: "User",
    methods: {
      usernameAndPassword: {},
    },
    onAuthFailedRedirectTo: "/login",
  },
  spec: [
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
