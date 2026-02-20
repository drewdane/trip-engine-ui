import { useEffect, useState } from "react";
import type { DayPayload, TripCard } from "../types";

export function useDayData() {
  const [data, setData] = useState<DayPayload | null>(null);
  const [queues, setQueues] = useState<{
    incoming: TripCard[];
    unassigned: TripCard[];
    willcall: TripCard[];
  }>({ incoming: [], unassigned: [], willcall: [] });

  useEffect(() => {
    fetch("/day.json")
      .then((r) => r.json())
      .then((payload: DayPayload) => {
        setData(payload);
        setQueues({
          incoming: payload.incomingRequests ?? [],
          unassigned: payload.unassignedTrips ?? [],
          willcall: payload.willCallTrips ?? []
        });
      })
      .catch(console.error);
  }, []);

  return { data, setData, queues, setQueues };
}
