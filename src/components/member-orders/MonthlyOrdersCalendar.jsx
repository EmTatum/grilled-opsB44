export default function MonthlyOrdersCalendar({ days, selectedDayKey, onSelectDay }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px" }}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} style={{ background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.2)", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>{day}</div>
      ))}
      {days.map((day) => (
        <button key={day.key} onClick={() => onSelectDay(day.key)} style={{ minHeight: "110px", textAlign: "left", padding: "10px", cursor: "pointer", background: selectedDayKey === day.key ? "rgba(201,168,76,0.08)" : "#111111", border: "1px solid rgba(201,168,76,0.16)", opacity: day.inMonth ? 1 : 0.4 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#F5F0E8" }}>{day.dayNumber}</p>
          <div style={{ display: "grid", gap: "6px", marginTop: "10px" }}>
            {day.orders.slice(0, 2).map((order) => (
              <span key={order.id} style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(245,240,232,0.82)" }}>{order.client_name}</span>
            ))}
            {day.orders.length > 2 && <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#C9A84C" }}>+{day.orders.length - 2} more</span>}
          </div>
        </button>
      ))}
    </div>
  );
}