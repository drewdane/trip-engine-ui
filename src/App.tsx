import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { layout, SLOT_PX } from "./config/layout";
import { TimeAxis } from "./components/TimeAxis";
import { QueueSection } from "./components/QueueSection";
import { VehicleColumnBody } from "./components/VehicleColumnBody";
import { VehicleHeadersRow } from "./components/VehicleHeadersRow";
import { TripCardCompactOverlay } from "./components/TripCardCompact";
import { useDayData } from "./hooks/useDayData";
import { useNowLine } from "./hooks/useNowLine";
import { useLiveClock } from "./hooks/useLiveClock";
import { useJumpToNow } from "./hooks/useJumpToNow";
import { useDispatchDnD } from "./hooks/useDispatchDnD";
import { sortVehiclesForGrid } from "./utils/sortVehicles";
import { localYmd, shiftYmd, formatFriendlyDateInTz } from "./utils/time";
import type { AssignedBlock, TripCard } from "./types";

export default function App() {
  const { data, queues, setQueues, viewDate, setViewDate } = useDayData();

  const nowText = useLiveClock(data);

  const [activeTrip, setActiveTrip] = useState<TripCard | null>(null);

  const [assignedByDate, setAssignedByDate] = useState<Record<string, AssignedBlock[]>>({});

  const assigned = assignedByDate[viewDate] ?? [];

  const setAssigned = (next: AssignedBlock[] | ((prev: AssignedBlock[]) => AssignedBlock[])) => {
    setAssignedByDate((prev) => {
      const current = prev[viewDate] ?? [];
      const updated = typeof next === "function" ? next(current) : next;
      return { ...prev, [viewDate]: updated };
    });
  };

  useEffect(() => {
    setActiveTrip(null);
  }, [viewDate]);

  const vScrollRef = useRef<HTMLDivElement | null>(null);
  const dnd = useDispatchDnD({
    data,
    setQueues,
    setAssigned,
    setActiveTrip,
  });

  const sortedVehicles = useMemo(() => {
    if (!data) return [];
    return sortVehiclesForGrid(data.vehicles);
  }, [data]);

  const nowLineTop = useNowLine({ data, vScrollRef, viewportHeightPx: layout.viewportHeightPx });

  // ←←← Grid height calculated early so hooks can use it
  const slots = data?.day?.slotsPerDayView ?? 0;
  const gridHeight = slots * SLOT_PX;
  const dayStart = data ? new Date(data.day.startTimeLocal) : new Date();

  const { jumpToNow } = useJumpToNow({
    data,
    viewDate,
    setViewDate,
    nowLineTop,
    vScrollRef,
    viewportHeightPx: layout.viewportHeightPx,
  });

  if (!data) return <div style={{ padding: 24 }}>Loading day…</div>;

  return (
    <DndContext
      onDragStart={dnd.handleDragStart}
      onDragMove={dnd.handleDragMove}
      onDragEnd={dnd.handleDragEnd}
      onDragCancel={dnd.handleDragCancel}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, overflowX: "hidden" }}>
        {/* LEFT PANEL (unchanged) */}
        <div style={{ width: 340, flex: "0 0 auto", position: "sticky", top: 12, alignSelf: "flex-start", height: "calc(100vh - 24px)" }}>
          <div style={{ border: "1px solid #d6d8e6", borderRadius: 12, background: "#e4e4f0", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 10, borderBottom: "1px solid #d6d8e6", background: "#e4faf0", flex: "0 0 auto" }}>
              <div style={{ fontWeight: 800 }}>Notifications</div>
              <div style={{ fontSize: 12, color: "#0f172a" }}>No new alerts</div>
            </div>
            <div style={{ padding: 10, display: "grid", gap: 12, overflowY: "auto", flex: "1 1 auto" }}>
              <QueueSection title="Incoming" tone="incoming" items={queues.incoming} droppableId="queue-incoming" />
              <QueueSection title="Unassigned" tone="normal" items={queues.unassigned} droppableId="queue-unassigned" />
              <QueueSection title="Will-Call" tone="willcall" items={queues.willcall} droppableId="queue-willcall" />
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ flex: 1, minWidth: 0, height: "calc(100vh - 24px)" }}>
          <div style={{ padding: 12, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, position: "relative" }}>
              <h1 style={{ margin: 0 }}>Trip Engine</h1>

              {/* Center clock */}
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap", pointerEvents: "none" }}>
                <div style={{ fontSize: "2em", fontWeight: 900, color: "#0f172a" }}>{nowText}</div>
                <div style={{ fontSize: "1em", fontWeight: 800, color: "#64748b" }}>
                  {formatFriendlyDateInTz(new Date(), data.org.timezone)}
                </div>
              </div>

              {/* Schedule controls */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: "#64748b", fontWeight: 800 }}>Schedule:</div>

                <button onClick={() => setViewDate(shiftYmd(viewDate, -1))} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #e6e8ec", background: "#fff", cursor: "pointer", fontWeight: 700 }} title="Previous day">◀</button>

                <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #e6e8ec", background: "#fff", fontWeight: 800 }} aria-label="Schedule date" />

                <button onClick={() => setViewDate(shiftYmd(viewDate, +1))} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #e6e8ec", background: "#fff", cursor: "pointer", fontWeight: 700 }} title="Next day">▶</button>

                <button onClick={() => setViewDate(localYmd(new Date(), data.org.timezone))} style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid #e6e8ec", background: "#f8fafc", cursor: "pointer", fontWeight: 900 }} title="Go to today (org timezone)">Today</button>
              </div>
            </div>

            {/* Grid area (unchanged except Now button uses the hook) */}
            <div style={{ border: "1px solid #d6d8e6", borderRadius: 12, background: "#e4e4f0", padding: 10, overflowX: "hidden", position: "relative", flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div ref={vScrollRef} style={{ marginTop: 8, flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "auto", borderTop: "1px solid #d6d8e6" }}>
                {/* Sticky header */}
                <div style={{ position: "sticky", top: 0, zIndex: 60, background: "#e4e4f0", height: layout.headerHeight }}>
                  <div style={{ display: "flex", gap: 0, alignItems: "stretch", height: "100%" }}>
                    <div style={{ width: layout.timeAxisWidth, flex: "0 0 auto", borderRight: "1px solid #d6d8e6", position: "sticky", left: 0, zIndex: 95, background: "#e4e4f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#64748b", fontWeight: 800, alignSelf: "stretch" }}>
                      <button
                        onClick={jumpToNow}
                        disabled={!data?.org?.timezone}
                        title="Jump to now"
                        style={{ appearance: "none", border: "1px solid #8b6464", background: "#77aa97ec", color: "#fff", cursor: "pointer", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 800 }}
                      >
                        Now
                      </button>
                    </div>
                    <VehicleHeadersRow vehicles={sortedVehicles} />
                  </div>
                </div>

                {/* Body */}
                <div style={{ display: "flex", gap: 0, position: "relative" }}>
                  {nowLineTop !== null && (
                    <div style={{ position: "absolute", top: nowLineTop, left: 0, right: 0, height: 2, background: "#ef4444", zIndex: 20, pointerEvents: "none" }} title="Now" />
                  )}

                  <TimeAxis gridHeight={gridHeight} slots={slots} dayStart={dayStart} slotMinutes={data.day.slotMinutes} />

                  <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: `${layout.colWidth}px`, gap: layout.colGap, alignItems: "start" }}>
                    {sortedVehicles.map((v) => (
                      <div key={v.vehicleId} style={{ border: "1px solid #d6d8e6", borderRadius: 12, overflow: "hidden", background: v.isOutOfService ? "#f9f1f1" : "#fff", opacity: v.isOutOfService ? 0.95 : 1 }}>
                        <VehicleColumnBody
                          vehicleId={v.vehicleId}
                          gridHeight={gridHeight}
                          slots={slots}
                          slotMinutes={data.day.slotMinutes}
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

      <DragOverlay>{activeTrip ? <TripCardCompactOverlay t={activeTrip} /> : null}</DragOverlay>
    </DndContext>
  );
}