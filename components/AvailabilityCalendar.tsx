"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { toISODate } from "@/lib/dates";

const WEEKDAYS_NO = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS_NO = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AvailabilityCalendar({
  unavailableDates,
  onRangeChange,
}: {
  unavailableDates: string[];
  onRangeChange: (range: { start: string; end: string } | null) => void;
}) {
  const { t, lang } = useLanguage();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const unavailableSet = new Set(unavailableDates);
  const todayIso = toISODate(today);
  const months = lang === "no" ? MONTHS_NO : MONTHS_EN;
  const weekdays = lang === "no" ? WEEKDAYS_NO : WEEKDAYS_EN;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first offset
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toISODate(new Date(year, month, i + 1))
    ),
  ];

  function isPast(iso: string) {
    return iso < todayIso;
  }

  function isInRange(iso: string) {
    if (!rangeStart || !rangeEnd) return false;
    return iso >= rangeStart && iso <= rangeEnd;
  }

  function handleClick(iso: string) {
    if (isPast(iso) || unavailableSet.has(iso)) return;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(iso);
      setRangeEnd(null);
      onRangeChange(null);
      return;
    }

    // choosing end date
    if (iso < rangeStart) {
      setRangeStart(iso);
      setRangeEnd(null);
      onRangeChange(null);
      return;
    }

    // check no unavailable dates fall inside the chosen range
    const d1 = new Date(rangeStart);
    const d2 = new Date(iso);
    let blocked = false;
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      if (unavailableSet.has(toISODate(d))) blocked = true;
    }
    if (blocked) {
      setRangeStart(iso);
      setRangeEnd(null);
      onRangeChange(null);
      return;
    }

    setRangeEnd(iso);
    onRangeChange({ start: rangeStart, end: iso });
  }

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Forrige måned"
          className="p-1.5 rounded-md hover:bg-sage/60 text-ink/60"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display font-semibold text-ink text-sm">
          {months[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Neste måned"
          className="p-1.5 rounded-md hover:bg-sage/60 text-ink/60"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w) => (
          <div key={w} className="text-[11px] font-tag text-ink/45 py-1">
            {w}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`blank-${i}`} />;
          const past = isPast(iso);
          const unavailable = unavailableSet.has(iso);
          const selected = iso === rangeStart || iso === rangeEnd;
          const inRange = isInRange(iso);
          const dayNum = Number(iso.slice(-2));

          return (
            <button
              key={iso}
              type="button"
              disabled={past || unavailable}
              onClick={() => handleClick(iso)}
              className={`aspect-square rounded-md text-sm flex items-center justify-center transition-colors
                ${past ? "text-ink/20 cursor-not-allowed" : ""}
                ${unavailable && !past ? "bg-barn/10 text-barn/70 cursor-not-allowed line-through" : ""}
                ${!past && !unavailable && !selected && !inRange ? "text-ink hover:bg-sage/60" : ""}
                ${inRange && !selected ? "bg-sage text-ink" : ""}
                ${selected ? "bg-moss text-paper font-semibold" : ""}
              `}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sage inline-block" /> {t("rent_available_legend")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-moss inline-block" /> {t("rent_selected_legend")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-barn/20 inline-block" /> {t("rent_unavailable_legend")}
        </span>
      </div>
    </div>
  );
}
