const paymentBadgeStyles = {
  PAID: { background: "#15434a", color: "#F5F0E8", border: "1px solid rgba(21,67,74,0.9)" },
  CASH: { background: "#d29c6c", color: "#0b0e11", border: "1px solid rgba(210,156,108,0.9)" },
  PENDING: { background: "#8d201c", color: "#F5F0E8", border: "1px solid rgba(141,32,28,0.95)" },
};

const labelStyle = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#d29c6c",
};

const valueStyle = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  color: "#F5F0E8",
  lineHeight: 1.6,
};

const fulfilledButtonStyle = {
  background: "#15434a",
  border: "1px solid rgba(21,67,74,0.95)",
  color: "#F5F0E8",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
};

const cancelledButtonStyle = {
  background: "#8d201c",
  border: "1px solid rgba(141,32,28,0.95)",
  color: "#F5F0E8",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
};

export default function MemberOrderDispatchCards({ orders, onStatusChange, sectionBorderColor }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
      {orders.map((order) => {
        const paymentStyle = paymentBadgeStyles[order.payment_status || "PENDING"] || paymentBadgeStyles.PENDING;
        return (
          <div
            key={order.id}
            style={{
              background: "#1c191a",
              border: `1px solid ${sectionBorderColor}`,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1 }}>
                {order.client_name || "Not recorded."}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 10px",
                  ...paymentStyle,
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {order.payment_status || "PENDING"}
              </span>
            </div>

            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Delivery Date</p>
                <p style={valueStyle}>{order.delivery_date || "Not recorded."}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Delivery Address</p>
                <p style={valueStyle}>{order.delivery_address || "Not recorded."}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Cell</p>
                <p style={valueStyle}>{order.cell_number || "Not recorded."}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px", alignItems: "start" }}>
                <p style={labelStyle}>Order</p>
                <pre style={{ ...valueStyle, whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", background: "transparent" }}>
                  {order.order_list || "Not recorded."}
                </pre>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Total</p>
                <p style={valueStyle}>{`R${Number(order.order_total || 0).toLocaleString("en-ZA")}`}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Next Action</p>
                <p style={valueStyle}>{order.next_action || "Not recorded."}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", paddingTop: "6px" }}>
              <button onClick={() => onStatusChange(order.id, "Fulfilled")} style={fulfilledButtonStyle}>
                ✓ Mark Fulfilled
              </button>
              <button onClick={() => onStatusChange(order.id, "Cancelled")} style={cancelledButtonStyle}>
                ✗ Mark Cancelled
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}