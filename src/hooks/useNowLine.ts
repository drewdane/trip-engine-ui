import { useEffect, useMemo } from "react";
import { SLOT_PX } from "../utils/dnd";
import { yyyyMmDdInTz, minutesSinceDayStartInTz } from "../utils/tz";
import type { DayPayload } from "../types";

export function useNowLine(params: {
  data: DayPayload | null;
  vScrollRef: React.RefObject<HTMLDivElement | null>;
  viewportHeightPx: number;
}) {
  const { data, vScrollRef, viewportHeightPx } = params;

  const nowLineTop = useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const isTodayInOrgTz = yyyyMmDdInTz(now, data.org.timezone) === data.day.dateLocal;
    if (!isTodayInOrgTz) return null;

    const mins = minutesSinceDayStartInTz(now, data.day.startTimeLocal);
    const maxMins = data.day.slotsPerDayView * data.day.slotMinutes;

    if (mins < 0 || mins > maxMins) return null;
    return (mins / data.day.slotMinutes) * SLOT_PX;
  }, [data]);

  // Auto-scroll to now after load
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
