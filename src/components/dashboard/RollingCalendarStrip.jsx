import { AlertTriangle } from "lucide-react";
import { formatMonth, formatWeekday, toDayKey } from "../../lib/dashboardDateUtils";

export default function RollingCalendarStrip({ days, selectedDate, getDayMeta, onSelectDay }) {
  const safeDays = days ?? [];

  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(110px, 1fr))", gap: "10px" }}>
        {safeDays.map((day) => {
          const currentDay = new Date(day);
          const meta = getDayMeta?.(currentDay) ?? { orderCount: 0, hasOrders: false, hasAlert: false, isCritical: false, entries: [] };
          const dayKey = toDayKey(currentDay);
          const isSelected = dayKey === selectedDate;
          const bookedHighlight = meta.hasOrders && !isSelected;

          return (
            <button
              key={dayKey}
              onClick={() => onSelectDay?.(dayKey)}
              style={{
                background: isSelected ? "rgba(201,168,76,0.16)" : bookedHighlight ? "rgba(201,168,76,0.08)" : "#141414",
                border: `1px solid ${isSelected ? "rgba(201,168,76,0.65)" : bookedHighlight ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.2)"}`,
                padding: "12px 10px",
                textAlign: "left",
                minHeight: "150px",
                cursor: "pointer",
                outline: "none",
                boxShadow: isSelected || bookedHighlight ? "0 0 20px rgba(201,168,76,0.12)" : "none",
              }}
            >
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: isSelected || bookedHighlight ? "#C9A84C" : "rgba(245,240,232,0.55)" }}>{formatWeekday(currentDay)}</p>
              <p style={{ margin: "8px 0 4px", fontFamily: "'Cinzel', serif", fontSize: "24px", color: "#F5F0E8" }}>{currentDay.getDate()}</p>
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{formatMonth(currentDay)}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: meta.hasOrders ? "#C9A84C" : "rgba(201,168,76,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{meta.orderCount} orders</span>
                {meta.hasAlert && <AlertTriangle size={12} style={{ color: meta.isCritical ? "#C2185B" : "#C9A84C" }} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                {meta.entries.map((entry) => (
                  <div key={entry.id} style={{ padding: "6px 7px", background: "rgba(10,10,10,0.55)", border: "1px solid rgba(201,168,76,0.22)" }}>
                    <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "#F5F0E8", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.client_name}</p>
                    <p style={{ margin: "3px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(201,168,76,0.72)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{entry.time}</p>
                  </div>
                ))}
                {meta.orderCount > meta.entries.length && (
                  <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.38)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    +{meta.orderCount - meta.entries.length} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}