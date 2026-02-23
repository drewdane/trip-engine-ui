import { useEffect, useRef } from "react";
import { localYmd } from "../utils/time";
import type { DayPayload } from "../types";
import { SLOT_PX } from "../config/layout";

export function useJumpToNow({
  data,
  viewDate,
  setViewDate,
  nowLineTop,
  vScrollRef,
  viewportHeightPx,
}: {
  data: DayPayload | null;
  viewDate: string;
  setViewDate: (d: string) => void;
  nowLineTop: number | null;
  vScrollRef: React.RefObject<HTMLDivElement | null>;
  viewportHeightPx: number;
}) {
  const pendingRef = useRef(false);

  const scrollToNow = (topPx: number | null) => {
    const el = vScrollRef.current;
    if (!el) return;

    const fallbackNoon = 48 * SLOT_PX; // 12:00 if 15-min slots; harmless even if slightly off

    const target = topPx != null ? Math.max(0, topPx - viewportHeightPx / 2) : fallbackNoon;
    el.scrollTo({ top: target, behavior: "smooth" });
  };

  const jumpToNow = () => {
    const tz = data?.org?.timezone;
    if (!tz) return;

    const todayYmd = localYmd(new Date(), tz);

    pendingRef.current = true;

    // If we’re already on today, scroll immediately using current nowLineTop.
    if (viewDate === todayYmd) {
      scrollToNow(nowLineTop);
      pendingRef.current = false;
      return;
    }

    // Otherwise switch to today; effect below will scroll when nowLineTop updates for today.
    setViewDate(todayYmd);
  };

  useEffect(() => {
    const tz = data?.org?.timezone;
    if (!tz) return;
    if (!pendingRef.current) return;

    const todayYmd = localYmd(new Date(), tz);

    // Wait until we’re actually viewing today
    if (viewDate !== todayYmd) return;

    // If useNowLine returns null briefly during load, we still allow a fallback scroll once.
    scrollToNow(nowLineTop);

    pendingRef.current = false;
  }, [data?.org?.timezone, viewDate, nowLineTop]);

  return { jumpToNow };
}