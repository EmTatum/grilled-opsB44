import moment from "moment";
import { ORDER_STATUSES, getPlannerStatus, getPriorityTone } from "./orderPlannerConfig";

const columnMeta = {
  Pending: { accent: "#C9A84C" },
  Processing: { accent: "rgba(245,240,232,0.75)" },
  Dispatched: { accent: "#8F6B1C" },
  Complete: { accent: "#C2185B" },
};

function OrderBoardCard({ order, onEdit, onDragStart, onMoveStatus }) {
  const plannerStatus = getPlannerStatus(order);
  const priorityTone = getPriorityTone(order.priority_level || "Medium");

  return (
    <div
      draggable
      onDragStart={() => onDragStart(order)}
      onClick={() => onEdit(order)}
      style={{
        background: "#141414",
        border: "1px solid rgba(201,168,76,0.22)",
        padding: "12px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
        <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
        <span style={{ border: `1px solid ${priorityTone.border}`, background: priorityTone.bg, color: priorityTone.color, padding: "3px 7px", fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {order.priority_level || "Medium"}
        </span>
      </div>
      <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C" }}>{moment(order.order_date).format("D MMM · h:mm A")}</p>
      <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.55)" }}>{order.delivery_address || "No delivery address yet"}</p>
      <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.42)" }}>{order.quantity || 0} units</p>
      <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.35)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{order.order_details}</p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "4px" }} onClick={(e) => e.stopPropagation()}>
        {ORDER_STATUSES.filter((status) => status !== plannerStatus).map((status) => (
          <button
            key={status}
            onClick={() => onMoveStatus(order, status)}
            style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.2)", color: "rgba(245,240,232,0.6)", padding: "5px 8px", fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OrdersStatusBoard({ orders, onEdit, onDragStart, onDropStatus, onMoveStatus }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }} className="max-lg:!grid-cols-2 max-sm:!grid-cols-1">
      {ORDER_STATUSES.map((status) => {
        const columnOrders = orders.filter((order) => getPlannerStatus(order) === status);
        const accent = columnMeta[status].accent;

        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropStatus(status)}
            style={{ background: "#111111", border: `1px solid ${accent === "#C9A84C" ? "rgba(201,168,76,0.25)" : accent === "#C2185B" ? "rgba(194,24,91,0.25)" : "rgba(245,240,232,0.14)"}`, minHeight: "320px" }}
          >
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(201,168,76,0.16)", background: "#0a0a0a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "16px", letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>{status}</p>
                <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{columnOrders.length}</span>
              </div>
            </div>
            <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {columnOrders.length === 0 ? (
                <div style={{ padding: "18px 12px", border: "1px dashed rgba(201,168,76,0.14)", color: "rgba(245,240,232,0.25)", fontFamily: "'Raleway', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center" }}>
                  Drop orders here
                </div>
              ) : (
                columnOrders.map((order) => (
                  <OrderBoardCard key={order.id} order={order} onEdit={onEdit} onDragStart={onDragStart} onMoveStatus={onMoveStatus} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}