// src/hooks/useNowLine.ts
import { useEffect, useMemo, useRef } from "react";
import { SLOT_PX } from "../config/layout";
import { useNowInstant } from "./useLiveClock";
import { yyyyMmDdInTz, minutesSinceDayStartInTz } from "../utils/time";
import type { DayPayload } from "../types";

export function useNowLine(params: {
  data: DayPayload | null;
  vScrollRef: React.RefObject<HTMLDivElement | null>;
  viewportHeightPx: number;
}) {
  const { data, vScrollRef, viewportHeightPx } = params;

  // Tick once per minute so the now line moves with real time.
  const now = useNowInstant(60_000);

  // Auto-scroll only once per viewed day
  const didAutoScrollRef = useRef(false);

  const nowLineTop = useMemo(() => {
    if (!data) return null;

    const tz = data.org.timezone;

    // Only show now-line when viewing "today" in org timezone
    const isTodayInOrgTz = yyyyMmDdInTz(now, tz) === data.day.dateLocal;
    if (!isTodayInOrgTz) return null;

    const mins = minutesSinceDayStartInTz(now, data.day.startTimeLocal, tz);
    const maxMins = data.day.slotsPerDayView * data.day.slotMinutes;

    if (mins < 0 || mins > maxMins) return null;

    // Convert minutes -> slots -> px
    return (mins / data.day.slotMinutes) * SLOT_PX;
  }, [data, now]);

  // Reset auto-scroll flag whenever the viewed day changes
  useEffect(() => {
    didAutoScrollRef.current = false;
  }, [data?.day?.dateLocal]);

  // Auto-scroll once when nowLineTop becomes available
  useEffect(() => {
    if (!data) return;
    const el = vScrollRef.current;
    if (!el) return;
    if (nowLineTop === null) return;
    if (didAutoScrollRef.current) return;

    didAutoScrollRef.current = true;

    const target = Math.max(0, nowLineTop - viewportHeightPx / 2);
    requestAnimationFrame(() => {
      el.scrollTo({ top: target, behavior: "auto" });
    });
  }, [data, nowLineTop, viewportHeightPx, vScrollRef]);

  return nowLineTop;
}