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
            background: v.isOutOfService ? "#e4e4f0" : "#e4d6d6",
            opacity: v.isOutOfService ? 0.95 : 1
          }}
        >
          <div
            style={{
              height: layout.headerHeight,
              padding: 8,
              borderBottom: "1px solid #e6e8ec",
              background: v.isOutOfService
                ? "#f1f5f9"
                : "linear-gradient(to bottom, #fafbff 20%, #f1f3fb 80%)",
              position: "relative"
            }}
          >
            {v.isOutOfService ? (
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 900,
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  lineHeight: 1.2
                }}
                title="Out of service"
              >
                OOS
              </div>
            ) : null}

            <div style={{ fontSize: 26, fontWeight: 900, textAlign: "center", lineHeight: 1 }}>
              {v.unitNumber}
            </div>

            <div style={{ marginTop: 4, textAlign: "center", fontWeight: 800, fontSize: 13 }}>
              {v.isOutOfService ? "Out of service" : v.drivers.join(" • ")}
            </div>

            {!v.isOutOfService ? (
              <div style={{ marginTop: 6, textAlign: "center", fontSize: 16 }}>
                {v.capabilities.join(" ")}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
