import moment from "moment";
import { Link } from "react-router-dom";
import StatusBadge from "../StatusBadge";

const getSlotLabel = (order) => order.time_slot || moment(order.order_date).format("h:mm A");

const orderCardStyle = {
  padding: "10px",
  border: "1px solid rgba(201,168,76,0.2)",
  background: "#141414",
  cursor: "grab",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

function OrderCard({ order, onDragStart }) {
  return (
    <Link
      to={`/orders?orderId=${order.id}`}
      draggable
      onDragStart={() => onDragStart(order)}
      style={{ ...orderCardStyle, textDecoration: "none" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 600, color: "#F5F0E8", margin: 0 }}>{order.client_name}</p>
        <StatusBadge status={order.status} />
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C", margin: 0 }}>{getSlotLabel(order)}</p>
      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.42)", margin: 0 }}>{order.order_details}</p>
    </Link>
  );
}

function DayCell({ day, orders, onDropOrder, onDragStart, isMonth }) {
  const isBottleneck = orders.length >= 4;
  const isToday = day.isSame(moment(), "day");
  const isPastDay = day.clone().endOf("day").isBefore(moment());

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropOrder(day)}
      style={{
        minHeight: isMonth ? "190px" : "280px",
        background: isToday ? "rgba(232,122,37,0.08)" : isPastDay ? "rgba(245,240,232,0.02)" : "#111111",
        border: `1px solid ${isToday ? "rgba(232,122,37,0.65)" : isPastDay ? "rgba(245,240,232,0.12)" : "rgba(201,168,76,0.14)"}`,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        opacity: isPastDay ? 0.62 : 1,
        position: "relative",
        boxShadow: isToday ? "0 0 22px rgba(232,122,37,0.16)" : isBottleneck ? "inset 0 0 0 1px rgba(194,24,91,0.4)" : "none"
      }}
    >
      {isPastDay && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10px",
            right: "10px",
            height: "1px",
            background: "rgba(245,240,232,0.45)",
            transform: "rotate(-8deg)",
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: 2
          }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", position: "relative", zIndex: 3 }}>
        <div>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: isToday ? "#E87A25" : "#C9A84C", margin: 0, textShadow: isToday ? "0 0 16px rgba(232,122,37,0.35)" : "none", textDecoration: isPastDay ? "line-through" : "none", textDecorationColor: isToday ? "#E87A25" : "rgba(245,240,232,0.5)", textDecorationThickness: "1px", opacity: isPastDay ? 0.6 : 1 }}>{day.format("D")}</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: isToday ? "rgba(232,122,37,0.8)" : "rgba(245,240,232,0.28)", margin: 0, textDecoration: isPastDay ? "line-through" : "none", textDecorationColor: "rgba(245,240,232,0.35)", textDecorationThickness: "1px", opacity: isPastDay ? 0.5 : 1 }}>{day.format("ddd")}</p>
        </div>
        <span style={{ padding: "4px 8px", border: `1px solid ${isToday ? "rgba(232,122,37,0.45)" : isBottleneck ? "rgba(194,24,91,0.45)" : "rgba(201,168,76,0.25)"}`, background: isToday ? "rgba(232,122,37,0.12)" : isBottleneck ? "rgba(194,24,91,0.08)" : "rgba(201,168,76,0.05)", color: isToday ? "#E87A25" : isBottleneck ? "#C2185B" : "rgba(245,240,232,0.7)", fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {isToday ? "Today" : `${orders.length} deliveries`}
        </span>
      </div>

      {isBottleneck && (
        <div style={{ padding: "8px 10px", background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.35)", fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "#C2185B", letterSpacing: "0.08em", textTransform: "uppercase", position: "relative", zIndex: 3 }}>
          Capacity bottleneck
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 3 }}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export default function OrdersCalendarGrid({ days, ordersByDay, onDropOrder, onDragStart }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "12px", overflowX: "auto" }}>
      {days.map((day) => (
        <DayCell
          key={day.format("YYYY-MM-DD")}
          day={day}
          orders={ordersByDay[day.format("YYYY-MM-DD")] || []}
          onDropOrder={onDropOrder}
          onDragStart={onDragStart}
          isMonth={true}
        />
      ))}
    </div>
  );
}