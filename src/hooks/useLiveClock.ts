// src/hooks/useLiveClock.ts
import { useEffect, useState } from "react";
import { formatClockInTz } from "../utils/time";
import type { DayPayload } from "../types";

export function useLiveClock(data: DayPayload | null) {
  const [nowText, setNowText] = useState("");

  useEffect(() => {
    if (!data?.org?.timezone) return;

    const tz = data.org.timezone;

    const tick = () => setNowText(formatClockInTz(new Date(), tz));
    tick();                     // run immediately

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [data?.org?.timezone]);    // only re-run if timezone changes

  return nowText;
}