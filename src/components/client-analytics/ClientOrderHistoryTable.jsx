import moment from "moment";
import StatusBadge from "../StatusBadge";

const headerStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  color: "rgba(201,168,76,0.7)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(201,168,76,0.25)",
  background: "#0a0a0a",
  whiteSpace: "nowrap",
};

const cellStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "13px",
  color: "#F5F0E8",
  verticalAlign: "top",
};

export default function ClientOrderHistoryTable({ orders }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(201,168,76,0.2)", background: "#0a0a0a" }}>
        <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "18px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A84C" }}>Order History</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "780px" }}>
          <thead>
            <tr>
              <th style={headerStyle}>Date</th>
              <th style={headerStyle}>Items</th>
              <th style={headerStyle}>Value</th>
              <th style={headerStyle}>Time Slot</th>
              <th style={headerStyle}>Payment</th>
              <th style={headerStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={cellStyle}>{moment(order.order_date).format("D MMM YYYY")}</td>
                <td style={{ ...cellStyle, color: "rgba(245,240,232,0.75)" }}>{order.order_details || "—"}</td>
                <td style={{ ...cellStyle, fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#C9A84C" }}>R{Number(order.order_value || 0).toLocaleString()}</td>
                <td style={cellStyle}>{order.time_slot || moment(order.order_date).format("h:mm A")}</td>
                <td style={cellStyle}>{order.payment_method || "—"}</td>
                <td style={cellStyle}><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}