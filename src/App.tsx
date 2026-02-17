import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";

type TripCard = {
  tripId: string;
  pickupTimeLocal: string; // ISO or "HH:MM"
  passengerShort: string; // e.g. "J. Smith"
  mobilityIcon?: string; // e.g. "👩‍🦽"
  pickupLabel?: string;   // e.g. "Marine Creek Clinic" or "1234 Oak St (FW)"
  dropoffLabel?: string;  // e.g. "Harris Downtown"
  pickupCity?: string;    // optional, for fallback
  dropoffCity?: string;
  pickupStreet?: string;  // optional, for fallback
  dropoffStreet?: string;
  payeeAccount?: string;
  isRoundTrip?: boolean;
};

type DayPayload = {
  org: { orgId: string; timezone: string };
  day: {
    dateLocal: string;
    startTimeLocal: string;
    slotMinutes: number;
    slotsPerDayView: number;
  };
  vehicles: Array<{
    vehicleId: string;
    unitNumber: string;
    isOutOfService: boolean;
    displayOrder: number;
    drivers: string[];
    capabilities: string[];
  }>;

  // ✅ queues live at the top level (matches your day.json usage in JSX)
  incomingRequests: TripCard[];
  unassignedTrips: TripCard[];
  willCallTrips: TripCard[];
};

const SLOT_PX = 16;

function yyyyMmDdInTz(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function minutesSinceDayStartInTz(now: Date, dayStartLocalIso: string): number {
  const start = new Date(dayStartLocalIso);
  return Math.floor((now.getTime() - start.getTime()) / 60000);
}

function timeLabelFromSlot(dayStart: Date, slotMinutes: number, slotIndex: number): string {
  const d = new Date(dayStart.getTime() + slotIndex * slotMinutes * 60_000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function shortTime(pickupTimeLocal: string): string {
  if (/^\d{2}:\d{2}/.test(pickupTimeLocal)) return pickupTimeLocal.slice(0, 5);
  const d = new Date(pickupTimeLocal);
  if (Number.isNaN(d.getTime())) return pickupTimeLocal;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function shortPlace(
  label?: string,
  street?: string,
  city?: string
): string {
  // Prefer explicit facility / place label
  if (label && label.trim().length > 0) return label.trim();

  // Residence fallback: street name only + optional city
  // (Don’t show number-heavy full address in compact view)
  const streetOnly = street
    ? street.replace(/^\s*\d+\s+/, "").trim() // remove leading house number
    : "";

  if (streetOnly && city) return `${streetOnly} (${city})`;
  if (streetOnly) return streetOnly;
  if (city) return city;

  return "—";
}

function TripCardCompact({ t }: { t: TripCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `trip-${t.tripId}`,
      data: { trip: t }
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab" as const
  };

  const from = shortPlace(t.pickupLabel, t.pickupStreet, t.pickupCity);
  const to = shortPlace(t.dropoffLabel, t.dropoffStreet, t.dropoffCity);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        border: "1px solid #e6e8ec",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#fff",
        display: "grid",
        gridTemplateColumns: "58px 1fr auto",
        columnGap: 10,
        rowGap: 2,
        alignItems: "center"
      }}
      title={`${from} → ${to}`}
    >
      {/* Time */}
      <div
        style={{
          gridRow: "1 / span 2",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 900
        }}
      >
        {shortTime(t.pickupTimeLocal)}
      </div>

      {/* Passenger */}
      <div style={{ fontWeight: 900 }}>{t.passengerShort}</div>

      {/* Icons */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          justifyContent: "flex-end"
        }}
      >
        {t.isRoundTrip ? <span title="Round trip">🔄</span> : null}
        {t.mobilityIcon ? <span title="Mobility">{t.mobilityIcon}</span> : null}
      </div>

      {/* From → To */}
      <div style={{ gridColumn: "2 / 4", fontSize: 12, color: "#334155" }}>
        <span style={{ color: "#64748b" }}>{from}</span>
        <span style={{ margin: "0 6px" }}>→</span>
        <span style={{ color: "#64748b" }}>{to}</span>
      </div>
    </div>
  );
}

function QueueSection({
  title,
  items = [],
  tone
}: {
  title: string;
  items: TripCard[];
  tone: "incoming" | "normal" | "willcall";
}) {
  const badge = tone === "incoming" ? "🟣" : tone === "willcall" ? "🟠" : "🔵";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900 }}>
          {badge} {title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>{items.length}</div>
      </div>

      <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
        {items.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              padding: "8px 10px",
              border: "1px dashed #e6e8ec",
              borderRadius: 10
            }}
          >
            (none)
          </div>
        ) : (
          items
            .slice()
            .sort((a, b) => a.pickupTimeLocal.localeCompare(b.pickupTimeLocal))
            .map((t) => <TripCardCompact key={t.tripId} t={t} />)
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<DayPayload | null>(null);
  const vScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/day.json")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const viewportHeightPx = 560; // prototype-ish feel
  const headerHeight = 100;
  const timeAxisWidth = 64;
  const colWidth = 210;
  const colGap = 8;

  const sortedVehicles = useMemo(() => {
    if (!data) return [];
    const v = [...data.vehicles];
    v.sort((a, b) => {
      if (a.isOutOfService !== b.isOutOfService) return a.isOutOfService ? 1 : -1;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
    return v;
  }, [data]);

  const nowLineTop = useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const isTodayInOrgTz = yyyyMmDdInTz(now, data.org.timezone) === data.day.dateLocal;
    if (!isTodayInOrgTz) return null;

    const mins = minutesSinceDayStartInTz(now, data.day.startTimeLocal);
    const maxMins = data.day.slotsPerDayView * data.day.slotMinutes;

    if (mins < 0 || mins > maxMins) return null;
    return (mins / data.day.slotMinutes) * SLOT_PX;
  }, [data]);

  useEffect(() => {
    if (!data) return;
    if (!vScrollRef.current) return;
    if (nowLineTop === null) return;

    const target = Math.max(0, nowLineTop - viewportHeightPx / 2);

    requestAnimationFrame(() => {
      vScrollRef.current?.scrollTo({ top: target, behavior: "auto" });
    });
  }, [data, nowLineTop, viewportHeightPx]);

  if (!data) return <div style={{ padding: 24 }}>Loading day…</div>;

  const dayStart = new Date(data.day.startTimeLocal);
  const slots = data.day.slotsPerDayView;
  const gridHeight = slots * SLOT_PX;

  return (
  <DndContext>
    <div style={{ display: "flex", gap: 12, padding: 12 }}>
      {/* LEFT PANEL */}
      <div style={{ width: 340, flex: "0 0 auto" }}>
        <div
          style={{
            border: "1px solid #e6e8ec",
            borderRadius: 12,
            background: "#fff",
            overflow: "hidden",
            height: headerHeight + viewportHeightPx + 60
          }}
        >
          <div style={{ padding: 10, borderBottom: "1px solid #e6e8ec", background: "#f8fafc" }}>
            <div style={{ fontWeight: 800 }}>Notifications</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>No new alerts</div>
          </div>

          <div style={{ padding: 10, display: "grid", gap: 12 }}>
            <QueueSection title="Incoming Requests" items={data.incomingRequests} tone="incoming" />
            <QueueSection title="Unassigned" items={data.unassignedTrips} tone="normal" />
            <QueueSection title="Will-Call" items={data.willCallTrips} tone="willcall" />
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ flex: 1, minWidth: 800 }}>
        <div style={{ padding: 12, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
            <h1 style={{ margin: 0 }}>Trip Engine</h1>
            <div style={{ color: "#64748b" }}>{data.day.dateLocal}</div>
            <div style={{ color: "#64748b" }}>{data.org.timezone}</div>
          </div>

          {/* Outer frame scrolls horizontally */}
          <div
            style={{
              border: "1px solid #e6e8ec",
              borderRadius: 12,
              background: "#fff",
              padding: 10,
              overflowX: "auto",
              position: "relative"
            }}
          >
            {/* Header row: time spacer (sticky) + vehicle headers */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  width: timeAxisWidth,
                  flex: "0 0 auto",
                  position: "sticky",
                  left: 0,
                  zIndex: 50,
                  background: "#fff"
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridAutoColumns: `${colWidth}px`,
                  gap: colGap,
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
                    <div
                      style={{
                        height: headerHeight,
                        padding: 8,
                        borderBottom: "1px solid #e6e8ec",
                        background: v.isOutOfService ? "#f1f5f9" : "#fff"
                      }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 900, textAlign: "center", lineHeight: 1 }}>
                        {v.unitNumber}
                      </div>
                      <div style={{ marginTop: 4, textAlign: "center", fontWeight: 800, fontSize: 14 }}>
                        {v.drivers.join(" • ")}
                      </div>
                      <div style={{ marginTop: 6, textAlign: "center", fontSize: 18 }}>
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
            </div>

            {/* Single vertical scroll area: time + bodies (synced) */}
            <div
              ref={vScrollRef}
              style={{
                marginTop: 8,
                height: viewportHeightPx,
                overflowY: "auto",
                overflowX: "visible",
                borderTop: "1px solid #f1f5f9"
              }}
            >
              <div style={{ display: "flex", gap: 8, position: "relative" }}>
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

                {/* STICKY time axis */}
                <div
                  style={{
                    width: timeAxisWidth,
                    flex: "0 0 auto",
                    borderRight: "1px solid #e6e8ec",
                    position: "sticky",
                    left: 0,
                    zIndex: 50,
                    background: "#fff"
                  }}
                >
                  <div style={{ height: gridHeight }}>
                    {Array.from({ length: slots }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: SLOT_PX,
                          borderBottom: "1px dashed #f0f2f5",
                          position: "relative"
                        }}
                      >
                        {i % 4 === 0 ? (
                          <span
                            style={{
                              position: "absolute",
                              top: -7,
                              left: 6,
                              fontSize: 11,
                              color: "#64748b",
                              fontVariantNumeric: "tabular-nums"
                            }}
                          >
                            {timeLabelFromSlot(dayStart, data.day.slotMinutes, i)}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle column bodies */}
                <div
                  style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridAutoColumns: `${colWidth}px`,
                    gap: colGap,
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
                      <div style={{ height: gridHeight }}>
                        {Array.from({ length: slots }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              height: SLOT_PX,
                              borderBottom: "1px dashed #f0f2f5"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 12 }}>
            Sticky time axis • Synced vertical scroll • Prototype-ish scale
          </div>
        </div>
      </div>
    </div>
  </DndContext>
  );
}
