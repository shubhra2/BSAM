import { app, page, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { LandingPage } from "./src/client/pages/LandingPage" with { type: "ref" };
import { BookAppointmentPage } from "./src/client/pages/BookAppointmentPage" with { type: "ref" };
import { LoginPage } from "./src/client/pages/admin/LoginPage" with { type: "ref" };
import { DashboardPage } from "./src/client/pages/admin/DashboardPage" with { type: "ref" };

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
    route("DashboardRoute", "/dashboard", page(DashboardPage), { authRequired: true }),
  ],
});
