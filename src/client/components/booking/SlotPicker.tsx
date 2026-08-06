import React from "react";
import { useQuery } from "wasp/client/operations";
import { getAvailableSlots } from "wasp/client/operations";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

type SlotPickerProps = {
  date: string;
  setDate: (date: string) => void;
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
  serviceId: number;
};

export function SlotPicker({
  date,
  setDate,
  selectedSlot,
  setSelectedSlot,
  serviceId,
}: SlotPickerProps) {
  // Format today's date context for the min attribute (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Fetch slots based on selected date and serviceId
  const { data: slots, isLoading, error } = useQuery(getAvailableSlots, {
    date,
    serviceId,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          Select Appointment Date
        </label>
        <input
          type="date"
          min={todayStr}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot("");
          }}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-background font-sans"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Select Time Slot
        </label>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-10 bg-muted/40 animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive font-medium">
            Error loading time slots. Please try again.
          </p>
        ) : slots && slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.time)}
                className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all text-center ${
                  !slot.available
                    ? "bg-muted text-muted-foreground decoration-line-through cursor-not-allowed opacity-50"
                    : selectedSlot === slot.time
                    ? "bg-primary border-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                    : "bg-background border-input hover:border-accent-foreground hover:bg-accent/40 text-foreground cursor-pointer"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-md border-dashed bg-muted/10">
            <p className="text-sm text-muted-foreground font-medium">
              No time slots available for this day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
