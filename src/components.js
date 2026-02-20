import { useDraggable } from "@dnd-kit/core";
import { shortPlace, shortTime } from "../utils/time";
import type { TripCard } from "../types";

export function TripCardCompactOverlay({ t }: { t: TripCard }) {
  const from = shortPlace(t.pickupCode, t.pickupLabel, t.pickupStreet, t.pickupCity);
  const to = shortPlace(t.dropoffCode, t.dropoffLabel, t.dropoffStreet, t.dropoffCity);

  return (
    <div
      style={{
        cursor: "grabbing",
        border: "1px solid #e6e8ec",
        borderRadius: 10,
        background: "#fff",
        padding: 8,
        boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
        width: 300,
        pointerEvents: "none"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontVariantNumeric: "tabular-nums", fontSize: 12 }}>{shortTime(t.pickupTimeLocal)}</div>
        <div style={{ fontSize: 12 }}>{t.mobilityIcon ?? ""}</div>
      </div>

      <div style={{ fontWeight: 900, fontSize: 12, marginTop: 2 }}>{t.passengerShort}</div>

      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
        {from} → {to}
      </div>
    </div>
  );
}

export function TripCardCompact({ t }: { t: TripCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `trip-${t.tripId}`,
    data: { trip: t }
  });

  const from = shortPlace(t.pickupCode, t.pickupLabel, t.pickupStreet, t.pickupCity);
  const to = shortPlace(t.dropoffCode, t.dropoffLabel, t.dropoffStreet, t.dropoffCity);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab",

        border: "1px solid #e6e8ec",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "58px 1fr auto",
        columnGap: 10,
        rowGap: 2,
        alignItems: "center"
      }}
      title={`${from} → ${to}`}
    >
      <div style={{ gridRow: "1 / span 2", fontVariantNumeric: "tabular-nums", fontWeight: 900 }}>
        {shortTime(t.pickupTimeLocal)}
      </div>

      <div style={{ fontWeight: 900 }}>{t.passengerShort}</div>

      <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
        {t.isRoundTrip ? <span title="Round trip">🔄</span> : null}
        {t.mobilityIcon ? <span title="Mobility">{t.mobilityIcon}</span> : null}
      </div>

      <div style={{ gridColumn: "2 / 4", fontSize: 12, color: "#334155" }}>
        <span style={{ color: "#64748b" }}>{from}</span>
        <span style={{ margin: "0 6px" }}>→</span>
        <span style={{ color: "#64748b" }}>{to}</span>
      </div>
    </div>
  );
}
