import { HttpError } from "wasp/server";
import { prisma } from "wasp/server";
import type {
  UpdateAppointmentStatus,
  VerifyPaymentStatus,
  CreateService,
  UpdateService,
  CreateBarber,
  ToggleBarberActive,
  UpdateShopSettings,
} from "wasp/server/operations/types";

type UpdateStatusArgs = {
  id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  assignedBarberId?: number | null;
};

type VerifyPaymentArgs = {
  id: number;
  paymentStatus: "UNPAID" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
};

export const updateAppointmentStatus: UpdateAppointmentStatus<
  UpdateStatusArgs,
  { success: boolean }
> = async ({ id, status, assignedBarberId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Appointment not found");
  }

  if (
    context.user.role !== "ADMIN" &&
    existing.assignedBarberId !== context.user.id &&
    existing.assignedBarberId !== null
  ) {
    throw new HttpError(403, "You do not have permission to modify this appointment");
  }

  const updateData: any = { status };
  if (assignedBarberId !== undefined) {
    updateData.assignedBarberId = assignedBarberId;
  }

  await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  return { success: true };
};

export const verifyPaymentStatus: VerifyPaymentStatus<
  VerifyPaymentArgs,
  { success: boolean }
> = async ({ id, paymentStatus }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "Appointment not found");
  }

  await prisma.appointment.update({
    where: { id },
    data: { paymentStatus },
  });

  return { success: true };
};

export const createService: CreateService<
  {
    name: string;
    description?: string;
    imageUrl: string;
    durationMinutes: number;
    price: number;
    tokenAmount: number;
  },
  { success: boolean }
> = async (args, context) => {
  if (!context.user || context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only Admin can create services");
  }

  await prisma.service.create({
    data: {
      name: args.name,
      description: args.description || "",
      imageUrl: args.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
      durationMinutes: Number(args.durationMinutes),
      price: Number(args.price),
      tokenAmount: Number(args.tokenAmount),
      isActive: true,
    },
  });

  return { success: true };
};

export const updateService: UpdateService<
  {
    id: number;
    name?: string;
    description?: string;
    imageUrl?: string;
    durationMinutes?: number;
    price?: number;
    tokenAmount?: number;
    isActive?: boolean;
  },
  { success: boolean }
> = async ({ id, ...data }, context) => {
  if (!context.user || context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only Admin can update services");
  }

  await prisma.service.update({
    where: { id },
    data,
  });

  return { success: true };
};

export const createBarber: CreateBarber<
  {
    username: string;
    password: string;
    displayName: string;
    phone?: string;
  },
  { success: boolean }
> = async (args, context) => {
  if (!context.user || context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only Admin can add barbers");
  }

  const existing = await prisma.user.findUnique({
    where: { username: args.username.trim() },
  });
  if (existing) {
    throw new HttpError(400, "Username is already taken");
  }

  await prisma.user.create({
    data: {
      username: args.username.trim(),
      password: args.password,
      displayName: args.displayName,
      phone: args.phone || null,
      role: "BARBER",
      isActive: true,
    },
  });

  return { success: true };
};

export const toggleBarberActive: ToggleBarberActive<
  { id: number; isActive: boolean },
  { success: boolean }
> = async ({ id, isActive }, context) => {
  if (!context.user || context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only Admin can toggle barber status");
  }

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  return { success: true };
};

export const updateShopSettings: UpdateShopSettings<
  {
    shopName?: string;
    address?: string;
    phone?: string;
    openTime?: string;
    closeTime?: string;
    slotDurationMinutes?: number;
    upiQrImageUrl?: string;
  },
  { success: boolean }
> = async (data, context) => {
  if (!context.user || context.user.role !== "ADMIN") {
    throw new HttpError(403, "Only Admin can update shop settings");
  }

  await prisma.shopSettings.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      shopName: data.shopName || "Royal Cut Barber Shop",
      address: data.address || "123 Main St, Bengaluru",
      phone: data.phone || "+91 9876543210",
      openTime: data.openTime || "09:00",
      closeTime: data.closeTime || "20:00",
      slotDurationMinutes: data.slotDurationMinutes || 30,
      upiQrImageUrl: data.upiQrImageUrl,
    },
  });

  return { success: true };
};
