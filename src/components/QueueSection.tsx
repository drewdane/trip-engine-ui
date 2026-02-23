import { useDroppable } from "@dnd-kit/core";
import type { TripCard } from "../types";
import { TripCardCompact } from "./TripCardCompact";

export function QueueSection({
  title,
  items = [],
  tone,
  droppableId
}: {
  title: string;
  items?: TripCard[];
  tone: "normal" | "willcall" | "incoming";
  droppableId: string; //"queue-unassigned" | "queue-willcall" | "queue-incoming" 
}) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  const badge = tone === "willcall" ? "🟠" : tone === "normal" ? "🔵" : "🟣";

  return (
    <div
      ref={setNodeRef}
      style={{
        border: isOver ? "2px solid #60a5fa" : "1px solid #d6d8e6",
        borderRadius: 12,
        padding: 10,
        background: isOver ? "rgba(96, 165, 250, 0.10)" : "#f2f3f8"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900 }}>
          {badge} {title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>{items.length}</div>
      </div>

      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        {items.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              padding: "8px 10px",
              border: "1px dashed #e6e8ec",
              borderRadius: 10
            }}
          >
            Drop here to {title.toLowerCase()}.
          </div>
        ) : (
          items
            .slice()
            .sort((a, b) => a.pickupTimeLocal.localeCompare(b.pickupTimeLocal))
            .map((t) => <TripCardCompact key={t.tripId} t={t} />)
        )}
      </div>
    </div>
  );
}
