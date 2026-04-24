import StatusBadge from "../StatusBadge";
import { formatDeliveryDateLabel, formatCurrency } from "./memberOrderUtils";

export default function TodaysOrdersList({ orders, emptyMessage = "No orders today." }) {
  if (!orders.length) {
    return <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.35)" }}>{emptyMessage}</p>;
  }

  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)" }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "14px 18px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>Today&apos;s Orders</p>
      </div>
      <div style={{ padding: "8px 18px 14px", display: "grid", gap: "10px" }}>
        {orders.map((order) => (
          <div key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C" }}>{order.client_name}</p>
              <StatusBadge status={order.fulfilment_status || "Active"} />
            </div>
            <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{formatDeliveryDateLabel(order.delivery_date)}</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)" }}>{order.delivery_address || "Address TBC"}</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#C9A84C" }}>{formatCurrency(order.order_total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}