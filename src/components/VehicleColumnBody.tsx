import { useDroppable } from "@dnd-kit/core";
import type { AssignedBlock } from "../types";
import { SLOT_PX } from "../config/layout";
import { shortPlace, shortTime } from "../utils/time";

export function VehicleColumnBody({
  vehicleId,
  gridHeight,
  slots,
  isOutOfService,
  assignedBlocks,
  preview,
  slotMinutes,
}: {
  vehicleId: string;
  gridHeight: number;
  slots: number;
  isOutOfService: boolean;
  assignedBlocks: AssignedBlock[];
  preview: { vehicleId: string; topPx: number; heightPx: number } | null;
  slotMinutes: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `veh-${vehicleId}`,
  });

  const hourEvery = Math.max(1, Math.round(60 / slotMinutes));

  return (
    <div
      ref={setNodeRef}
      style={{
        height: gridHeight,
        position: "relative",
        background: isOutOfService ? "#f1f5f9" : "#fff",
        outline: isOver && !isOutOfService ? "2px solid #60a5fa" : "none",
        outlineOffset: -2,
      }}
    >
      {/* Slot rows: grid owns the same time rules as TimeAxis */}
      {Array.from({ length: slots }).map((_, i) => {
        const isHour = i % hourEvery === 0;
        const isQuarter0to15 = isHour;

        return (
          <div
            key={i}
            style={{
              height: SLOT_PX,
              boxSizing: "border-box",
              borderTop: isHour ? "2px solid #64748b" : "1px dashed #f0f2f5",
              background: isQuarter0to15 ? "rgba(15, 23, 42, 0.04)" : "transparent",
            }}
          />
        );
      })}

      {preview && preview.vehicleId === vehicleId && (
        <div
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            top: preview.topPx,
            height: preview.heightPx,
            borderRadius: 10,
            border: "2px dashed #94a3b8",
            background: "rgba(148, 163, 184, 0.15)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      )}

      {assignedBlocks.map((b) => {
        const from = shortPlace(
          b.trip.pickupCode,
          b.trip.pickupLabel,
          b.trip.pickupStreet,
          b.trip.pickupCity
        );
        const to = shortPlace(
          b.trip.dropoffCode,
          b.trip.dropoffLabel,
          b.trip.dropoffStreet,
          b.trip.dropoffCity
        );

        return (
          <div
            key={b.trip.tripId}
            style={{
              position: "absolute",
              left: 6,
              right: 6,
              top: b.topPx,
              height: b.heightPx,
              transition: "top 120ms ease-out",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              padding: "6px 8px",
              overflow: "hidden",
            }}
            title={`${from} → ${to}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontWeight: 900, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                {shortTime(b.trip.pickupTimeLocal)}
              </div>
              <div style={{ fontSize: 12 }}>{b.trip.mobilityIcon ?? ""}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 12, marginTop: 2 }}>
              {b.trip.passengerShort}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {from} → {to}
            </div>
          </div>
        );
      })}
    </div>
  );
}