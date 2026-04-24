const badgeStyles = {
  Active: { border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.1)", color: "#C9A84C" },
  Fulfilled: { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "rgba(245,240,232,0.7)" },
  Cancelled: { border: "1px solid rgba(194,24,91,0.4)", background: "rgba(194,24,91,0.08)", color: "#C2185B" },
  PAID: { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "rgba(245,240,232,0.7)" },
  CASH: { border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.1)", color: "#C9A84C" },
  PENDING: { border: "1px solid rgba(194,24,91,0.4)", background: "rgba(194,24,91,0.08)", color: "#C2185B" },
};

const labelStyle = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.58)",
};

const valueStyle = {
  margin: "4px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  color: "#F5F0E8",
  lineHeight: 1.5,
};

export default function MemberOrderDispatchCards({ orders, onStatusChange, showActionItem = false, compact = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
      {orders.map((order) => {
        const isDone = order.fulfilment_status !== "Active";
        return (
          <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.22)", padding: compact ? "18px" : "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#d29c6c", textTransform: "uppercase", letterSpacing: "0.08em" }}>{order.client_name || "Not recorded."}</p>
              <span style={{ display: "inline-flex", padding: "6px 10px", ...badgeStyles[order.fulfilment_status || "Active"], fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.fulfilment_status || "Active"}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px 18px" }}>
              <div><p style={labelStyle}>Delivery Date</p><p style={valueStyle}>{order.delivery_date || "Not recorded."}</p></div>
              <div><p style={labelStyle}>Cell Number</p><p style={valueStyle}>{order.cell_number || "Not recorded."}</p></div>
              <div style={{ gridColumn: "1 / -1" }}><p style={labelStyle}>Delivery Address</p><p style={valueStyle}>{order.delivery_address || "Not recorded."}</p></div>
              <div><p style={labelStyle}>Payment Status</p><span style={{ display: "inline-flex", marginTop: "6px", padding: "6px 10px", ...badgeStyles[order.payment_status || "PENDING"], fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span></div>
              <div><p style={labelStyle}>Order Total</p><p style={valueStyle}>{order.order_total ? `R${Number(order.order_total).toLocaleString("en-ZA")}` : "R0"}</p></div>
              <div style={{ gridColumn: "1 / -1" }}><p style={labelStyle}>Order List</p><p style={{ ...valueStyle, whiteSpace: "pre-line" }}>{order.order_list || "Not recorded."}</p></div>
              {showActionItem && <div style={{ gridColumn: "1 / -1" }}><p style={labelStyle}>Next Action</p><p style={valueStyle}>{order.next_action || "Not recorded."}</p></div>}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => onStatusChange(order.id, "Fulfilled")} disabled={isDone} style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 14px", cursor: isDone ? "default" : "pointer", opacity: isDone ? 0.5 : 1 }}>
                Mark Fulfilled
              </button>
              <button onClick={() => onStatusChange(order.id, "Cancelled")} disabled={isDone} style={{ background: "transparent", border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 14px", cursor: isDone ? "default" : "pointer", opacity: isDone ? 0.5 : 1 }}>
                Mark Cancelled
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}