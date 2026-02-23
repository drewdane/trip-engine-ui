export const layout = {
  viewportHeightPx: 560,
  headerHeight: 86,
  timeAxisWidth: 64,
  colWidth: 210,
  colGap: 8,
  border: "1px solid #d6d8e6",
  borderRadius: 12,
  background: "#f0e4e4",
} as const;

export const SLOT_PX = 30;          // already used in dnd.ts — keep it here for central place
export const TRIP_BLOCK_HEIGHT_PX = 90;  // = 3 slots × 30 px → 45 minutes
export const HEADER_HEIGHT = 120;   // approximate — used in VehicleHeadersRow etc.
export const TIME_AXIS_WIDTH = 80;  // approximate — adjust as needed