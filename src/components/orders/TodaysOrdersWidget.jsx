import { useMemo } from "react";

const sectionTitleStyle = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "22px",
  color: "#C9A84C",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

const badgeStyles = {
  PAID: {
    border: "1px solid rgba(57,255,20,0.65)",
    color: "#39ff14",
    background: "rgba(57,255,20,0.14)"
  },
  CASH: {
    border: "1px solid rgba(57,255,20,0.65)",
    color: "#39ff14",
    background: "rgba(57,255,20,0.14)"
  }
};

const headerCellStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  color: "rgba(201,168,76,0.7)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  background: "#0a0a0a",
  borderBottom: "1px solid rgba(201,168,76,0.3)",
  whiteSpace: "nowrap"
};

const bodyCellStyle = {
  padding: "14px 16px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "#F5F0E8",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  verticalAlign: "top"
};

function getDeliveryTime(order) {
  const explicit = String(order.delivery_time || "").trim();
  if (explicit) return explicit.slice(0, 5);

  const rawDate = String(order.delivery_date || "").trim();
  if (!rawDate.includes("T")) return "Time TBC";

  const [, timePart = ""] = rawDate.split("T");
  return timePart ? timePart.slice(0, 5) : "Time TBC";
}

function splitOrderItems(orderList) {
  return String(orderList || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sortByTime(orders) {
  return [...orders].sort((a, b) => getDeliveryTime(a).localeCompare(getDeliveryTime(b)));
}

function OrderChecklist({ orderList }) {
  const items = useMemo(() => splitOrderItems(orderList), [orderList]);

  if (!items.length) {
    return <p style={{ margin: 0, color: "rgba(245,240,232,0.45)" }}>No order listed</p>;
  }

  return (
    <details>
      <summary style={{ cursor: "pointer", color: "#C9A84C", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        View Order Checklist
      </summary>
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, index) => (
          <label key={`${item}-${index}`} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.5 }}>
            <input type="checkbox" style={{ marginTop: "2px", accentColor: "#C9A84C" }} />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function OrdersTable({ title, status, orders }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <p style={sectionTitleStyle}>{title}</p>
        <span style={{ ...badgeStyles[status], display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
          {orders.length} Orders
        </span>
      </div>

      <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "920px" }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Delivery Time</th>
                <th style={headerCellStyle}>Delivery Address</th>
                <th style={headerCellStyle}>Full Order</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...bodyCellStyle, color: "rgba(245,240,232,0.5)", textAlign: "center", padding: "28px 16px" }}>
                    No {title.toLowerCase()} for today.
                  </td>
                </tr>
              ) : sortByTime(orders).map((order) => (
                <tr
                  key={order.id}
                  style={{ background: "#111111" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; }}
                >
                  <td style={{ ...bodyCellStyle, fontWeight: 600 }}>{order.client_name || "Not recorded"}</td>
                  <td style={bodyCellStyle}>{getDeliveryTime(order)}</td>
                  <td style={bodyCellStyle}>{order.delivery_address || "Address TBC"}</td>
                  <td style={bodyCellStyle}><OrderChecklist orderList={order.order_list} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function TodaysOrdersWidget({ paidOrders, cashOrders }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>Today’s Orders</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Today’s confirmed dispatch list from Member Intelligence, split by paid and cash confirmed orders.</p>
      </div>

      <OrdersTable title="Paid" status="PAID" orders={paidOrders} />
      <OrdersTable title="Cash Confirmed" status="CASH" orders={cashOrders} />
    </section>
  );
}