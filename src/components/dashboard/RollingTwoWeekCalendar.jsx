import React, { useMemo } from "react";
import { getRollingDays, formatMonth, formatWeekday, toDayKey } from "../../lib/dashboardDateUtils";
export default function RollingTwoWeekCalendar({
  baseDate,
  selectedDate,
  orders,
  onSelectDate,
}) {
  const days = useMemo(() => getRollingDays(baseDate ?? new Date()), [baseDate]);

  const orderStatsByDay = useMemo(() => {
    const map = new Map();

    for (const order of orders) {
      const key = toDayKey(order.scheduledFor);
      const current = map.get(key) ?? {
        totalOrders: 0,
        overdueCount: 0,
        criticalCount: 0,
      };

      current.totalOrders += 1;
      if (order.status === "overdue") current.overdueCount += 1;
      if (order.priority === "critical") current.criticalCount += 1;

      map.set(key, current);
    }

    return map;
  }, [orders]);

  const todayKey = toDayKey(new Date());

  return (
    <section
      aria-label="Upcoming 14 day order calendar"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(14, minmax(84px, 1fr))",
        gap: 10,
        marginBottom: 22,
      }}
    >
      {days.map((day) => {
        const key = toDayKey(day);
        const stats = orderStatsByDay.get(key) ?? {
          totalOrders: 0,
          overdueCount: 0,
          criticalCount: 0,
        };
        const isSelected = key === selectedDate;
        const isToday = key === todayKey;
        const hasAlert = stats.overdueCount > 0 || stats.criticalCount > 0;
        const showMonth = day.getDate() <= 7 || key === todayKey;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(key)}
            aria-pressed={isSelected}
            aria-label={`Select ${day.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}, ${stats.totalOrders} orders`}
            style={{
              position: "relative",
              minHeight: 102,
              background: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              border: isSelected
                ? "1px solid rgba(212,175,55,0.9)"
                : "1px solid rgba(212,175,55,0.14)",
              boxShadow: isSelected
                ? "0 0 0 1px rgba(212,175,55,0.22), 0 0 16px rgba(212,175,55,0.08)"
                : isToday
                ? "0 0 0 1px rgba(255,255,255,0.08)"
                : "none",
              borderRadius: 12,
              padding: 12,
              color: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {hasAlert && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#e03a8a",
                }}
              />
            )}

            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.08em" }}>
              {formatWeekday(day)}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 500 }}>{day.getDate()}</div>
              {showMonth && (
                <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.08em" }}>
                  {formatMonth(day)}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, opacity: 0.84 }}>
              {stats.totalOrders} {stats.totalOrders === 1 ? "order" : "orders"}
            </div>

            {(stats.overdueCount > 0 || stats.criticalCount > 0) && (
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.76 }}>
                {stats.overdueCount > 0 ? `${stats.overdueCount} overdue` : ""}
                {stats.overdueCount > 0 && stats.criticalCount > 0 ? " · " : ""}
                {stats.criticalCount > 0 ? `${stats.criticalCount} critical` : ""}
              </div>
            )}
          </button>
        );
      })}
    </section>
  );
}