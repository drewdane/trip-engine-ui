import { useMemo, useRef, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { sortVehiclesForGrid } from "./utils/sortVehicles";
import { SLOT_PX } from "./utils/dnd";
import { TimeAxis } from "./components/TimeAxis";
import { layout } from "./config/layout";
import { TripCardCompactOverlay } from "./components/TripCardCompact";
import { QueueSection } from "./components/QueueSection";
import { VehicleColumnBody } from "./components/VehicleColumnBody";
import { useDayData } from "./hooks/useDayData";
import { useDispatchDnD } from "./hooks/useDispatchDnD";
import { useNowLine } from "./hooks/useNowLine";
import { VehicleHeadersRow } from "./components/VehicleHeadersRow";
import type { AssignedBlock, TripCard } from "./types";

export default function App() {
  const { data, queues, setQueues } = useDayData();
  const [activeTrip, setActiveTrip] = useState<TripCard | null>(null);

  const [assigned, setAssigned] = useState<AssignedBlock[]>([]);

  const vScrollRef = useRef<HTMLDivElement | null>(null);
  const dnd = useDispatchDnD({
    data,
    setQueues,
    setAssigned,
    setActiveTrip
  });

    const sortedVehicles = useMemo(() => {
    if (!data) return [];
    return sortVehiclesForGrid(data.vehicles);
  }, [data]);

  const nowLineTop = useNowLine({ data, vScrollRef, viewportHeightPx: layout.viewportHeightPx });

  if (!data) return <div style={{ padding: 24 }}>Loading day…</div>;

  const dayStart = new Date(data.day.startTimeLocal);
  const slots = data.day.slotsPerDayView;
  const gridHeight = slots * SLOT_PX;

  return (
    <DndContext
      onDragStart={dnd.handleDragStart}
      onDragMove={dnd.handleDragMove}
      onDragEnd={dnd.handleDragEnd}
      onDragCancel={dnd.handleDragCancel}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, overflowX: "hidden" }}>
        {/* LEFT PANEL */}
        <div
          style={{
            width: 340,
            flex: "0 0 auto",
            position: "sticky",
            top: 12,
            alignSelf: "flex-start",
            height: "calc(100vh - 24px)"
          }}
        >
          <div
            style={{
              border: "1px solid #e6e8ec",
              borderRadius: 12,
              background: "#fff",
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Notifications header stays visible */}
            <div style={{ padding: 10, borderBottom: "1px solid #e6e8ec", background: "#f8fafc", flex: "0 0 auto" }}>
              <div style={{ fontWeight: 800 }}>Notifications</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>No new alerts</div>
            </div>

            {/* Queues scroll inside the panel */}
            <div style={{ padding: 10, display: "grid", gap: 12, overflowY: "auto", flex: "1 1 auto" }}>
              <QueueSection title="Incoming" tone="incoming" items={queues.incoming} droppableId="queue-incoming" />
              <QueueSection title="Unassigned" tone="normal" items={queues.unassigned} droppableId="queue-unassigned" />
              <QueueSection title="Will-Call" tone="willcall" items={queues.willcall} droppableId="queue-willcall" />
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ padding: 12, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
              <h1 style={{ margin: 0 }}>Trip Engine</h1>
              <div style={{ color: "#64748b" }}>{data.day.dateLocal}</div>
              <div style={{ color: "#64748b" }}>{data.org.timezone}</div>
            </div>

            {/* Outer frame (scroll happens inside vScrollRef now) */}
            <div
              style={{
                border: "1px solid #e6e8ec",
                borderRadius: 12,
                background: "#fff",
                padding: 10,
                overflowX: "hidden",
                position: "relative"
              }}
            >
              {/* Single scroll area: horizontal + vertical (synced) */}
              <div
                ref={vScrollRef}
                style={{
                  marginTop: 8,
                  height: layout.viewportHeightPx + layout.headerHeight + 8,
                  overflowY: "auto",
                  overflowX: "auto",
                  borderTop: "1px solid #f1f5f9"
                }}
              >
                {/* Sticky header row INSIDE the scroll container so it stays synced with scrollLeft */}
                <div style={{ position: "sticky", top: 0, zIndex: 80, background: "#fff" }}>
                  <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                    {/* Time axis spacer */}
                    <div
                      style={{
                        width: layout.timeAxisWidth,
                        flex: "0 0 auto",
                        height: layout.headerHeight,
                        borderRight: "1px solid #e6e8ec",
                        position: "sticky",
                        left: 0,
                        zIndex: 90,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 800
                      }}
                    >
                      TIME
                    </div>

                    {/* Vehicle headers */}
                    <VehicleHeadersRow vehicles={sortedVehicles} />
                  </div>
                </div>

                {/* Body row (time axis + vehicle columns) */}
                <div style={{ display: "flex", gap: 0, position: "relative" }}>
                  {nowLineTop !== null ? (
                    <div
                      style={{
                        position: "absolute",
                        top: nowLineTop,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "#ef4444",
                        zIndex: 20,
                        pointerEvents: "none"
                      }}
                      title="Now"
                    />
                  ) : null}

                  <TimeAxis
                    gridHeight={gridHeight}
                    slots={slots}
                    dayStart={dayStart}
                    slotMinutes={data.day.slotMinutes}
                  />

                  {/* Vehicle column bodies (DROPPABLE) */}
                  <div
                    style={{
                      display: "grid",
                      gridAutoFlow: "column",
                      gridAutoColumns: `${layout.colWidth}px`,
                      gap: layout.colGap,
                      alignItems: "start"
                    }}
                  >
                    {sortedVehicles.map((v) => (
                      <div
                        key={v.vehicleId}
                        style={{
                          border: "1px solid #e6e8ec",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: v.isOutOfService ? "#f1f5f9" : "#fff",
                          opacity: v.isOutOfService ? 0.95 : 1
                        }}
                      >
                        <VehicleColumnBody
                          vehicleId={v.vehicleId}
                          gridHeight={gridHeight}
                          slots={slots}
                          isOutOfService={v.isOutOfService}
                          assignedBlocks={assigned.filter((b) => b.vehicleId === v.vehicleId)}
                          preview={dnd.preview}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTrip ? <TripCardCompactOverlay t={activeTrip} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
