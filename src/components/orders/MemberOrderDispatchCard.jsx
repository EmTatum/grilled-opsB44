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

const statusStyles = {
  Active: { border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C", background: "rgba(201,168,76,0.1)" },
  Fulfilled: { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)", background: "rgba(255,255,255,0.05)" },
  Cancelled: { border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B", background: "rgba(194,24,91,0.08)" },
  PAID: { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)", background: "rgba(255,255,255,0.05)" },
  CASH: { border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C", background: "rgba(201,168,76,0.1)" },
  PENDING: { border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B", background: "rgba(194,24,91,0.08)" },
};

const buttonBase = {
  background: "transparent",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
};

export default function MemberOrderDispatchCard({ order, onMarkFulfilled, onMarkCancelled }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.22)", padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>{order.client_name}</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ ...statusStyles[order.fulfilment_status], padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.fulfilment_status}</span>
          <span style={{ ...statusStyles[order.payment_status], padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px 18px" }}>
        <div><p style={labelStyle}>Delivery Date</p><p style={valueStyle}>{order.delivery_date || "Not recorded."}</p></div>
        <div><p style={labelStyle}>Cell Number</p><p style={valueStyle}>{order.cell_number || "Not recorded."}</p></div>
        <div><p style={labelStyle}>Order Total</p><p style={{ ...valueStyle, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#C9A84C" }}>R{Number(order.order_total || 0).toLocaleString("en-ZA")}</p></div>
      </div>

      <div><p style={labelStyle}>Delivery Address</p><p style={{ ...valueStyle, whiteSpace: "pre-line" }}>{order.delivery_address || "Not recorded."}</p></div>
      <div><p style={labelStyle}>Order List</p><p style={{ ...valueStyle, whiteSpace: "pre-line" }}>{order.order_list || "Not recorded."}</p></div>
      {order.next_action && <div><p style={labelStyle}>Next Action</p><p style={valueStyle}>{order.next_action}</p></div>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => onMarkFulfilled(order.id)} disabled={order.fulfilment_status === "Fulfilled"} style={{ ...buttonBase, border: "1px solid #C9A84C", color: "#C9A84C", opacity: order.fulfilment_status === "Fulfilled" ? 0.5 : 1, cursor: order.fulfilment_status === "Fulfilled" ? "default" : "pointer" }}>
          Mark Fulfilled
        </button>
        <button onClick={() => onMarkCancelled(order.id)} disabled={order.fulfilment_status === "Cancelled"} style={{ ...buttonBase, border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B", opacity: order.fulfilment_status === "Cancelled" ? 0.5 : 1, cursor: order.fulfilment_status === "Cancelled" ? "default" : "pointer" }}>
          Mark Cancelled
        </button>
      </div>
    </div>
  );
}