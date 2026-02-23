import { useState } from "react";
import type { AssignedBlock, DayPayload, TripCard } from "../types";
import { SLOT_PX } from "../utils/dnd";
import { TRIP_BLOCK_HEIGHT_PX } from "../config/layout.ts";

export function useDispatchDnD(params: {
  data: DayPayload | null;
  setQueues: React.Dispatch<
    React.SetStateAction<{ incoming: TripCard[]; unassigned: TripCard[]; willcall: TripCard[] }>
  >;
  setAssigned: React.Dispatch<React.SetStateAction<AssignedBlock[]>>;
  setActiveTrip: React.Dispatch<React.SetStateAction<TripCard | null>>;
}) {
  const { data, setQueues, setAssigned, setActiveTrip } = params;

  const [preview, setPreview] = useState<{
    vehicleId: string;
    topPx: number;
    heightPx: number;
  } | null>(null);

  function computeSnappedTopPx(args: {
  activeTop: number;
  overRectTop: number;
  heightPx: number;
}) {
  const { activeTop, overRectTop, heightPx } = args;

  let topPx = activeTop - overRectTop;

  const gridHeight = (data?.day.slotsPerDayView ?? 0) * SLOT_PX;
  topPx = Math.max(0, Math.min(topPx, gridHeight - heightPx));

  // Force snap to exact slot multiple
  const slotIndex = Math.round(topPx / SLOT_PX);
  topPx = slotIndex * SLOT_PX;

  return { topPx, slotIndex };
}

  function queueKeyFromOverId(overId: string): "incoming" | "unassigned" | "willcall" | null {
    if (overId === "queue-incoming") return "incoming";
    if (overId === "queue-unassigned") return "unassigned";
    if (overId === "queue-willcall") return "willcall";
    return null;
  }

  function moveTripToQueue(trip: TripCard, target: "incoming" | "unassigned" | "willcall") {
    // Remove from assigned blocks
    setAssigned((prev) => prev.filter((b) => b.trip.tripId !== trip.tripId));

    // Remove from all queues, then add to target if not already present
    setQueues((q) => {
      const incoming = q.incoming.filter((x) => x.tripId !== trip.tripId);
      const unassigned = q.unassigned.filter((x) => x.tripId !== trip.tripId);
      const willcall = q.willcall.filter((x) => x.tripId !== trip.tripId);

      const existsInTarget =
        (target === "incoming" && incoming.some((x) => x.tripId === trip.tripId)) ||
        (target === "unassigned" && unassigned.some((x) => x.tripId === trip.tripId)) ||
        (target === "willcall" && willcall.some((x) => x.tripId === trip.tripId));

      if (!existsInTarget) {
        if (target === "incoming") incoming.unshift(trip);
        if (target === "unassigned") unassigned.unshift(trip);
        if (target === "willcall") willcall.unshift(trip);
      }

      return { incoming, unassigned, willcall };
    });
  }

  function handleDragStart(e: any) {
    const trip = (e.active.data.current as any)?.trip as TripCard | undefined;
    setActiveTrip(trip ?? null);
  }

  function handleDragCancel() {
    setPreview(null);
    setActiveTrip(null);
  }

  function handleDragMove(e: any) {
    const overId = e.over?.id?.toString() ?? "";

    // Hovering over a queue: no grid preview
    if (queueKeyFromOverId(overId)) {
      setPreview(null);
      return;
    }

    // Hovering over grid vehicle column
    if (!overId.startsWith("veh-")) {
      setPreview(null);
      return;
    }

    const vehicleId = overId.slice("veh-".length);

    // Don't preview over OOS
    const veh = data?.vehicles.find((v) => v.vehicleId === vehicleId);
    if (veh?.isOutOfService) {
      setPreview(null);
      return;
    }

    const overRectTop = e.over?.rect?.top;
    if (typeof overRectTop !== "number") {
      setPreview(null);
      return;
    }

    const heightPx = TRIP_BLOCK_HEIGHT_PX;

    const activeTop =
      e.active.rect.current.translated?.top ??
      e.active.rect.current.initial?.top ??
      0;

    const { topPx } = computeSnappedTopPx({
      activeTop,
      overRectTop,
      heightPx
    });

    setPreview({ vehicleId, topPx, heightPx });
  }

  function handleDragEnd(e: any) {
    try {
      const overId = e.over?.id?.toString() ?? "";
      const trip = (e.active.data.current as any)?.trip as TripCard | undefined;
      if (!trip) return;

      // Drop onto a queue => unassign/move to that queue
      const qKey = queueKeyFromOverId(overId);
      if (qKey) {
        moveTripToQueue(trip, qKey);
        return;
      }

      // Drop onto a vehicle column => assign/move on grid
      if (!overId.startsWith("veh-")) return;

      const vehicleId = overId.slice("veh-".length);

      // Don't allow assigning onto OOS
      const veh = data?.vehicles.find((v) => v.vehicleId === vehicleId);
      if (veh?.isOutOfService) return;

      const overRectTop = e.over?.rect?.top;
      if (typeof overRectTop !== "number") return;

      const heightPx = TRIP_BLOCK_HEIGHT_PX;

      const activeTop =
        e.active.rect.current.translated?.top ??
        e.active.rect.current.initial?.top ??
        0;

      const { topPx, slotIndex } = computeSnappedTopPx({
        activeTop,
        overRectTop,
        heightPx
      });

      // Remove from queues (wherever it was)
      setQueues((q) => ({
        incoming: q.incoming.filter((x) => x.tripId !== trip.tripId),
        unassigned: q.unassigned.filter((x) => x.tripId !== trip.tripId),
        willcall: q.willcall.filter((x) => x.tripId !== trip.tripId)
      }));

      // Add/update assigned block
      setAssigned((prev) => {
        const existingIdx = prev.findIndex((b) => b.trip.tripId === trip.tripId);
        const next: AssignedBlock = { trip, vehicleId, slotIndex, topPx, heightPx };

        if (existingIdx >= 0) {
          const copy = prev.slice();
          copy[existingIdx] = next;
          return copy;
        }
        return [...prev, next];
      });
    } finally {
      setPreview(null);
      setActiveTrip(null);
    }
  }

  return { preview, handleDragStart, handleDragMove, handleDragEnd, handleDragCancel };
}
