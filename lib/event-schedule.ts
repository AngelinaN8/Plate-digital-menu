import type { MenuEvent, Weekday } from "./menu-types";
export type { MenuEvent, Weekday } from "./menu-types";

const weekdayNumbers: Record<Weekday, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const weekdayNames: Record<Weekday, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

export function eventScheduleLabel(event: MenuEvent): string {
  let label: string;
  if (event.recurrence === "last-weekday-monthly") label = `Last ${weekdayNames[event.days[0]] ?? "weekday"} of every month`;
  else if (event.recurrence === "weekly") label = `Every ${event.days.map(day => weekdayNames[day]).join(" & ")}`;
  else {
    const date = new Date(`${event.date}T12:00:00Z`);
    label = Number.isNaN(date.getTime()) ? "Date to be confirmed" : new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  if (event.startTime && event.endTime) return `${label} · ${event.startTime}–${event.endTime}`;
  if (event.startTime) return `${label} · from ${event.startTime}`;
  if (event.endTime) return `${label} · until ${event.endTime}`;
  return label;
}

function calendarDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Upcoming occurrence dates in the venue's local calendar, including an event
 * in progress today. Calendar arithmetic uses UTC-only date containers, so
 * daylight-saving offsets and host timezone do not move a date to another day. */
export function nextEventDates(event: MenuEvent, now = new Date()): string[] {
  if (!event.enabled || Number.isNaN(now.getTime())) return [];
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", { timeZone: event.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  } catch { return []; }
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  const currentTime = `${part("hour")}:${part("minute")}`;
  const todayOpen = () => {
    if (event.startTime && event.endTime && event.endTime <= event.startTime) return true; // ends the next calendar day
    const cutoff = event.endTime || event.startTime;
    return !cutoff || currentTime < cutoff;
  };
  const eligible = (date: string) => date > today || (date === today && todayOpen());
  if (event.recurrence === "one-off") return /^\d{4}-\d{2}-\d{2}$/.test(event.date) && eligible(event.date) ? [event.date] : [];
  const [year, month, day] = today.split("-").map(Number);
  const dates: string[] = [];
  if (event.recurrence === "weekly") {
    const weekdays = new Set(event.days.map(value => weekdayNumbers[value]));
    const cursor = new Date(Date.UTC(year, month - 1, day));
    for (let i = 0; i < 28 && dates.length < 3; i++) {
      const date = calendarDate(cursor);
      if (weekdays.has(cursor.getUTCDay()) && eligible(date)) dates.push(date);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  } else if (event.recurrence === "last-weekday-monthly" && event.days.length === 1) {
    const weekday = weekdayNumbers[event.days[0]];
    for (let offset = 0; offset < 5 && dates.length < 3; offset++) {
      const last = new Date(Date.UTC(year, month + offset, 0));
      last.setUTCDate(last.getUTCDate() - (last.getUTCDay() - weekday + 7) % 7);
      const date = calendarDate(last);
      if (eligible(date)) dates.push(date);
    }
  }
  return dates;
}
