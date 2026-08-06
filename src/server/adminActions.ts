import { HttpError } from "wasp/server";
import { prisma } from "wasp/server";
import type {
  UpdateAppointmentStatus,
  VerifyPaymentStatus,
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

  // Permission: Barber can update status of assigned appointments
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
