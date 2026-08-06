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
  const todayStr = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const { data: slots, isLoading, error } = useQuery(getAvailableSlots, {
    date,
    serviceId,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
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
          className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Select Time Slot
        </label>
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-10 bg-neutral-800/50 animate-pulse rounded-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-rose-400 font-medium">
            Error loading time slots. Please try again.
          </p>
        ) : slots && slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.time)}
                className={`py-2.5 px-3 text-xs font-semibold rounded-full border transition-all duration-200 text-center ${
                  !slot.available
                    ? "bg-neutral-900/40 border-white/5 text-neutral-600 cursor-not-allowed opacity-50 line-through"
                    : selectedSlot === slot.time
                    ? "bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-[0_0_0_3px_hsl(38_96%_50%/0.2)] scale-105"
                    : "bg-neutral-900 border-white/10 text-neutral-300 hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400 active:scale-95"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl bg-neutral-900/20">
            <p className="text-sm text-neutral-500 font-medium">
              No time slots available for this day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
