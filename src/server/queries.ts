import type { Prisma } from "@prisma/client";
import { prisma } from "wasp/server";
import type {
  GetAvailableSlots,
  GetServices,
  GetShopInfo,
} from "wasp/server/operations";

import { generateSlots, type Slot } from "./utils/slots";

type AvailableSlotsArgs = {
  date: Date | string;
  serviceId: number;
};

type PublicShopInfo = {
  shopName: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  upiQrImageUrl: string | null;
};

export const getAvailableSlots: GetAvailableSlots<AvailableSlotsArgs, Slot[]> = async ({
  date,
  serviceId,
}) => {
  const requestedDate = new Date(date);
  if (Number.isNaN(requestedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const [service, shopSettings] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, isActive: true } }),
    prisma.shopSettings.findUnique({ where: { id: 1 } }),
  ]);

  if (!service || !shopSettings) {
    return [];
  }

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

  return generateSlots(requestedDate, service, appointments, shopSettings);
};

export const getServices: GetServices<
  Record<string, never>,
  Prisma.ServiceGetPayload<{}>[]
> = async () =>
  prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

export const getShopInfo: GetShopInfo<
  Record<string, never>,
  PublicShopInfo | null
> = async () =>
  prisma.shopSettings.findUnique({
    where: { id: 1 },
    select: {
      shopName: true,
      address: true,
      phone: true,
      openTime: true,
      closeTime: true,
      upiQrImageUrl: true,
    },
  });
