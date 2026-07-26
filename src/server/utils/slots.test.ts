import { describe, expect, it, vi } from "vitest";

import { generateSlots } from "./slots";

describe("generateSlots", () => {
  const service = {
    id: 1,
    name: "Haircut",
    description: null,
    imageUrl: "",
    durationMinutes: 60,
    price: 20000,
    tokenAmount: 5000,
    isActive: true,
    sortOrder: 0,
  };

  const shopSettings = {
    id: 1,
    shopName: "BSAM",
    address: "Main Road",
    phone: "9999999999",
    openTime: "09:00",
    closeTime: "11:00",
    slotDurationMinutes: 30,
    upiQrImageUrl: null,
    tokenAmountDefault: 5000,
    closedDays: "[]",
  };

  it("generates starts that fit inside shop hours", () => {
    expect(generateSlots(new Date(2026, 7, 1), service, [], shopSettings)).toEqual([
      { time: "09:00", available: true },
      { time: "09:30", available: true },
      { time: "10:00", available: true },
    ]);
  });

  it("blocks slots that overlap existing appointments", () => {
    const appointments = [
      {
        id: 1,
        customerName: "A",
        customerPhone: "9999999999",
        serviceId: 1,
        assignedBarberId: null,
        date: new Date(2026, 7, 1),
        startTime: "09:30",
        status: "CONFIRMED",
        paymentMethod: "PAY_AT_SHOP",
        paymentStatus: "UNPAID",
        paymentProof: null,
        paymentProofType: null,
        otpVerified: true,
        createdAt: new Date(2026, 6, 1),
        service,
      },
    ];

    expect(generateSlots(new Date(2026, 7, 1), service, appointments, shopSettings)).toEqual([
      { time: "09:00", available: false },
      { time: "09:30", available: false },
      { time: "10:00", available: false },
    ]);
  });

  it("drops past slots when generating for today", () => {
    vi.setSystemTime(new Date(2026, 7, 1, 9, 45));

    expect(generateSlots(new Date(2026, 7, 1), service, [], shopSettings)).toEqual([
      { time: "10:00", available: true },
    ]);

    vi.useRealTimers();
  });

  it("returns no slots on configured closed days", () => {
    // Note: in JS, Date's getDay() for Aug 1, 2026 (2026, 7, 1) is Saturday (6).
    // Saturday is day 6.
    expect(
      generateSlots(new Date(2026, 7, 1), service, [], {
        ...shopSettings,
        closedDays: "[6]",
      })
    ).toEqual([]);
  });
});
