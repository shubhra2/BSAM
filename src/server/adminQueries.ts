import type { Prisma } from "@prisma/client";
import { HttpError } from "wasp/server";
import { prisma } from "wasp/server";
import type {
  GetAppointments,
  GetDashboardStats,
  GetBarbers,
} from "wasp/server/operations/types";

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: { service: true; assignedBarber: true };
}>;

type GetAppointmentsArgs = {
  date?: string;
  status?: string;
};

export const getAppointments: GetAppointments<
  GetAppointmentsArgs,
  AppointmentWithRelations[]
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const { date, status } = args || {};
  const where: Prisma.AppointmentWhereInput = {};

  // Role check: Barbers only see their assigned appointments or unassigned ones
  if (context.user.role !== "ADMIN") {
    where.OR = [
      { assignedBarberId: context.user.id },
      { assignedBarberId: null },
    ];
  }

  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    where.date = { gte: startOfDay, lt: endOfDay };
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      service: true,
      assignedBarber: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });
};

export const getDashboardStats: GetDashboardStats<
  Record<string, never>,
  {
    totalToday: number;
    pendingPayments: number;
    completedToday: number;
    totalRevenuePaise: number;
  }
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const baseWhere: Prisma.AppointmentWhereInput =
    context.user.role === "ADMIN"
      ? {}
      : { OR: [{ assignedBarberId: context.user.id }, { assignedBarberId: null }] };

  const [totalToday, pendingPayments, completedToday, completedAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          ...baseWhere,
          date: { gte: today, lt: tomorrow },
        },
      }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          paymentStatus: "UNPAID",
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          date: { gte: today, lt: tomorrow },
          status: "COMPLETED",
        },
      }),
      prisma.appointment.findMany({
        where: {
          ...baseWhere,
          status: "COMPLETED",
        },
        include: { service: true },
      }),
    ]);

  const totalRevenuePaise = completedAppointments.reduce(
    (acc, app) => acc + (app.service?.price || 0),
    0
  );

  return {
    totalToday,
    pendingPayments,
    completedToday,
    totalRevenuePaise,
  };
};

export const getBarbers: GetBarbers<
  Record<string, never>,
  Prisma.UserGetPayload<{ select: { id: true; username: true; displayName: true; role: true } }>[]
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Authentication required");
  }

  return prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
    },
    orderBy: { displayName: "asc" },
  });
};
