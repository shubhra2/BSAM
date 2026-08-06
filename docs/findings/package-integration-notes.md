# 3rd-Party Package Integration & Payment Architecture

## Implementation Details

1. **Pluggable Payment Adapter**: Abstracted static UPI QR generation behind a `PaymentAdapter` interface (`StaticQrAdapter.ts`). Supports instant QR rendering with dynamic UPI deep-links (`upi://pay?pa=...&am=...`).
2. **MSG91 OTP Verification Flow**: Built mockable OTP service with MSG91 SMS gateway fallback. OTP hashes are SHA-256 hashed and validated server-side before appointment confirmation.
3. **Slot Overlap Algorithm**: Robust consecutive slot availability calculator (`slots.ts`) that factors in service duration, operating hours, and existing appointment overlaps.
