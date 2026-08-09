export type Slot = {
  time: string;
  available: boolean;
};

type Service = {
  durationMinutes: number;
};

type Appointment = {
  startTime: string;
  status: string;
  service: Service;
};

type ShopSettings = {
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  closedDays: string;
};

const BLOCKING_APPOINTMENT_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
]);

function timeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    throw new Error(`Invalid time value: ${time}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function parseClosedDays(value: string): Set<number> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6));
  } catch {
    return new Set();
  }
}

export function generateSlots(
  date: Date,
  service: Service,
  appointments: Appointment[],
  shopSettings: ShopSettings,
  now = new Date()
): Slot[] {
  if (service.durationMinutes <= 0 || shopSettings.slotDurationMinutes <= 0) {
    return [];
  }

  if (parseClosedDays(shopSettings.closedDays).has(date.getDay())) {
    return [];
  }

  const openMinutes = timeToMinutes(shopSettings.openTime);
  const closeMinutes = timeToMinutes(shopSettings.closeTime);
  const latestStartMinutes = closeMinutes - service.durationMinutes;
  const isToday = isSameCalendarDay(date, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (latestStartMinutes < openMinutes) {
    return [];
  }

  return Array.from(
    { length: Math.floor((latestStartMinutes - openMinutes) / shopSettings.slotDurationMinutes) + 1 },
    (_, index) => openMinutes + index * shopSettings.slotDurationMinutes
  )
    .filter((slotStart) => !isToday || slotStart > currentMinutes)
    .map((slotStart) => {
      const slotEnd = slotStart + service.durationMinutes;
      const overlapsAppointment = appointments.some((appointment) => {
        if (!BLOCKING_APPOINTMENT_STATUSES.has(appointment.status)) {
          return false;
        }

        const appointmentStart = timeToMinutes(appointment.startTime);
        const appointmentEnd = appointmentStart + appointment.service.durationMinutes;
        return slotStart < appointmentEnd && appointmentStart < slotEnd;
      });

      return {
        time: minutesToTime(slotStart),
        available: !overlapsAppointment,
      };
    });
}
