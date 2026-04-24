import { formatDeliveryDateLabel } from "./memberOrderUtils";

export default function WeeklyOrdersGrid({ days }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "12px" }}>
      {days.map((day) => (
        <div key={day.key} style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", padding: "14px", minHeight: "220px" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>{day.label}</p>
          <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "28px", color: "#C9A84C" }}>{day.dayNumber}</p>
          <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
            {day.orders.map((order) => (
              <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "10px" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{order.client_name}</p>
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>{formatDeliveryDateLabel(order.delivery_date)}</p>
              </div>
            ))}
            {day.orders.length === 0 && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.35)" }}>No orders.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}