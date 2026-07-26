# BSAM — Barber Shop Appointment Manager

BSAM is a planned mobile-first web application for a single barber shop. It gives customers a quick way to book appointments online without creating an account, while giving the shop owner and barbers a dashboard to manage the schedule.

## Project goal

The primary goal is to make booking simple for customers and appointment management practical for a small barber shop:

- Customers choose a service, date, and available time slot.
- Customers verify their phone number with an SMS OTP before confirming a booking.
- Customers can pay a token amount by UPI or choose to pay at the shop.
- Admins can view appointments, assign barbers, manage services and staff, verify payments, and configure shop details.

The project also serves as a practical experiment in using established tools and boilerplates—Wasp, shadcn/ui, and third-party packages—to reduce the amount of custom code and AI-agent effort needed to build a full-stack product.

## Planned stack

- **Full stack:** Wasp (React, Node.js, Prisma)
- **Database:** SQLite
- **UI:** Tailwind CSS and shadcn/ui
- **Booking calendar:** react-day-picker and date-fns
- **Forms and validation:** react-hook-form and Zod
- **SMS verification:** MSG91
- **Payments:** static UPI QR code with manual verification

## Planned features

- Public landing page with services and shop information
- Multi-step, mobile-friendly appointment booking flow
- SMS OTP verification for customer phone numbers
- Availability-aware time-slot selection
- UPI token-payment proof collection or pay-at-shop option
- Authenticated dashboard for appointments, barbers, services, and shop settings

## Status

The product is currently in the design and implementation-planning stage. The design specification and build plan live in [`docs/superpowers/specs/`](docs/superpowers/specs/) and [`docs/superpowers/plans/`](docs/superpowers/plans/).

