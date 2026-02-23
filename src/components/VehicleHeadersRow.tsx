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
        gap: layout.colGap,
        alignItems: "start"
      }}
    >
      {vehicles.map((v) => (
        <div
          key={v.vehicleId}
          style={{
            border: "1px solid #e6e8ec",
            borderRadius: 10,
            overflow: "hidden",
            background: v.isOutOfService
                ? "#f1f5f9"
                : "linear-gradient(to bottom, #fafbff 20%, #f1f3fb 80%)",
            opacity: v.isOutOfService ? 0.95 : 1
          }}
        >
          <div
            style={{
              height: layout.headerHeight,
              padding: "6px 8px",
              borderBottom: "1px solid #e6e8ec",
              background: v.isOutOfService
                ? "#f1f5f9"
                : "linear-gradient(to bottom, #fafbff 20%, #f1f3fb 80%)",
              boxSizing: "border-box"
            }}
          >
            {/* Unit number */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: "24px",
                marginTop: 2
              }}
            >
              {v.unitNumber}
            </div>

            {/* Drivers row OR OOS row (same slot) */}
            <div
              style={{
                textAlign: "center",
                fontWeight: 800,
                fontSize: 14,
                lineHeight: "18px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: v.isOutOfService ? "#991b1b" : "#0f172a"
              }}
              title={v.isOutOfService ? "Out of Service" : (v.drivers?.join(" • ") ?? "")}
            >
              {v.isOutOfService ? "☠️ OUT OF SERVICE" : (v.drivers?.join(" • ") ?? "")}
            </div>

            {/* Capabilities */}
            <div
              style={{
                textAlign: "center",
                fontSize: 16,
                lineHeight: "20px"
              }}
            >
              {v.capabilities?.join(" ") ?? ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}