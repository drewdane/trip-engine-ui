import { useEffect, useMemo } from "react";
import { SLOT_PX } from "../utils/dnd";  // keep this – it's used in the calculation
import { yyyyMmDdInTz, minutesSinceDayStartInTz } from "../utils/time";
import type { DayPayload } from "../types";

export function useNowLine(params: {
  data: DayPayload | null;
  vScrollRef: React.RefObject<HTMLDivElement | null>;
  viewportHeightPx: number;
}) {
  const { data, vScrollRef, viewportHeightPx } = params;

  // Declare nowLineTop first so it's visible to the useEffect below
  const nowLineTop = useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const tz = data.org.timezone;

    const isTodayInOrgTz = yyyyMmDdInTz(now, tz) === data.day.dateLocal;
    if (!isTodayInOrgTz) return null;

    const mins = minutesSinceDayStartInTz(now, data.day.startTimeLocal);
    const maxMins = data.day.slotsPerDayView * data.day.slotMinutes;

    if (mins < 0 || mins > maxMins) return null;

    return (mins / data.day.slotMinutes) * SLOT_PX;
  }, [data]);

  // Auto-scroll once on load/mount when nowLineTop becomes available
  useEffect(() => {
    if (!data) return;
    if (!vScrollRef.current) return;
    if (nowLineTop === null) return;

    const target = Math.max(0, nowLineTop - viewportHeightPx / 2);
    requestAnimationFrame(() => {
      vScrollRef.current?.scrollTo({ top: target, behavior: "auto" });
    });
  }, [data, nowLineTop, viewportHeightPx, vScrollRef]);

  return nowLineTop;
}