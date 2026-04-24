import { formatDeliveryDateTime } from "../notes/memberIntelligenceUtils";

const paymentBadgeStyles = {
  PAID: { background: "rgba(22,163,74,0.12)", color: "#86efac", border: "1px solid rgba(22,163,74,0.45)" },
  CASH: { background: "rgba(141,32,28,0.12)", color: "#f5b4b0", border: "1px solid rgba(141,32,28,0.45)" },
  PENDING: { background: "rgba(217,119,6,0.12)", color: "#fbbf24", border: "1px solid rgba(217,119,6,0.45)" },
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
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
};

const cancelledButtonStyle = {
  background: "transparent",
  border: "1px solid rgba(194,24,91,0.6)",
  color: "#C2185B",
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
              background: "#1a1a1a",
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
                <p style={valueStyle}>{formatDeliveryDateTime(order.delivery_date)}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Delivery Address</p>
                <p style={valueStyle}>{order.delivery_address || "Address TBC"}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Cell</p>
                <p style={valueStyle}>{order.cell_number || "No number"}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px", alignItems: "start" }}>
                <p style={labelStyle}>Order</p>
                <pre style={{ ...valueStyle, whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", background: "transparent" }}>
                  {order.order_list || "Not recorded."}
                </pre>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Total</p>
                <p style={valueStyle}>{Number(order.order_total || 0) > 0 ? `R${Number(order.order_total).toLocaleString("en-ZA")}` : "TBC"}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 180px) minmax(0, 1fr)", gap: "12px" }}>
                <p style={labelStyle}>Next Action</p>
                <p style={valueStyle}>{order.next_action || "No next action set"}</p>
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