# BSAM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Barber Shop Appointment Manager (BSAM) using Wasp, Shadcn UI, and MSG91 OTP.

**Architecture:** Wasp handles the full stack orchestration (React/Node.js/Prisma). Shadcn provides the UI components. State is stored in a local SQLite database (for demo ease).

**Tech Stack:** Wasp 0.24 (main.wasp.ts), React, Tailwind, Shadcn UI, Prisma, SQLite.

## Global Constraints

- Tech Stack: Wasp (React + Node.js + Prisma) + shadcn/ui + SQLite
- Admin Auth: Username/password via Wasp built-in Auth
- Payment: Pluggable adapter, initially Static QR Image
- Wasp DSL Syntax: Must use Wasp >=0.24 syntax (`main.wasp.ts` with `app({...})` export)
- All new files must go inside `src/` (client components to `src/client`, server logic to `src/server`)
- Do not run Wasp CLI commands directly in test steps; assume they will be run by the developer via the background dev server.

---

### Task 1: Wasp Project Initialization & Schema Definition

**Files:**
- Modify: `main.wasp.ts` (or `main.wasp` if existing)
- Modify: `schema.prisma`
- Create: `src/client/pages/LandingPage.tsx`
- Create: `src/client/pages/BookAppointmentPage.tsx`
- Create: `src/client/pages/admin/DashboardPage.tsx`
- Create: `src/client/pages/admin/LoginPage.tsx`

**Interfaces:**
- Produces: Prisma Schema models (`User`, `Service`, `Appointment`, `ShopSettings`, `OTPVerification`)
- Produces: Wasp routes for Landing (`/`), Booking (`/book`), Dashboard (`/dashboard`), Login (`/login`)

- [ ] **Step 1: Write Prisma Schema**

Open `schema.prisma` and define the data model from the design spec. You must include these models exactly as specified:

```prisma
model User {
  id          Int           @id @default(autoincrement())
  username    String        @unique
  password    String
  displayName String
  role        String        @default("BARBER") // "ADMIN" or "BARBER"
  phone       String?
  isActive    Boolean       @default(true)
  appointments Appointment[]
}

model Service {
  id              Int           @id @default(autoincrement())
  name            String
  description     String?
  imageUrl        String
  durationMinutes Int
  price           Int           // paise
  tokenAmount     Int           // paise
  isActive        Boolean       @default(true)
  sortOrder       Int           @default(0)
  appointments    Appointment[]
}

model Appointment {
  id               Int      @id @default(autoincrement())
  customerName     String
  customerPhone    String
  serviceId        Int
  service          Service  @relation(fields: [serviceId], references: [id])
  assignedBarberId Int?
  assignedBarber   User?    @relation(fields: [assignedBarberId], references: [id])
  date             DateTime
  startTime        String
  status           String   @default("PENDING") // PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  paymentMethod    String   // PAY_NOW, PAY_AT_SHOP
  paymentStatus    String   @default("UNPAID") // UNPAID, PENDING_VERIFICATION, VERIFIED, REJECTED
  paymentProof     String?  
  paymentProofType String?  // SCREENSHOT, UPI_ID
  otpVerified      Boolean  @default(false)
  createdAt        DateTime @default(now())
}

model ShopSettings {
  id                  Int     @id @default(1)
  shopName            String
  address             String
  phone               String
  openTime            String  // "09:00"
  closeTime           String  // "20:00"
  slotDurationMinutes Int     @default(30)
  upiQrImageUrl       String?
  tokenAmountDefault  Int     @default(5000)
  closedDays          String  @default("[]") // JSON string array
}

model OTPVerification {
  id        Int      @id @default(autoincrement())
  phone     String
  otpHash   String
  expiresAt DateTime
  verified  Boolean  @default(false)
  attempts  Int      @default(0)
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Create placeholder page components**

Create basic React components in `src/client/pages/`:
`LandingPage.tsx`, `BookAppointmentPage.tsx`, `admin/DashboardPage.tsx`, `admin/LoginPage.tsx`.
Each should just export a function returning a simple `<div>` with the page name.

- [ ] **Step 3: Configure `main.wasp.ts`**

Update `main.wasp.ts` to configure routing and auth (using Wasp 0.24 syntax).

```typescript
import { app, page, route } from "@wasp.sh/spec"
import { LandingPage } from "./src/client/pages/LandingPage" with { type: "ref" }
import { BookAppointmentPage } from "./src/client/pages/BookAppointmentPage" with { type: "ref" }
import { DashboardPage } from "./src/client/pages/admin/DashboardPage" with { type: "ref" }
import { LoginPage } from "./src/client/pages/admin/LoginPage" with { type: "ref" }

export default app({
  name: "bsam",
  wasp: { version: "^0.24" },
  title: "BSAM Appointment Manager",
  auth: {
    userEntity: "User",
    methods: { usernameAndPassword: {} },
    onAuthFailedRedirectTo: "/login",
  },
  spec: [
    route("LandingRoute", "/", page(LandingPage)),
    route("BookRoute", "/book", page(BookAppointmentPage)),
    route("LoginRoute", "/login", page(LoginPage)),
    route("DashboardRoute", "/dashboard", page(DashboardPage, { authRequired: true })),
  ],
})
```

- [ ] **Step 4: Commit**
```bash
git add main.wasp.ts schema.prisma src/client/pages/
git commit -m "feat: initialize wasp config and prisma schema"
```

---

### Task 2: UI Setup & Component Library

**Files:**
- Create: `src/client/components/ui/*` (via shadcn)
- Modify: `vite.config.ts`, `tailwind.config.js` (or setup standard styling)

**Interfaces:**
- Produces: Base UI components (`Button`, `Card`, `Dialog`, `Input`, `Form`), Tailwind config ready to use.

- [ ] **Step 1: Check UI Library approach**
You must run the `wasp:add-feature` skill (selecting "Styling") to correctly configure Tailwind/Shadcn per Wasp conventions.
Alternatively, if using the CLI is blocked, manually configure Vite, PostCSS, Tailwind, and run the `npx shadcn@latest init` command according to modern structural guidelines. We need: `button`, `card`, `dialog`, `input`, `label`, `form`, `calendar`.

- [ ] **Step 2: Commit UI setup**
```bash
git add tailwind.config.js postcss.config.js components.json src/
git commit -m "chore: setup tailwind and shadcn ui components"
```

---

### Task 3: Slot Generation & Server Queries

**Files:**
- Create: `src/server/queries.ts`
- Create: `src/server/utils/slots.ts`

**Interfaces:**
- Produces: `getAvailableSlots(args: { date: Date, serviceId: number })` query
- Produces: `generateSlots(date, service, appointments, shopSettings)` utility function.

- [ ] **Step 1: Write slot generation utility**

Create `src/server/utils/slots.ts` implementing the algorithm defined in the spec:
- Parse ShopSettings open/close time
- Generate base slots array based on slotDurationMinutes
- Map existing appointments blocking logic taking into account service duration (consecutive blocks)
- Drop past slots if query is for today.

- [ ] **Step 2: Write Wasp queries**

Create `src/server/queries.ts`:
- Build `getAvailableSlots`
- Build `getServices` (returns `Service[]` where `isActive == true`, sorted by `sortOrder`)
- Build `getShopInfo` (returns public fields of `ShopSettings`)

- [ ] **Step 3: Register queries in `main.wasp.ts`**

Import and add `getAvailableSlots`, `getServices`, and `getShopInfo` to the Wasp configuration block.
```typescript
import { getAvailableSlots } from "./src/server/queries" with { type: "ref" }
import { query } from "@wasp.sh/spec"

// inside app.spec[] array:
query(getAvailableSlots, { entities: ["Appointment", "ShopSettings", "Service"] })
```

- [ ] **Step 4: Commit**
```bash
git add src/server/ main.wasp.ts
git commit -m "feat: implement slot generation and public queries"
```

---

### Task 4: Public Booking UI

**Files:**
- Modify: `src/client/pages/BookAppointmentPage.tsx`
- Create: `src/client/components/booking/BookingSteps.tsx`
- Create: `src/client/components/booking/SlotPicker.tsx`

**Interfaces:**
- Consumes: UI Components, Wasp `useQuery` for services and available slots.
- Produces: The 4-step wizard before OTP/Submit.

- [ ] **Step 1: Implement the step-based wizard state**
Use a straightforward step-based state machine in React (useState mapping current step 1..5). Step 1 is User Info, Step 2 is Service selection, Step 3 is Date/Time selection, Step 4 is Payment method switch.

- [ ] **Step 2: Hook up Wasp queries**
For Step 2, use `useQuery(getServices)` to populate the grid.
For Step 3, when a date is picked, use `useQuery(getAvailableSlots, { date, serviceId })` to populate available time chips.

- [ ] **Step 3: Render Payment Slider**
For Step 4, handle local state to toggle between `PAY_NOW` and `PAY_AT_SHOP`. Render a mock QR code image if `PAY_NOW`. Include text input conditionally for UPI ID validation.

- [ ] **Step 4: Commit**
```bash
git add src/client/pages/BookAppointmentPage.tsx src/client/components/booking/
git commit -m "feat: build multipage booking form flow without OTP"
```

---

### Task 5: Payment Adapter & OTP Flow

**Files:**
- Create: `src/server/actions.ts`
- Create: `src/server/services/otp.ts`
- Create: `src/server/services/payment/StaticQrAdapter.ts`
- Modify: `src/client/pages/BookAppointmentPage.tsx`

**Interfaces:**
- Produces: Server actions `sendOTP()`, `verifyOTP()`, and `createAppointment()`.
- Produces: Interface implementation for UI components representing the static QR.

- [ ] **Step 1: Build the Payment Adapter interface**
Define `PaymentAdapter` in TS. Implement `StaticQrAdapter` representing uploading/getting UPI data. Currently, for the server, this returns "manual verification needed". (See Spec Section 7)

- [ ] **Step 2: Build the OTP Utility (Mockable)**
Create `src/server/services/otp.ts`. Create functions `generateOtp()`, `sendOtpSms(phone, code)` (can mock MSG91 or just `console.log` for now), and hash validation.

- [ ] **Step 3: Create Server Actions**
In `src/server/actions.ts`:
- `sendOTP`: Limits 3 per hr, creates OTPVerification.
- `verifyOTP`: Checks code, marks verified, returns token.
- `createAppointment`: Checks if token is verified, double-checks slot logic, then `context.entities.Appointment.create()`.

- [ ] **Step 4: Register actions in main.wasp.ts**
Expose actions using `action(name, { entities: [...] })`.

- [ ] **Step 5: Connect Step 5 UI**
Connect the booking flow step 5 to `sendOTP` and `verifyOTP`. On success, submit payload to `createAppointment`. Show success screen.

- [ ] **Step 6: Commit**
```bash
git add src/server/actions.ts src/server/services/ main.wasp.ts src/client/pages/BookAppointmentPage.tsx
git commit -m "feat: wire up OTP verification and payment flow"
```

---

### Task 6: Admin Dashboard & Permissions

**Files:**
- Modify: `src/client/pages/admin/DashboardPage.tsx`
- Modify: `src/client/pages/admin/LoginPage.tsx`
- Create: `src/server/adminQueries.ts`
- Create: `src/server/adminActions.ts`

**Interfaces:**
- Consumes: Admin Actions `updateAppointmentStatus`, `verifyPayment`. Queries `getAppointments`, `getDashboardStats`.

- [ ] **Step 1: Admin Data queries & actions**
Implement queries and actions requiring Wasp auth Context. Ensure permissions: Admin users see everything. Barber users see their own appointments (SQL check `WHERE assignedBarberId = context.user.id`).

- [ ] **Step 2: Dashboard UI**
Create lists/tables using Shadcn UI in `DashboardPage.tsx` displaying the returned data.
Create dropdowns handling updating appointment status.

- [ ] **Step 3: Registration in config**
Ensure all queries/actions added in Wasp config list the relevant models in the `entities` array.

- [ ] **Step 4: Commit**
```bash
git add src/client/pages/admin/ src/server/admin* main.wasp.ts
git commit -m "feat: complete admin dashboard overview and action controls"
```

---

### Task 7: Seed Data & Final Handoff Output documentation

**Files:**
- Create: `src/server/seed.ts`
- Modify: `main.wasp.ts`
- Create: `docs/findings/*`

- [ ] **Step 1: Write Seeder**
In `src/server/seed.ts`, wipe DB and insert one Admin user, one Barber user, one ShopSettings entity (with a placeholder QR code URL), and 2-3 Services (e.g. Haircut, Shave). 
*(Run `wasp db seed` when server is booted later to populate).*

- [ ] **Step 2: Create Findings reports**
Write out the placeholder skeleton docs specified:
`docs/findings/wasp-scaffolding-savings.md`
`docs/findings/shadcn-component-usage.md`
`docs/findings/package-integration-notes.md`
`docs/findings/boilerplate-gaps.md`
The agent executing this step should fill them with brief bulleted thoughts based on their experience running Tasks 1-6.

- [ ] **Step 3: Commit**
```bash
git add src/server/seed.ts docs/findings/ main.wasp.ts
git commit -m "feat: add db seeder and report scaffolding"
```

--- 
