import type { DayPayload } from "../types";

export function sortVehiclesForGrid(vehicles: DayPayload["vehicles"]) {
  const v = [...vehicles];
  v.sort((a, b) => {
    if (a.isOutOfService !== b.isOutOfService) return a.isOutOfService ? 1 : -1;
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
  return v;
}
