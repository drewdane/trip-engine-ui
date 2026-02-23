import { useDroppable, useDraggable } from "@dnd-kit/core";
import type { AssignedBlock } from "../types";
import { SLOT_PX } from "../utils/dnd";
import { shortPlace, shortTime } from "../utils/time";

function AssignedTripBlock({ b }: { b: AssignedBlock }) {
  // Use the SAME draggable id scheme as queue cards, so the DnD hook sees { trip }
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `trip-${b.trip.tripId}`,
    data: { trip: b.trip }
  });

  const from = shortPlace(b.trip.pickupCode, b.trip.pickupLabel, b.trip.pickupStreet, b.trip.pickupCity);
  const to = shortPlace(b.trip.dropoffCode, b.trip.dropoffLabel, b.trip.dropoffStreet, b.trip.dropoffCity);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: "absolute",
        left: 6,
        right: 6,
        top: b.topPx,
        height: b.heightPx,
        boxSizing: "border-box",
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        background: "#fcf8f8",
        padding: "6px 8px",
        overflow: "hidden",
        cursor: "grab",
        opacity: isDragging ? 0.35 : 1,
        zIndex: 20
      }}
      title={`${from} → ${to}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 900, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
          {shortTime(b.trip.pickupTimeLocal)}
        </div>
        <div style={{ fontSize: 12 }}>{b.trip.mobilityIcon ?? ""}</div>
      </div>

      <div style={{ fontWeight: 900, fontSize: 12, marginTop: 2 }}>{b.trip.passengerShort}</div>

      <div style={{ fontSize: 11, color: "#8b6464", marginTop: 2 }}>
        {from} → {to}
      </div>
    </div>
  );
}

export function VehicleColumnBody({
  vehicleId,
  gridHeight,
  slots,
  isOutOfService,
  assignedBlocks,
  preview
}: {
  vehicleId: string;
  gridHeight: number;
  slots: number;
  isOutOfService: boolean;
  assignedBlocks: AssignedBlock[];
  preview: { vehicleId: string; topPx: number; heightPx: number } | null;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `veh-${vehicleId}`
  });

  return (
    <div
      style={{
        height: gridHeight,
        position: "relative",
        background: isOutOfService ? "#fee2e2" : "#f2f3f8"
      }}
    >
      {/* Inner droppable surface (stable coordinate space under scroll) */}
      <div
        ref={setNodeRef}
        style={{
          position: "absolute",
          inset: 0,
          outline: isOver && !isOutOfService ? "2px solid #60a5fa" : "none",
          outlineOffset: -2
        }}
      >
        {/* Slot lines */}
        {Array.from({ length: slots }).map((_, i) => (
          <div
            key={i}
            style={{
              height: SLOT_PX,
              borderBottom: i % 4 === 0 ? "2px solid #64748b" : "1px dashed #c4c7da",
              boxSizing: "border-box",
              transform: "translateY(-1px)"
            }}
          />
        ))}

        {/* Preview frame */}
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
              zIndex: 50
            }}
          />
        )}

        {/* Assigned blocks (now draggable) */}
        {assignedBlocks.map((b) => (
          <AssignedTripBlock key={b.trip.tripId} b={b} />
        ))}
      </div>
    </div>
  );
}
