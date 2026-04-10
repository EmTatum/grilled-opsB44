import { AlertTriangle } from "lucide-react";
import { formatMonth, formatWeekday, toDayKey } from "../../lib/dashboardDateUtils";

export default function RollingCalendarStrip({ days, selectedDate, getDayMeta, onSelectDay }) {
  const safeDays = days ?? [];

  return (
    <div style={{ marginBottom: "28px", overflowX: "auto", paddingBottom: "6px" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${safeDays.length}, minmax(110px, 1fr))`, gap: "10px", minWidth: "max-content" }}>
        {safeDays.map((day) => {
          const currentDay = new Date(day);
          const meta = getDayMeta?.(currentDay) ?? { orderCount: 0, hasAlert: false, isCritical: false };
          const dayKey = toDayKey(currentDay);
          const isSelected = dayKey === selectedDate;

          return (
            <button
              key={dayKey}
              onClick={() => onSelectDay?.(dayKey)}
              style={{
                background: isSelected ? "rgba(201,168,76,0.12)" : "#141414",
                border: `1px solid ${isSelected ? "rgba(201,168,76,0.65)" : "rgba(201,168,76,0.2)"}`,
                padding: "12px 10px",
                textAlign: "left",
                minHeight: "110px",
                cursor: "pointer",
                outline: "none",
                boxShadow: isSelected ? "0 0 20px rgba(201,168,76,0.12)" : "none",
              }}
            >
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: isSelected ? "#C9A84C" : "rgba(245,240,232,0.55)" }}>{formatWeekday(currentDay)}</p>
              <p style={{ margin: "8px 0 4px", fontFamily: "'Cinzel', serif", fontSize: "24px", color: "#F5F0E8" }}>{currentDay.getDate()}</p>
              <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{formatMonth(currentDay)}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{meta.orderCount} orders</span>
                {meta.hasAlert && <AlertTriangle size={12} style={{ color: meta.isCritical ? "#C2185B" : "#C9A84C" }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}