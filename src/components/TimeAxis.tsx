import { SLOT_PX, layout } from "../config/layout";
import { timeLabelFromSlot } from "../utils/time";

export function TimeAxis({
  gridHeight,
  slots,
  dayStart,
  slotMinutes,
}: {
  gridHeight: number;
  slots: number;
  dayStart: Date;
  slotMinutes: number;
}) {
  const hourEvery = Math.max(1, Math.round(60 / slotMinutes));

  return (
    <div
      style={{
        width: layout.timeAxisWidth,
        flex: "0 0 auto",
        position: "sticky",
        left: 0,
        zIndex: 50,
        background: "#f1f3fb",
        borderRight: "1px solid #e6e8ec",
      }}
    >
      <div style={{ height: gridHeight }}>
        {Array.from({ length: slots }).map((_, i) => {
          const isHour = i % hourEvery === 0;
          const isQuarter0to15 = isHour; // the slot starting at XX:00

          return (
            <div
              key={i}
              style={{
                height: SLOT_PX,
                boxSizing: "border-box",
                margin: 0,
                padding: 0,
                // ✅ hour line at TOP of the hour slot
                borderTop: isHour ? "2px solid #64748b" : "1px dashed #c4c7da",
                // ✅ subtle shading for XX:00 → XX:15
                background: isQuarter0to15 ? "rgba(15, 23, 42, 0.04)" : "transparent",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {isHour && (
                <span
                  style={{
                    display: "inline-block",
                    // ✅ "just beneath the line, touching"
                    marginTop: 0,
                    transform: "translateY(1px)", // tiny nudge so it kisses the line without overlap
                    padding: "0 6px",
                    fontSize: 11,
                    color: "#64748b",
                    fontVariantNumeric: "tabular-nums",
                    background: "#fafbff",
                    borderRadius: 6,
                    lineHeight: "16px",
                    marginLeft: 6,
                  }}
                >
                  {timeLabelFromSlot(dayStart, slotMinutes, i)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}