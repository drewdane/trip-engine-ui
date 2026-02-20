export function yyyyMmDdInTz(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function minutesSinceDayStartInTz(now: Date, dayStartLocalIso: string): number {
  const start = new Date(dayStartLocalIso);
  return Math.floor((now.getTime() - start.getTime()) / 60000);
}
