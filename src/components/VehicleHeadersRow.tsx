import { layout } from "../config/layout";

export function VehicleHeadersRow({
  vehicles
}: {
  vehicles: Array<{
    vehicleId: string;
    unitNumber: string;
    isOutOfService: boolean;
    drivers: string[];
    capabilities: string[];
  }>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: `${layout.colWidth}px`,
        columnGap: layout.colGap,
        alignItems: "start"
      }}
    >
      {vehicles.map((v) => (
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
          <div
            style={{
              height: layout.headerHeight,
              padding: 8,
              borderBottom: "1px solid #e6e8ec",
              background: v.isOutOfService ? "#f1f5f9" : "#fff"
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, textAlign: "center", lineHeight: 1 }}>
              {v.unitNumber}
            </div>
            <div style={{ marginTop: 4, textAlign: "center", fontWeight: 800, fontSize: 13 }}>
              {v.drivers.join(" • ")}
            </div>
            <div style={{ marginTop: 6, textAlign: "center", fontSize: 16 }}>
              {v.capabilities.join(" ")}
            </div>
            {v.isOutOfService ? (
              <div style={{ marginTop: 4, textAlign: "center", fontWeight: 900, color: "#991b1b" }}>
                ☠️ OOS
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
