import { SLOT_PX } from "../utils/dnd";
import { layout } from "../config/layout";
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
  return (
    <div
      style={{
        width: layout.timeAxisWidth,
        flex: "0 0 auto",
        borderRight: "1px solid #e6e8ec",
        position: "sticky",
        left: 0,
        zIndex: 50,
        background: "#f1f3fb",
      }}
    >
      <div style={{ height: gridHeight }}>
        {Array.from({ length: slots }).map((_, i) => (
          <div
            key={i}
            style={{
              height: SLOT_PX,
              borderBottom: i % 4 === 0 ? "2px solid #64748b" : "1px dashed #c4c7da",
              boxSizing: "border-box",
              margin: 0,
              padding: 0,
            }}
          >
            {i % 4 === 0 && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "2px",
                  padding: "0 6px",
                  fontSize: 11,
                  color: "#64748b",
                  fontVariantNumeric: "tabular-nums",
                  background: "#fafbff",
                  borderRadius: 6,
                  lineHeight: "16px",
                }}
              >
                {timeLabelFromSlot(dayStart, slotMinutes, i)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}