// --- Time labels / display helpers ---
export function timeLabelFromSlot(dayStart: Date, slotMinutes: number, slotIndex: number): string {
  const d = new Date(dayStart.getTime() + slotIndex * slotMinutes * 60_000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function shortTime(pickupTimeLocal: string): string {
  // Supports "HH:MM" strings OR ISO strings
  if (/^\d{2}:\d{2}/.test(pickupTimeLocal)) return pickupTimeLocal.slice(0, 5);
  const d = new Date(pickupTimeLocal);
  if (Number.isNaN(d.getTime())) return pickupTimeLocal;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Prefer short codes for dispatcher glance, else facility label, else street(without number)+city.
export function shortPlace(code?: string, label?: string, street?: string, city?: string): string {
  if (code && code.trim().length > 0) return code.trim().toUpperCase();
  if (label && label.trim().length > 0) return label.trim();

  const streetOnly = street ? street.replace(/^\s*\d+\s+/, "").trim() : "";
  if (streetOnly && city) return `${streetOnly} (${city})`;
  if (streetOnly) return streetOnly;
  if (city) return city;
  return "—";
}

// --- Timezone helpers (moved here from tz.ts) ---
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

export function localYmd(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatClockInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(d);
}

export function formatFriendlyDateInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(d);
}

export function shiftYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
  
}
export function minutesSinceDayStartInTz(now: Date, dayStartLocalIso: string, timeZone: string): number {
  // dayStartLocalIso is an org-local wall clock like "2026-02-23T00:00:00"
  // Compute minutes using org-local *parts*, not epoch subtraction.

  // Parse start local ISO (YYYY-MM-DDTHH:MM[:SS])
  const [ymd, timePart = "00:00:00"] = dayStartLocalIso.split("T");
  const [startH, startM] = timePart.split(":").map((x) => Number(x) || 0);

  // Get now's org-local YMD + HM via Intl (timezone-correct)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const nowYmd = `${get("year")}-${get("month")}-${get("day")}`;
  const nowH = Number(get("hour")) || 0;
  const nowM = Number(get("minute")) || 0;

  // Day difference in whole days (treat YMD as calendar days)
  const startDay = new Date(`${ymd}T00:00:00Z`).getTime();
  const nowDay = new Date(`${nowYmd}T00:00:00Z`).getTime();
  const deltaDays = Math.round((nowDay - startDay) / 86400000);

  const startTotal = startH * 60 + startM;
  const nowTotal = nowH * 60 + nowM;

  return deltaDays * 1440 + (nowTotal - startTotal);
}