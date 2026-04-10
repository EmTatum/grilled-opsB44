import moment from "moment";
import StatusBadge from "../StatusBadge";

export default function TodayOrdersCard({ selectedDate, orders, onClientClick }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.22)", marginBottom: "28px" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(201,168,76,0.18)", background: "#0a0a0a" }}>
        <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "16px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#C9A84C" }}>
          Active Bookings · {moment(selectedDate).format("ddd D MMM")}
        </p>
      </div>
      <div style={{ padding: "8px 18px 16px" }}>
        {orders.length === 0 ? (
          <p style={{ margin: "10px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.35)" }}>No orders for this day.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {orders.map((order) => (
              <div key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => onClientClick(order.client_name)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", textAlign: "left" }}>
                    {order.client_name}
                  </button>
                  <StatusBadge status={order.status} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px 18px", marginTop: "10px" }}>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Ref: {order.id.slice(0, 8)}</span>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Time: {order.time_slot || moment(order.order_date).format("h:mm A")}</span>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: order.isUrgent ? "#C2185B" : "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Priority: {order.isUrgent ? "Urgent" : order.status}</span>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Notes: {order.notesCount}</span>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Payment: {order.payment_method || "—"}</span>
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Scheduled: {moment(order.order_date).format("ddd D MMM · h:mm A")}</span>
                  {order.order_value > 0 && <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C" }}>Value: R{Number(order.order_value).toLocaleString()}</span>}
                </div>

                {order.order_details && (
                  <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.16)" }}>
                    <p style={{ margin: "0 0 6px", fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.65)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                      Order Details
                    </p>
                    <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.72)", lineHeight: 1.7 }}>
                      {order.order_details}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}