import type { Prisma } from "@prisma/client";
import { HttpError } from "wasp/server";
import { prisma } from "wasp/server";
import type {
  CreateAppointment,
  SendBookingOTP,
} from "wasp/server/operations/types";

import { generateOTP, hashOTP } from "./utils/otp";
import { generateSlots } from "./utils/slots";
import { sendSMS } from "./utils/sms";

type SendBookingOTPArgs = {
  phone: string;
};

type CreateAppointmentArgs = {
  customerName: string;
  customerPhone: string;
  serviceId: number;
  date: string;
  startTime: string;
  paymentMethod: "PAY_NOW" | "PAY_AT_SHOP";
  paymentProof?: string;
  otpCode: string;
};

export const sendBookingOTP: SendBookingOTP<
  SendBookingOTPArgs,
  { success: boolean }
> = async ({ phone }) => {
  const cleanPhone = phone.trim();
  if (!cleanPhone) {
    throw new HttpError(400, "Phone number is required");
  }

  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  await prisma.oTPVerification.create({
    data: {
      phone: cleanPhone,
      otpHash,
      expiresAt,
    },
  });

  const smsText = `Your BSAM verification OTP is ${otp}. Valid for 5 minutes.`;
  const success = await sendSMS(cleanPhone, smsText, otp);

  return { success };
};

export const createAppointment: CreateAppointment<
  CreateAppointmentArgs,
  Prisma.AppointmentGetPayload<{ include: { service: true } }>
> = async (args) => {
  const {
    customerName,
    customerPhone,
    serviceId,
    date,
    startTime,
    paymentMethod,
    paymentProof,
    otpCode,
  } = args;

  const cleanPhone = customerPhone.trim();
  const cleanName = customerName.trim();

  if (!cleanName || !cleanPhone || !startTime || !date) {
    throw new HttpError(400, "All fields are required");
  }

  // 1. Verify OTP
  const verification = await prisma.oTPVerification.findFirst({
    where: {
      phone: cleanPhone,
      expiresAt: { gte: new Date() },
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    throw new HttpError(400, "Invalid or expired OTP. Please try sending a new OTP.");
  }

  if (verification.attempts >= 5) {
    throw new HttpError(400, "Maximum OTP verification attempts reached. Please request a new OTP.");
  }

  const hashedInput = hashOTP(otpCode.trim());
  if (verification.otpHash !== hashedInput) {
    await prisma.oTPVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, "Incorrect OTP code. Please check and try again.");
  }

  // Mark OTP as verified so it can't be reused
  await prisma.oTPVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  // 2. Validate availability
  const requestedDate = new Date(date);
  if (Number.isNaN(requestedDate.getTime())) {
    throw new HttpError(400, "Invalid date format");
  }

  const [service, shopSettings] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, isActive: true } }),
    prisma.shopSettings.findUnique({ where: { id: 1 } }),
  ]);

  if (!service) {
    throw new HttpError(404, "Selected service not found or not active");
  }
  if (!shopSettings) {
    throw new HttpError(500, "Shop settings configuration missing");
  }

  // Get appointments to check overlap
  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay, lt: endOfDay },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    include: { service: true },
  });

  const availableSlots = generateSlots(
    requestedDate,
    service,
    appointments,
    shopSettings
  );

  const slotInfo = availableSlots.find((s) => s.time === startTime);
  if (!slotInfo || !slotInfo.available) {
    throw new HttpError(400, `The slot at ${startTime} on this date is no longer available.`);
  }

  // 3. Create the appointment
  const newlyCreated = await prisma.appointment.create({
    data: {
      customerName: cleanName,
      customerPhone: cleanPhone,
      serviceId,
      date: requestedDate,
      startTime,
      paymentMethod,
      paymentStatus: paymentMethod === "PAY_NOW" ? "UNPAID" : "UNPAID", // starts unpaid until confirmed by QR ref or shop visit
      paymentProof: paymentMethod === "PAY_NOW" ? paymentProof?.trim() || null : null,
      paymentProofType: paymentMethod === "PAY_NOW" ? "UPI_REF" : null,
      otpVerified: true,
      status: "PENDING",
    },
    include: {
      service: true,
    },
  });

  return newlyCreated;
};
