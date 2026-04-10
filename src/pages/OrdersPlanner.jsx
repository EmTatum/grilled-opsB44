import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import OrdersCalendarToolbar from "../components/orders/OrdersCalendarToolbar";
import OrdersCalendarGrid from "../components/orders/OrdersCalendarGrid";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function OrdersPlanner() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursorDate, setCursorDate] = useState(moment().startOf("month"));
  const [draggedOrder, setDraggedOrder] = useState(null);

  const load = async () => {
    const data = await base44.entities.Order.list("order_date", 300);

    const pastUnconfirmed = data.filter((order) =>
      (order.status === "Pending" || order.status === "Confirmed") && moment(order.order_date).isBefore(moment(), "day")
    );
    await Promise.all(pastUnconfirmed.map((order) => base44.entities.Order.update(order.id, { status: "Cancelled" })));

    const refreshed = pastUnconfirmed.length > 0
      ? await base44.entities.Order.list("order_date", 300)
      : data;

    setOrders(refreshed.filter((order) => order.status !== "Cancelled"));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const days = useMemo(() => {
    const start = cursorDate.clone().startOf("month").startOf("week");
    const end = cursorDate.clone().endOf("month").endOf("week");
    const count = end.diff(start, "days") + 1;
    return Array.from({ length: count }, (_, index) => start.clone().add(index, "days"));
  }, [cursorDate]);

  const ordersByDay = useMemo(() => {
    return orders.reduce((acc, order) => {
      const key = moment(order.order_date).format("YYYY-MM-DD");
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      acc[key].sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());
      return acc;
    }, {});
  }, [orders]);

  const handleDropOrder = async (day) => {
    if (!draggedOrder) return;
    const original = moment(draggedOrder.order_date);
    const nextDate = day.clone().hour(original.hour()).minute(original.minute()).second(0).millisecond(0).toISOString();
    await base44.entities.Order.update(draggedOrder.id, { order_date: nextDate });
    setDraggedOrder(null);
    load();
  };

  const label = cursorDate.format("MMMM YYYY");

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Upcoming Orders Planner" subtitle="Monthly delivery calendar with rescheduling and bottleneck visibility" />
      <OrdersCalendarToolbar
        label={label}
        onPrev={() => setCursorDate((prev) => prev.clone().subtract(1, "month"))}
        onNext={() => setCursorDate((prev) => prev.clone().add(1, "month"))}
        onToday={() => setCursorDate(moment().startOf("month"))}
      />
      <OrdersCalendarGrid
        days={days}
        ordersByDay={ordersByDay}
        onDropOrder={handleDropOrder}
        onDragStart={setDraggedOrder}
      />
    </div>
  );
}