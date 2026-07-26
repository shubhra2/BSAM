# BSAM — Barber Shop Appointment Manager: Design Specification

**Date:** 2026-07-26
**Status:** Draft

---

## 1. Overview

BSAM is a mobile-first web application for a single barber shop to accept customer appointments online with minimal friction. Customers book without creating an account (name + phone + SMS OTP). The shop owner (Admin) and helping barbers manage appointments through an authenticated dashboard.

**Secondary goal:** Demonstrate that leveraging existing boilerplates (Wasp framework), UI component libraries (shadcn/ui), and third-party packages reduces AI agent token usage compared to building from scratch.

---

## 2. Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | **Wasp** (React + Node.js + Prisma) | Full-stack scaffolding, routing, auth, server actions/queries |
| UI Components | **shadcn/ui** (Tailwind CSS) | Pre-built accessible mobile-friendly components |
| Calendar | **react-day-picker** (via shadcn Calendar) | Date selection |
| Forms | **react-hook-form + zod** (via shadcn Form) | Validation |
| Phone input | **react-phone-number-input** | Indian phone format |
| Icons | **lucide-react** (via shadcn) | Icon set |
| Date utilities | **date-fns** | Slot generation, formatting |
| Database | **SQLite** (via Prisma) | File-based, zero config |
| SMS OTP | **MSG91** | Customer phone verification |
| Payment | **Static UPI QR** (pluggable adapter) | Token payment collection |
| Hosting | **Render.com** (free tier) | Deployment |

### Wasp Plugin

The project uses the Wasp Claude Code plugin (v1.3.0) which provides skills for:
- `wasp-plugin-init` — project initialization with best practices
- `add-feature` — auth, database, styling, email config
- `start-dev-server` — background dev server with log visibility
- `deploying-app` — Railway/Fly.io deployment (we'll adapt for Render)
- `expert-advice` — Wasp-specific guidance

---

## 3. Architecture

```
┌─────────────────────────────────────────────────┐
│                  BSAM (Wasp App)                │
│                                                 │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │  Public Side  │    │    Admin Dashboard     │ │
│  │              │    │                        │ │
│  │ • Landing    │    │ • View appointments    │ │
│  │ • Book appt  │    │ • Assign to barbers    │ │
│  │ • OTP verify │    │ • Manage services      │ │
│  │ • UPI pay    │    │ • Manage barbers       │ │
│  └──────┬───────┘    │ • Shop settings        │ │
│         │            └───────────┬────────────┘ │
│         │                        │              │
│  ┌──────▼────────────────────────▼──────────┐   │
│  │           Wasp Server (Node.js)           │   │
│  │  Actions: createAppointment, verifyOTP,   │   │
│  │           assignBarber, manageServices     │   │
│  │  Queries: getAppointments, getServices,   │   │
│  │           getAvailableSlots, getBarbers    │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                           │
│  ┌──────────────────▼───────────────────────┐   │
│  │        Prisma ORM + SQLite DB            │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  External:  MSG91 (SMS OTP)                     │
│             Static UPI QR (uploaded image)       │
└─────────────────────────────────────────────────┘
```

**Separation of concerns:**
- **Wasp** owns: project structure, routing, auth, server actions/queries, Prisma schema, build pipeline
- **shadcn/ui** owns: all UI components (buttons, cards, dialogs, forms, calendar, selects, etc.)
- **Custom code** owns: appointment business logic, slot generation, payment adapter, OTP integration, service/barber management

---

## 4. Data Model

### User (Wasp auth entity, extended)

| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | PK |
| username | String | Login credential |
| password | String (hashed) | Wasp-managed |
| displayName | String | Shown in UI |
| role | Enum: ADMIN, BARBER | Access control |
| phone | String? | Optional contact |
| isActive | Boolean | Soft delete |

### Service

| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | PK |
| name | String | e.g., "Haircut + Beard Trim" |
| description | String? | Optional details |
| imageUrl | String | Service image for selector |
| durationMinutes | Int | e.g., 30 |
| price | Int | Full price in paise (₹300 = 30000) |
| tokenAmount | Int | Deposit in paise (₹50 = 5000) |
| isActive | Boolean | Soft delete |
| sortOrder | Int | Display ordering |

### Appointment

| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | PK |
| customerName | String | |
| customerPhone | String | Indian format |
| serviceId | Int → Service | FK |
| assignedBarberId | Int? → User | FK, nullable (unassigned) |
| date | DateTime | Appointment date |
| startTime | String | e.g., "10:30" |
| status | Enum: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW | |
| paymentMethod | Enum: PAY_NOW, PAY_AT_SHOP | |
| paymentStatus | Enum: UNPAID, PENDING_VERIFICATION, VERIFIED, REJECTED | |
| paymentProof | String? | Screenshot URL or UPI ID |
| paymentProofType | Enum: SCREENSHOT, UPI_ID | Null if PAY_AT_SHOP |
| otpVerified | Boolean | Must be true for valid booking |
| createdAt | DateTime | Auto |

### ShopSettings (singleton)

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Always 1 |
| shopName | String | |
| address | String | |
| phone | String | |
| openTime | String | e.g., "09:00" |
| closeTime | String | e.g., "20:00" |
| slotDurationMinutes | Int | Default 30 |
| upiQrImageUrl | String? | Uploaded QR image path |
| tokenAmountDefault | Int | Default token in paise |
| closedDays | String | JSON array, e.g., '["Monday"]' |

### OTPVerification (transient)

| Field | Type | Notes |
|-------|------|-------|
| id | Int (auto) | PK |
| phone | String | |
| otpHash | String | Hashed OTP |
| expiresAt | DateTime | 5 min from creation |
| verified | Boolean | |
| attempts | Int | Max 3 |
| createdAt | DateTime | |

---

## 5. User Flows

### 5.1 Public: Booking Flow

**Route:** `/book` — multi-step form, single page with animated step transitions

**Step 1: Your Info**
- Name input (required, min 2 chars)
- Phone input with +91 prefix (react-phone-number-input, validates Indian format: 10 digits starting with 6-9)

**Step 2: Pick Service**
- Visual card grid with service images
- Tap to select (single selection)
- Shows price and duration on each card
- Cards sourced from `Service` table (active only)

**Step 3: Pick Date & Time**
- `react-day-picker` calendar component
- Disables: past dates, closed days (from ShopSettings)
- Below calendar: horizontal scrollable list of available time slot chips
- Slots calculated from ShopSettings open/close time minus booked appointments
- Tapping a slot selects it (highlighted state)

**Step 4: Payment Choice**
- Animated slider toggle: "Pay Now" ↔ "Pay at Shop"
- **If Pay Now:**
  - Display static UPI QR code image (from ShopSettings)
  - Instructions: "Scan & pay ₹{tokenAmount}"
  - After payment: input for screenshot upload OR UPI transaction ID
  - Screenshot: file upload (max 5 MB, JPEG/PNG)
  - UPI ID: text input with format validation
- **If Pay at Shop:**
  - Info card: "₹{tokenAmount} token will be collected at the shop and deducted from your ₹{price} bill"

**Step 5: Verify & Confirm**
- SMS OTP sent to the phone number entered in Step 1 (via MSG91)
- 6-digit OTP input with auto-focus moving between digits
- "Resend OTP" button (disabled for 30 seconds, max 3 resends per hour)
- On successful verification: appointment created
- Confirmation card shown with all details + "Book Another" option

### 5.2 Public: Landing Page

**Route:** `/`

- Hero: shop name, tagline, atmospheric image
- Services section: cards with images, names, prices
- Shop info: address (Google Maps link), phone, hours, closed days
- CTA button: "Book Now" → `/book`
- Footer: shop contact info

### 5.3 Admin: Login

**Route:** `/login`

- Wasp's built-in username/password auth form
- On success: redirect to `/dashboard`

### 5.4 Admin: Dashboard Home

**Route:** `/dashboard`

- Today's appointments (card list, sorted by time)
- Quick stats row: today's total, pending verifications, upcoming this week
- Filter controls: date picker, barber dropdown, status dropdown
- Each appointment card shows: time, customer name, service, barber (or "Unassigned"), status badge, payment status badge
- Tap card → appointment detail

### 5.5 Admin: Appointment Detail

**Route:** `/dashboard/appointment/:id`

- Full appointment info
- **Assign barber:** dropdown of active barbers
- **Change status:** PENDING → CONFIRMED → COMPLETED (or CANCELLED / NO_SHOW)
- **Payment verification:** if PAY_NOW:
  - Show payment proof (screenshot image or UPI ID text)
  - "Verify" / "Reject" buttons → updates paymentStatus

### 5.6 Admin: Services Management

**Route:** `/dashboard/services`

- List of services (cards with image, name, price, duration, token amount)
- "Add Service" button → dialog/sheet with form
- Edit/deactivate existing services
- Image upload for service pictures

### 5.7 Admin: Barber Management

**Route:** `/dashboard/barbers`

- List of barbers with name, phone, active status
- "Add Barber" → creates new User with BARBER role
- Activate/deactivate toggle

### 5.8 Admin: Shop Settings

**Route:** `/dashboard/settings`

- Edit shop name, address, phone
- Open/close time pickers
- Slot duration (dropdown: 15/20/30/45/60 min)
- Closed days (multi-select checkboxes for days of week)
- Upload/replace UPI QR image

### 5.9 Barber: Restricted Dashboard

Barbers log in with the same `/login` page but see a filtered dashboard:
- Only their assigned appointments
- Can update appointment status (CONFIRMED → COMPLETED, etc.)
- Cannot access: Services, Barbers, or Settings pages
- Navigation only shows: "My Appointments"

---

## 6. Server Actions & Queries

### Public Actions (no auth required)

| Action | Input | Output | Notes |
|--------|-------|--------|-------|
| `sendOTP` | phone: string | { success: boolean } | Calls MSG91, stores OTP hash in OTPVerification |
| `verifyOTP` | phone: string, code: string | { token: string } | Returns one-time verification token |
| `createAppointment` | name, phone, serviceId, date, startTime, paymentMethod, paymentProof?, paymentProofType?, otpToken | Appointment | Validates OTP token, checks slot availability (server-side), creates appointment |

### Public Queries (no auth required)

| Query | Input | Output | Notes |
|-------|-------|--------|-------|
| `getActiveServices` | — | Service[] | Only isActive=true, sorted by sortOrder |
| `getAvailableSlots` | date: Date, serviceId: Int | string[] | Generates slots from ShopSettings, subtracts booked (accounting for service durations) |
| `getShopInfo` | — | ShopSettings (partial) | Public fields only (name, address, phone, hours, QR image) |

### Admin Actions (auth required, role check)

| Action | Input | Output | Notes |
|--------|-------|--------|-------|
| `assignBarber` | appointmentId, barberId | Appointment | Admin only |
| `updateAppointmentStatus` | appointmentId, status | Appointment | Admin: any appointment. Barber: own only |
| `verifyPayment` | appointmentId, status (VERIFIED/REJECTED) | Appointment | Admin only |
| `createService` | name, description, imageUrl, duration, price, tokenAmount | Service | Admin only |
| `updateService` | serviceId, fields | Service | Admin only |
| `createBarber` | username, password, displayName, phone | User | Admin only |
| `toggleBarberActive` | barberId, isActive | User | Admin only |
| `updateShopSettings` | fields | ShopSettings | Admin only |

### Admin Queries (auth required, role check)

| Query | Input | Output | Notes |
|-------|-------|--------|-------|
| `getAppointments` | filters (date?, barberId?, status?) | Appointment[] | Admin: all. Barber: own only |
| `getAppointmentById` | appointmentId | Appointment | Admin: any. Barber: own only |
| `getBarbers` | — | User[] | Admin only |
| `getDashboardStats` | — | { todayCount, pendingVerifications, weekUpcoming } | Admin only |
| `getShopSettings` | — | ShopSettings | Admin only (full settings) |

---

## 7. Payment Adapter Pattern

```typescript
// Port (interface)
interface PaymentAdapter {
  // Returns the UI to display for payment (QR code, deep link, etc.)
  getPaymentDisplay(amount: number): PaymentDisplayConfig

  // Returns the UI for proof collection (screenshot upload, UPI ID, etc.)
  getProofInput(): ProofInputConfig

  // Server-side: validates payment proof
  verifyPayment(proof: PaymentProof): Promise<VerificationResult>
}

type PaymentDisplayConfig = {
  type: 'qr_image' | 'deep_link' | 'gateway_redirect'
  content: string  // image URL, UPI link, or redirect URL
  instructions: string
}

type ProofInputConfig = {
  type: 'screenshot' | 'upi_id' | 'automatic'
  label: string
}

type PaymentProof = {
  type: 'screenshot' | 'upi_id' | 'transaction_id'
  value: string  // file URL, UPI ID string, or gateway transaction ID
}

type VerificationResult = {
  verified: boolean
  method: 'manual' | 'automatic'  // Static QR = manual, Razorpay = automatic
  details?: string
}
```

**Initial adapter: StaticQRAdapter**
- `getPaymentDisplay()` → returns the uploaded QR image URL from ShopSettings
- `getProofInput()` → returns screenshot upload + UPI ID input options
- `verifyPayment()` → returns `{ verified: false, method: 'manual' }` (admin verifies manually)

**Future adapters:** RazorpayAdapter, UPIDeepLinkAdapter

---

## 8. OTP Flow

1. Customer enters phone in booking Step 1
2. On Step 5, client calls `sendOTP(phone)` action
3. Server:
   - Rate-limit check: max 3 OTPs per phone per hour
   - Generate 6-digit OTP
   - Hash it (SHA-256 + salt)
   - Store in `OTPVerification` table with 5-minute expiry
   - Call MSG91 API to send SMS
4. Client shows 6-digit input with auto-advancing focus
5. Customer enters OTP, client calls `verifyOTP(phone, code)`
6. Server:
   - Find latest unexpired, unverified OTP for that phone
   - Compare hash
   - If match: mark verified, return one-time token (UUID)
   - If mismatch: increment attempts, reject after 3 failed attempts
7. Client calls `createAppointment(...)` with the OTP token
8. Server validates token exists and is recent (< 10 min), creates appointment

---

## 9. Slot Generation Logic

```
function getAvailableSlots(date, serviceId, shopSettings, existingAppointments):
  1. Check if date is a closed day → return []
  2. Parse openTime and closeTime
  3. Generate all slots from openTime to closeTime at slotDurationMinutes intervals
     e.g., 09:00, 09:30, 10:00, ..., 19:30 (for 30-min slots, 09:00-20:00)
  4. Get all appointments for that date (with their service durations)
  5. For each appointment: calculate which slots it occupies based on its
     service's durationMinutes (e.g., a 60-min service at 10:00 blocks
     10:00 AND 10:30 for 30-min base slots)
  6. Look up the selected service's durationMinutes to determine how many
     consecutive slots the new booking needs
  7. Remove any slot where the required consecutive slots are not all free
  8. If date is today: remove slots in the past
  9. Return remaining slots as string array
```

---

## 10. Role-Based Access Control

| Resource | Public | Barber | Admin |
|----------|--------|--------|-------|
| Landing page | ✅ | ✅ | ✅ |
| Booking flow | ✅ | ✅ | ✅ |
| Dashboard home | ❌ | ✅ (own) | ✅ (all) |
| Appointment detail | ❌ | ✅ (own) | ✅ (all) |
| Services management | ❌ | ❌ | ✅ |
| Barber management | ❌ | ❌ | ✅ |
| Shop settings | ❌ | ❌ | ✅ |

Enforced at:
- **Route level:** Wasp route definitions with `authRequired: true` for dashboard pages
- **Query/Action level:** Server-side role checks in every query/action function
- **UI level:** Navigation menu items hidden based on role

---

## 11. Error Handling

| Scenario | Handling |
|----------|----------|
| Double booking (race condition) | Server checks slot availability in `createAppointment` within a transaction. Returns error if taken. |
| OTP expired | 5-minute TTL. Show "OTP expired" with resend button. |
| OTP rate limit exceeded | Max 3 per phone per hour. Show "Too many attempts, try later." |
| Invalid phone format | Client-side: react-phone-number-input validates Indian format. Server-side: zod schema rejects non-Indian numbers. |
| Payment screenshot too large | Client: max 5 MB, JPEG/PNG only. Server: reject larger files. |
| Closed day selected | Calendar disables closed days. Server also rejects. |
| Service deactivated with future appointments | Soft-delete: `isActive=false`. Existing appointments unchanged, no new bookings. |
| Barber deactivated with assignments | Admin warned. Future appointments unassigned. |
| No barbers in system | Appointments created as unassigned. Admin assigns later. |

---

## 12. Testing Strategy

| Layer | What | Tool |
|-------|------|------|
| Data validation | Zod schemas (appointment, phone, service) | vitest unit tests |
| Slot generation | Time math, booked slot removal, closed days | vitest unit tests |
| OTP flow | Send/verify/expiry/rate-limit (mocked MSG91) | vitest integration tests |
| Payment adapter | Interface contract, StaticQR adapter | vitest unit tests |
| Role-based access | Admin/barber/public permission boundaries | vitest integration tests |
| E2E booking flow | Full booking: info → service → date → pay → OTP → confirm | Manual via Chrome DevTools MCP |
| UI responsiveness | Mobile-first layout on various screen sizes | Visual via Chrome DevTools MCP |

---

## 13. File Structure (Expected)

```
BSAM/
├── main.wasp                    # Wasp config (routes, auth, entities, actions, queries)
├── schema.prisma                # Prisma schema (models)
├── src/
│   ├── client/                  # React frontend
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── booking/         # Booking flow step components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   └── common/          # Shared components (header, footer, etc.)
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── BookAppointment.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AppointmentDetail.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Barbers.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities, payment adapter client
│   │   └── App.tsx
│   └── server/                  # Node.js backend
│       ├── actions/             # Wasp actions
│       ├── queries/             # Wasp queries
│       ├── services/            # Business logic
│       │   ├── otp.ts           # MSG91 integration
│       │   ├── slots.ts         # Slot generation
│       │   └── payment/         # Payment adapters
│       │       ├── adapter.ts   # Interface
│       │       └── staticQr.ts  # Static QR adapter
│       └── utils/
├── public/                      # Static assets
│   └── uploads/                 # UPI QR images, service images, payment screenshots
├── .env.server                  # MSG91 API key, etc.
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-07-26-bsam-design.md  # This file
```

---

## 14. Deployment

**Target:** Render.com free tier

**Setup:**
1. Push to GitHub repository
2. Connect Render to the repo
3. Render builds the Docker image (Wasp can generate a Dockerfile via `wasp build`; the output Docker image may need a custom Render `render.yaml` or manual Dockerfile since Wasp's native CLI deploy only supports Railway/Fly.io)
4. SQLite file stored on Render's persistent disk (or ephemeral for demo)
5. Environment variables set in Render dashboard: MSG91_API_KEY, MSG91_SENDER_ID

**Note:** Render free tier spins down after 15 min idle. First request after idle takes ~30 seconds to wake. Acceptable for a demo.

**Alternative:** If persistent storage needed, consider upgrading to Render paid ($7/mo) or moving to Oracle Cloud Free VM.

---

## 15. Findings Documentation

During BSAM development, create these findings documents in `docs/findings/`:

1. `wasp-scaffolding-savings.md` — What Wasp generated vs what we built custom. Token counts if measurable.
2. `shadcn-component-usage.md` — Which shadcn components used, estimated lines saved.
3. `package-integration-notes.md` — How each 3rd-party package was integrated, any issues.
4. `boilerplate-gaps.md` — What the boilerplate didn't cover that needed custom work.

These documents feed into the future "Universal Boilerplate Toolkit" project.

---

## 16. Out of Scope

- Multi-shop / multi-tenant support
- Customer accounts / login
- Appointment reminders (SMS/push)
- Revenue analytics / reporting
- Online reviews / ratings
- Loyalty / rewards program
- Walk-in queue management
- Multi-language support (English only for now)
