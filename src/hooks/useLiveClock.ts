// src/hooks/useLiveClock.ts
import { useEffect, useState } from "react";
import { formatClockInTz } from "../utils/time";
import type { DayPayload } from "../types";

/**
 * For UI display: returns "12:46 AM" formatted in org timezone.
 * This is NOT suitable for calculations (it's not an ISO timestamp).
 */
export function useLiveClock(data: DayPayload | null) {
  const [nowText, setNowText] = useState("");

  useEffect(() => {
    if (!data?.org?.timezone) return;

    const tz = data.org.timezone;

    const tick = () => setNowText(formatClockInTz(new Date(), tz));
    tick(); // run immediately

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [data?.org?.timezone]);

  return nowText;
}

/**
 * For logic: returns a Date object (an instant).
 * Safe for projecting into org timezone via Intl helpers.
 */
export function useNowInstant(tickMs: number = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}