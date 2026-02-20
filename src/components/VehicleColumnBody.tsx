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
        borderRadius: 10,
        border: "1px solid #cbd5e1",
        background: "#f8fafc",
        padding: "6px 8px",
        overflow: "hidden",
        cursor: "grab",
        opacity: isDragging ? 0.35 : 1,
        // Keep this block above slot lines, below preview
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

      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
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
        background: isOutOfService ? "#f1f5f9" : "#fff"
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
          <div key={i} style={{ height: SLOT_PX, borderBottom: "1px dashed #f0f2f5" }} />
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
