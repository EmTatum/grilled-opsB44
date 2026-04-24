import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import MemberOrderStatusCards from "../components/orders/MemberOrderStatusCards";
import MemberOrderDispatchCards from "../components/orders/MemberOrderDispatchCards";

const GoldBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      border: "1px solid var(--color-gold)",
      color: "var(--color-gold)",
      fontFamily: "var(--font-body)",
      fontSize: "12px",
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "10px 18px",
      borderRadius: "2px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px"
    }}
  >
    {children}
  </button>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const getDayKey = (value) => String(value || "").slice(0, 10);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekCursor, setWeekCursor] = useState(moment().startOf("week"));
  const [monthCursor, setMonthCursor] = useState(moment().startOf("month"));
  const [selectedDayKey, setSelectedDayKey] = useState(moment("2026-04-24").format("YYYY-MM-DD"));

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.MemberOrder.list("delivery_date", 300);
      setOrders(records || []);
      setLoading(false);
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "create") {
        setOrders((prev) => [...prev, event.data]);
        return;
      }
      if (event.type === "update") {
        setOrders((prev) => prev.map((order) => (order.id === event.id ? event.data : order)));
        return;
      }
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((order) => order.id !== event.id));
      }
    });

    return unsubscribe;
  }, []);

  const counts = useMemo(() => ({
    active: orders.filter((order) => order.fulfilment_status === "Active").length,
    fulfilled: orders.filter((order) => order.fulfilment_status === "Fulfilled").length,
    cancelled: orders.filter((order) => order.fulfilment_status === "Cancelled").length,
  }), [orders]);

  const allOrdersByDay = useMemo(() => orders.reduce((acc, order) => {
    const key = getDayKey(order.delivery_date);
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {}), [orders]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => weekCursor.clone().add(index, "days")), [weekCursor]);

  const monthDays = useMemo(() => {
    const start = monthCursor.clone().startOf("month").startOf("week");
    const end = monthCursor.clone().endOf("month").endOf("week");
    const count = end.diff(start, "days") + 1;
    return Array.from({ length: count }, (_, index) => start.clone().add(index, "days"));
  }, [monthCursor]);

  const todaysOrders = useMemo(() => orders.filter((order) => getDayKey(order.delivery_date) === "2026-04-24"), [orders]);
  const selectedDayOrders = useMemo(() => allOrdersByDay[selectedDayKey] || [], [allOrdersByDay, selectedDayKey]);

  const handleStatusChange = async (id, fulfilment_status) => {
    await base44.entities.MemberOrder.update(id, { fulfilment_status });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ paddingBottom: "24px", borderBottom: "1px solid rgba(210,156,108,0.25)", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "42px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Orders</h1>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#eee3b4", fontWeight: 300 }}>Member orders scheduled by delivery date.</p>
            <div style={{ width: "60px", height: "2px", background: "#d29c6c", marginTop: "16px" }} />
          </div>
        </div>
      </div>

      <MemberOrderStatusCards counts={counts} />

      <div style={{ marginBottom: "26px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Weekly View</p>
        <div style={{ width: "72px", height: "2px", background: "rgba(201,168,76,0.55)", marginTop: "10px" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <GoldBtn onClick={() => setWeekCursor((prev) => prev.clone().subtract(1, "week"))}><ChevronLeft size={14} /> Previous Week</GoldBtn>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(238,227,180,0.72)" }}>{weekCursor.format("D MMM YYYY")} — {weekCursor.clone().endOf("week").format("D MMM YYYY")}</p>
        <GoldBtn onClick={() => setWeekCursor((prev) => prev.clone().add(1, "week"))}>Next Week <ChevronRight size={14} /></GoldBtn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "12px", marginBottom: "40px" }}>
        {weekDays.map((day) => {
          const dayKey = day.format("YYYY-MM-DD");
          const dayOrders = allOrdersByDay[dayKey] || [];
          return (
            <div key={dayKey} style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", minHeight: "220px", padding: "14px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#d29c6c" }}>{day.format("ddd")}</p>
              <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "30px", color: "#F5F0E8", lineHeight: 1 }}>{day.format("D")}</p>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {dayOrders.map((order) => (
                  <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "10px" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                    <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.58)" }}>{order.delivery_address || "Not recorded."}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <GoldBtn onClick={() => setMonthCursor((prev) => prev.clone().subtract(1, "month"))}><ChevronLeft size={14} /> Prev Month</GoldBtn>
          <GoldBtn onClick={() => setMonthCursor(moment().startOf("month"))}>Current Month</GoldBtn>
          <GoldBtn onClick={() => setMonthCursor((prev) => prev.clone().add(1, "month"))}>Next Month <ChevronRight size={14} /></GoldBtn>
        </div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "26px", color: "#d29c6c", textTransform: "uppercase", letterSpacing: "0.1em" }}>{monthCursor.format("MMMM YYYY")}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px", marginBottom: "18px" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={{ padding: "10px 12px", background: "#0a0a0a", border: "1px solid rgba(201,168,76,0.18)", fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(201,168,76,0.7)" }}>{day}</div>
        ))}
        {monthDays.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const dayOrders = allOrdersByDay[key] || [];
          return (
            <button key={key} onClick={() => setSelectedDayKey(key)} style={{ minHeight: "110px", background: selectedDayKey === key ? "rgba(201,168,76,0.08)" : "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "10px", cursor: "pointer", textAlign: "left", opacity: day.isSame(monthCursor, "month") ? 1 : 0.45 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#F5F0E8" }}>{day.format("D")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                {dayOrders.slice(0, 2).map((order) => (
                  <span key={order.id} style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(245,240,232,0.82)", lineHeight: 1.2 }}>{order.client_name}</span>
                ))}
                {dayOrders.length > 2 && <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#C9A84C", lineHeight: 1.3 }}>+{dayOrders.length - 2} more</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Today&apos;s Orders</p>
        <div style={{ width: "72px", height: "2px", background: "rgba(201,168,76,0.55)", marginTop: "10px", marginBottom: "18px" }} />
        {todaysOrders.length === 0 ? <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(238,227,180,0.62)" }}>No deliveries scheduled.</p> : <MemberOrderDispatchCards orders={todaysOrders} onStatusChange={handleStatusChange} showActionItem={true} compact={true} />}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Selected Day</p>
        <div style={{ width: "72px", height: "2px", background: "rgba(201,168,76,0.55)", marginTop: "10px", marginBottom: "18px" }} />
        {selectedDayOrders.length === 0 ? <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(238,227,180,0.62)" }}>No member orders on this day.</p> : <MemberOrderDispatchCards orders={selectedDayOrders} onStatusChange={handleStatusChange} showActionItem={true} compact={true} />}
      </div>
    </div>
  );
}