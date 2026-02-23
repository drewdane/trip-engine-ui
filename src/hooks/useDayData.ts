import React, { useEffect, useState } from "react";
import type { DayPayload, TripCard } from "../types";

type Queues = {
  incoming: TripCard[];
  unassigned: TripCard[];
  willcall: TripCard[];
};

const emptyQueues: Queues = { incoming: [], unassigned: [], willcall: [] };

export function useDayData() {
  const [data, setData] = useState<DayPayload | null>(null);
  const [viewDate, setViewDate] = useState<string>("");

  // Per-day caches so each schedule day is independent.
  const [dataByDate, setDataByDate] = useState<Record<string, DayPayload>>({});
  const [queuesByDate, setQueuesByDate] = useState<Record<string, Queues>>({});

  // “Current day” queues the UI uses.
  const [queues, _setQueues] = useState<Queues>(emptyQueues);

  const setQueues: React.Dispatch<React.SetStateAction<Queues>> = (next) => {
    _setQueues((prevCurrent) => {
      const resolved = typeof next === "function" ? next(prevCurrent) : next;

      if (viewDate) {
        setQueuesByDate((prev) => ({ ...prev, [viewDate]: resolved }));
      }

      return resolved;
    });
  };

  useEffect(() => {
    // First load: fetch once, then adopt payload day as viewDate.
    // After that: viewDate drives which cached day is active.

    // If we already have this day cached, just load it and DO NOT refetch/overwrite.
    if (viewDate && dataByDate[viewDate]) {
      setData(dataByDate[viewDate]);
      _setQueues(queuesByDate[viewDate] ?? emptyQueues);
      return;
    }

    const url = viewDate ? `/day.json?date=${encodeURIComponent(viewDate)}` : "/day.json";

    fetch(url)
      .then((r) => r.json())
      .then((payload: DayPayload) => {
        const effectiveDate = viewDate || payload.day?.dateLocal || "";

        // Normalize payload so the UI agrees with the selected schedule date.
        const normalized: DayPayload = {
          ...payload,
          day: { ...payload.day, dateLocal: effectiveDate }
        };

        setData(normalized);

        // If this is the first load, adopt the payload's day as the current view.
        if (!viewDate && effectiveDate) {
          setViewDate(effectiveDate);
        }

        const nextQueues: Queues = {
          incoming: normalized.incomingRequests ?? [],
          unassigned: normalized.unassignedTrips ?? [],
          willcall: normalized.willCallTrips ?? []
        };

        _setQueues(nextQueues);

        if (effectiveDate) {
          setDataByDate((prev) => ({ ...prev, [effectiveDate]: normalized }));
          setQueuesByDate((prev) => ({ ...prev, [effectiveDate]: nextQueues }));
        }
      })
      .catch(console.error);
  }, [viewDate, dataByDate, queuesByDate]);

  return { data, setData, viewDate, setViewDate, queues, setQueues };
}