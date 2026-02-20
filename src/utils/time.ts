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
