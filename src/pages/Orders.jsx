import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MemberOrderStatusCards from "../components/orders/MemberOrderStatusCards";
import WeeklyOrdersGrid from "../components/member-orders/WeeklyOrdersGrid.jsx";
import MonthlyOrdersCalendar from "../components/member-orders/MonthlyOrdersCalendar.jsx";
import TodaysOrdersList from "../components/member-orders/TodaysOrdersList.jsx";
import { getDatePart, getTodayKey } from "../components/member-orders/memberOrderUtils";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const buttonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 18px",
  cursor: "pointer"
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekCursor, setWeekCursor] = useState(moment().startOf("week"));
  const [monthCursor, setMonthCursor] = useState(moment().startOf("month"));
  const [selectedDayKey, setSelectedDayKey] = useState(getTodayKey());

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.MemberOrder.list("delivery_date", 500);
      setOrders(records || []);
      setLoading(false);
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "create") setOrders((prev) => [...prev, event.data]);
      if (event.type === "update") setOrders((prev) => prev.map((item) => item.id === event.id ? event.data : item));
      if (event.type === "delete") setOrders((prev) => prev.filter((item) => item.id !== event.id));
    });

    return unsubscribe;
  }, []);

  const counts = useMemo(() => ({
    active: orders.filter((order) => order.fulfilment_status === "Active").length,
    fulfilled: orders.filter((order) => order.fulfilment_status === "Fulfilled").length,
    cancelled: orders.filter((order) => order.fulfilment_status === "Cancelled").length,
  }), [orders]);

  const ordersByDay = useMemo(() => orders.reduce((acc, order) => {
    const key = getDatePart(order.delivery_date);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {}), [orders]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = weekCursor.clone().add(index, "days");
    const key = day.format("YYYY-MM-DD");
    return {
      key,
      label: day.format("ddd"),
      dayNumber: day.format("D"),
      orders: ordersByDay[key] || []
    };
  }), [weekCursor, ordersByDay]);

  const monthDays = useMemo(() => {
    const start = monthCursor.clone().startOf("month").startOf("week");
    const end = monthCursor.clone().endOf("month").endOf("week");
    const count = end.diff(start, "days") + 1;
    return Array.from({ length: count }, (_, index) => {
      const day = start.clone().add(index, "days");
      const key = day.format("YYYY-MM-DD");
      return {
        key,
        dayNumber: day.format("D"),
        inMonth: day.isSame(monthCursor, "month"),
        orders: ordersByDay[key] || []
      };
    });
  }, [monthCursor, ordersByDay]);

  const todaysOrders = useMemo(() => orders.filter((order) => getDatePart(order.delivery_date) === getTodayKey()), [orders]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Orders" subtitle="Live MemberOrder planner and calendar" />

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>No MemberOrder records yet.</p>
        </div>
      ) : (
        <>
          <MemberOrderStatusCards counts={counts} />

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>Weekly View</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => setWeekCursor((prev) => prev.clone().subtract(1, "week"))} style={buttonStyle}><ChevronLeft size={14} /> Prev</button>
                <button onClick={() => setWeekCursor(moment().startOf("week"))} style={buttonStyle}>Current</button>
                <button onClick={() => setWeekCursor((prev) => prev.clone().add(1, "week"))} style={buttonStyle}>Next <ChevronRight size={14} /></button>
              </div>
            </div>
            <WeeklyOrdersGrid days={weekDays} />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>Monthly Calendar</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => setMonthCursor((prev) => prev.clone().subtract(1, "month"))} style={buttonStyle}><ChevronLeft size={14} /> Prev</button>
                <button onClick={() => setMonthCursor(moment().startOf("month"))} style={buttonStyle}>Current</button>
                <button onClick={() => setMonthCursor((prev) => prev.clone().add(1, "month"))} style={buttonStyle}>Next <ChevronRight size={14} /></button>
              </div>
            </div>
            <MonthlyOrdersCalendar days={monthDays} selectedDayKey={selectedDayKey} onSelectDay={setSelectedDayKey} />
          </div>

          <TodaysOrdersList orders={todaysOrders} emptyMessage="No orders scheduled for today." />
        </>
      )}
    </div>
  );
}