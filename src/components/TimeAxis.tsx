import { SLOT_PX } from "../utils/dnd";
import { layout } from "../config/layout";
import { timeLabelFromSlot } from "../utils/time";

export function TimeAxis({
  gridHeight,
  slots,
  dayStart,
  slotMinutes
}: {
  gridHeight: number;
  slots: number;
  dayStart: Date;
  slotMinutes: number;
}) {
  return (
    <div
      style={{
        width: layout.timeAxisWidth,
        flex: "0 0 auto",
        borderRight: "1px solid #e6e8ec",
        position: "sticky",
        left: 0,
        zIndex: 50,
        background: "#fff"
      }}
    >
      <div style={{ height: gridHeight }}>
        {Array.from({ length: slots }).map((_, i) => (
          <div
            key={i}
            style={{
              height: SLOT_PX,
              borderBottom: "1px dashed #f0f2f5",
              position: "relative"
            }}
          >
            {i % 4 === 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: -7,
                  left: 6,
                  fontSize: 11,
                  color: "#64748b",
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                {timeLabelFromSlot(dayStart, slotMinutes, i)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
