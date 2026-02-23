import { localYmd } from "../utils/time";
import type { DayPayload } from "../types";

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
  const jumpToNow = () => {
    if (!data?.org?.timezone) return;

    const todayYmd = localYmd(new Date(), data.org.timezone);

    setViewDate(todayYmd);  // Force switch to today (like the Today button)

    // Give a tiny delay for data/viewDate to update, then scroll
    setTimeout(() => {
      const el = vScrollRef.current;
      if (!el) return;

      if (nowLineTop !== null) {
        const target = Math.max(0, nowLineTop - viewportHeightPx / 2);
        el.scrollTo({ top: target, behavior: "smooth" });
      } else {
        el.scrollTo({ top: 48 * 30, behavior: "smooth" }); // fallback ~12:00
      }
    }, 200);  // 200ms delay covers render cycle
  };

  return { jumpToNow };
}