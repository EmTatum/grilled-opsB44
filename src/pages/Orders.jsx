import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import moment from "moment";
import OrderFormDialog from "../components/OrderFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import { syncReportFromOrder } from "../utils/intelligenceOrderSync";

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

const inputBase = {
  background: "#1c191a",
  border: "1px solid rgba(210,156,108,0.2)",
  borderRadius: "2px",
  color: "#F5F0E8",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none",
};

const paymentBadgeMap = {
  PAID: { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "rgba(245,240,232,0.7)" },
  CASH: { border: "1px solid rgba(201,168,76,0.5)", background: "rgba(201,168,76,0.1)", color: "#C9A84C" },
  PENDING: { border: "1px solid rgba(194,24,91,0.4)", background: "rgba(194,24,91,0.08)", color: "#C2185B" },
};

const statusBlockConfig = {
  upcoming: { label: "UPCOMING", background: "#15434a", labelColor: "#F5F0E8", valueColor: "#eee3b4" },
  pending: { label: "PENDING", background: "#d29c6c", labelColor: "#030101", valueColor: "#030101" },
  urgent: { label: "URGENT", background: "#8d201c", labelColor: "#F5F0E8", valueColor: "#F5F0E8", strong: true },
  fulfilled: { label: "FULFILLED", background: "#322d2d", labelColor: "rgba(238,227,180,0.78)", valueColor: "#eee3b4" },
  overdue: { label: "OVERDUE", background: "#8d201c", labelColor: "#F5F0E8", valueColor: "#F5F0E8", italic: true },
};

const getOrderMoment = (order) => moment(order.order_date);
const isFulfilled = (order) => order.status === "Fulfilled" || order.status === "Complete" || order.planner_status === "Complete";
const isPending = (order) => order.status === "Pending" || !order.order_date;
const isUrgent = (order) => {
  if (isFulfilled(order)) return false;
  if (order.priority_level === "High") return true;
  const orderMoment = getOrderMoment(order);
  return orderMoment.isValid() && orderMoment.isSameOrAfter(moment()) && orderMoment.diff(moment(), "hours", true) <= 24;
};
const isUpcoming = (order) => {
  if (isFulfilled(order) || isPending(order)) return false;
  const orderMoment = getOrderMoment(order);
  return orderMoment.isValid() && orderMoment.isAfter(moment(), "minute");
};
const isOverdue = (order) => {
  if (isFulfilled(order)) return false;
  const orderMoment = getOrderMoment(order);
  return orderMoment.isValid() && orderMoment.isBefore(moment(), "minute");
};

const getFilterMatch = (order, filter) => {
  if (filter === "all") return true;
  if (filter === "upcoming") return isUpcoming(order);
  if (filter === "pending") return isPending(order);
  if (filter === "urgent") return isUrgent(order);
  if (filter === "fulfilled") return isFulfilled(order);
  if (filter === "overdue") return isOverdue(order);
  return true;
};

const parseNaturalDate = (value) => {
  if (!value || value === "Not recorded.") return null;
  const formats = [
    moment.ISO_8601,
    "D MMMM YYYY",
    "D MMM YYYY",
    "Do MMMM",
    "Do MMM",
    "D MMMM",
    "D MMM",
    "MMMM D YYYY",
    "MMM D YYYY",
    "MMMM D",
    "MMM D"
  ];

  for (const format of formats) {
    const parsed = moment(value, format, true);
    if (parsed.isValid()) {
      if (!/\d{4}/.test(value)) parsed.year(moment().year());
      return parsed.toISOString();
    }
  }

  const parsed = moment(new Date(value));
  return parsed.isValid() ? parsed.toISOString() : null;
};

const sortByDateAsc = (items) => [...items].sort((a, b) => getOrderMoment(a).valueOf() - getOrderMoment(b).valueOf());

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekCursor, setWeekCursor] = useState(moment().startOf("week"));
  const [monthCursor, setMonthCursor] = useState(moment().startOf("month"));
  const [selectedDayKey, setSelectedDayKey] = useState(moment().format("YYYY-MM-DD"));

  const load = async () => {
    const [orderRecords, noteRecords] = await Promise.all([
      base44.entities.Order.list("-order_date", 300),
      base44.entities.CustomerNote.list("-created_date", 200),
    ]);
    setOrders(orderRecords || []);
    setNotes(noteRecords || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubscribeOrders = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        setOrders((prev) => [event.data, ...prev.filter((order) => order.id !== event.data.id)]);
        return;
      }
      if (event.type === "update") {
        setOrders((prev) => prev.map((order) => (order.id === event.id ? event.data : order)));
        setEditOrder((prev) => (prev?.id === event.id ? event.data : prev));
        return;
      }
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((order) => order.id !== event.id));
        setEditOrder((prev) => (prev?.id === event.id ? null : prev));
      }
    });

    const unsubscribeNotes = base44.entities.CustomerNote.subscribe((event) => {
      if (event.type === "create") {
        setNotes((prev) => [event.data, ...prev.filter((note) => note.id !== event.data.id)]);
        return;
      }
      if (event.type === "update") {
        setNotes((prev) => prev.map((note) => (note.id === event.id ? event.data : note)));
        return;
      }
      if (event.type === "delete") {
        setNotes((prev) => prev.filter((note) => note.id !== event.id));
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotes();
    };
  }, []);

  useEffect(() => {
    const intelligenceNotes = notes.filter((note) => (note.tags || []).some((tag) => String(tag).startsWith("report-data:")));

    intelligenceNotes.forEach(async (note) => {
      const reportTag = (note.tags || []).find((tag) => String(tag).startsWith("report-data:"));
      if (!reportTag) return;

      const reportData = JSON.parse(reportTag.replace("report-data:", ""));
      const existingOrder = orders.find((order) => order.source_report_id === note.id);
      const resolvedDate = parseNaturalDate(reportData.delivery_date);
      if (!resolvedDate) return;

      const payload = {
        client_name: reportData.client_name || note.client_name || "Not recorded.",
        order_details: reportData.order_list || "Not recorded.",
        delivery_address: reportData.delivery_address || "Not recorded.",
        payment_method: reportData.payment_method || "Other",
        payment_status: reportData.payment_status || "PENDING",
        order_value: Number(String(reportData.order_total || "").replace(/[^\d.]/g, "")) || 0,
        order_date: resolvedDate,
        status: reportData.payment_status === "PAID" || reportData.payment_status === "CASH" ? "Confirmed" : "Pending",
        planner_status: reportData.payment_status === "PAID" || reportData.payment_status === "CASH" ? "Processing" : "Pending",
        source_report_id: note.id,
        time_slot: reportData.delivery_date || "",
        special_instructions: reportData.next_action || "",
        priority_level: "Medium",
      };

      if (!existingOrder) {
        await base44.entities.Order.create(payload);
        return;
      }

      const shouldUpdate = [
        existingOrder.client_name !== payload.client_name,
        existingOrder.order_details !== payload.order_details,
        existingOrder.delivery_address !== payload.delivery_address,
        existingOrder.payment_method !== payload.payment_method,
        existingOrder.payment_status !== payload.payment_status,
        Number(existingOrder.order_value || 0) !== Number(payload.order_value || 0),
        existingOrder.order_date !== payload.order_date,
        existingOrder.time_slot !== payload.time_slot,
        existingOrder.special_instructions !== payload.special_instructions,
      ].some(Boolean);

      if (shouldUpdate) {
        await base44.entities.Order.update(existingOrder.id, payload);
      }
    });
  }, [notes]);

  const filteredOrders = useMemo(() => sortByDateAsc(orders.filter((order) => getFilterMatch(order, statusFilter))), [orders, statusFilter]);

  const statusCounts = useMemo(() => ({
    upcoming: orders.filter(isUpcoming).length,
    pending: orders.filter(isPending).length,
    urgent: orders.filter(isUrgent).length,
    fulfilled: orders.filter(isFulfilled).length,
    overdue: orders.filter(isOverdue).length,
  }), [orders]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => weekCursor.clone().add(index, "days")), [weekCursor]);

  const weeklyOrdersByDay = useMemo(() => {
    const map = {};
    weekDays.forEach((day) => {
      const key = day.format("YYYY-MM-DD");
      map[key] = filteredOrders.filter((order) => getOrderMoment(order).format("YYYY-MM-DD") === key);
    });
    return map;
  }, [filteredOrders, weekDays]);

  const monthDays = useMemo(() => {
    const start = monthCursor.clone().startOf("month").startOf("week");
    const end = monthCursor.clone().endOf("month").endOf("week");
    const count = end.diff(start, "days") + 1;
    return Array.from({ length: count }, (_, index) => start.clone().add(index, "days"));
  }, [monthCursor]);

  const ordersByDay = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const key = getOrderMoment(order).format("YYYY-MM-DD");
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      return acc;
    }, {});
  }, [filteredOrders]);

  const selectedDayOrders = useMemo(() => sortByDateAsc(ordersByDay[selectedDayKey] || []), [ordersByDay, selectedDayKey]);
  const todaysOrders = useMemo(() => sortByDateAsc(orders.filter((order) => getOrderMoment(order).isSame(moment(), "day"))), [orders]);

  const handleSave = async (data) => {
    const payload = {
      ...data,
      payment_status: data.payment_status || "PENDING",
    };

    if (editOrder) {
      const updated = await base44.entities.Order.update(editOrder.id, payload);
      await syncReportFromOrder(updated);
    } else {
      await base44.entities.Order.create(payload);
    }

    setEditOrder(null);
  };

  const handleDelete = async () => {
    const order = orders.find((item) => item.id === deleteId);
    if (order?.source_report_id) {
      await base44.entities.CustomerNote.update(order.source_report_id, {
        tags: (notes.find((note) => note.id === order.source_report_id)?.tags || []).filter((tag) => !String(tag).startsWith("report-data:") && !String(tag).startsWith("payment-status:")),
      });
    }
    await base44.entities.Order.delete(deleteId);
    setDeleteId(null);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ paddingBottom: "24px", borderBottom: "1px solid rgba(210,156,108,0.25)", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "42px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Orders</h1>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#eee3b4", fontWeight: 300 }}>All orders logged onto their date for clear and easy review of timelines.</p>
            <div style={{ width: "60px", height: "2px", background: "#d29c6c", marginTop: "16px" }} />
          </div>
          <GoldBtn onClick={() => { setEditOrder(null); setFormOpen(true); }}><Plus size={12} /> New Order</GoldBtn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "30px" }}>
        {Object.entries(statusBlockConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter((prev) => prev === key ? "all" : key)}
            style={{
              textAlign: "left",
              background: config.background,
              border: statusFilter === key ? "1px solid rgba(238,227,180,0.9)" : "1px solid rgba(255,255,255,0.08)",
              padding: "18px",
              cursor: "pointer",
              boxShadow: statusFilter === key ? "0 0 0 1px rgba(238,227,180,0.35)" : "none",
            }}
          >
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: config.labelColor, fontWeight: config.strong ? 700 : 500, fontStyle: config.italic ? "italic" : "normal" }}>{config.label}</p>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "34px", color: config.valueColor, fontWeight: 700 }}>{statusCounts[key]}</p>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "26px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Upcoming Orders</p>
        <div style={{ width: "72px", height: "2px", background: "rgba(201,168,76,0.55)", marginTop: "10px" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
        <GoldBtn onClick={() => setWeekCursor((prev) => prev.clone().subtract(1, "week"))}><ChevronLeft size={14} /> Previous Week</GoldBtn>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(238,227,180,0.72)" }}>{weekCursor.format("D MMM YYYY")} — {weekCursor.clone().endOf("week").format("D MMM YYYY")}</p>
        <GoldBtn onClick={() => setWeekCursor((prev) => prev.clone().add(1, "week"))}>Next Week <ChevronRight size={14} /></GoldBtn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "12px", marginBottom: "40px" }}>
        {weekDays.map((day) => {
          const dayOrders = weeklyOrdersByDay[day.format("YYYY-MM-DD")] || [];
          return (
            <div key={day.format()} style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", minHeight: "260px" }}>
              <div style={{ padding: "14px", borderBottom: "1px solid rgba(201,168,76,0.18)", background: "#0a0a0a" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#d29c6c" }}>{day.format("ddd")}</p>
                <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "30px", color: "#F5F0E8", lineHeight: 1 }}>{day.format("D")}</p>
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#eee3b4" }}>{day.format("MMM")}</p>
                <p style={{ margin: "4px 0 0", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(238,227,180,0.62)" }}>{day.format("YYYY")}</p>
              </div>
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {dayOrders.map((order) => {
                  const badgeStyle = paymentBadgeMap[order.payment_status || "PENDING"] || paymentBadgeMap.PENDING;
                  return (
                    <button key={order.id} onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ textAlign: "left", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "12px", cursor: "pointer" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                      <p style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: "18px", color: "#d29c6c" }}>{order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "R0"}</p>
                      <span style={{ display: "inline-flex", marginTop: "8px", padding: "4px 8px", ...badgeStyle, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span>
                      <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.58)", lineHeight: 1.5 }}>{order.delivery_address}</p>
                    </button>
                  );
                })}
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
          const dayOrders = ordersByDay[key] || [];
          const isCurrentMonth = day.isSame(monthCursor, "month");
          const isPastDay = day.isBefore(moment(), "day");
          const isToday = day.isSame(moment(), "day");
          return (
            <button key={key} onClick={() => setSelectedDayKey(key)} style={{ minHeight: "110px", background: isToday ? "rgba(210,156,108,0.08)" : selectedDayKey === key ? "rgba(201,168,76,0.08)" : "#111111", border: isToday ? "1px solid rgba(210,156,108,0.55)" : "1px solid rgba(201,168,76,0.16)", padding: "10px", cursor: "pointer", textAlign: "left", opacity: isCurrentMonth ? 1 : 0.45, position: "relative", overflow: "hidden" }}>
              {isPastDay && (
                <span style={{ position: "absolute", left: "-10%", top: "50%", width: "120%", height: "1px", background: "rgba(238,227,180,0.35)", transform: "rotate(-18deg)", transformOrigin: "center" }} />
              )}
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#F5F0E8", position: "relative", zIndex: 1 }}>{day.format("D")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px", position: "relative", zIndex: 1 }}>
                {dayOrders.slice(0, 4).map((order) => (
                  <span key={order.id} style={{ width: "8px", height: "8px", borderRadius: "9999px", background: order.payment_status === "PENDING" ? "#C2185B" : order.payment_status === "CASH" ? "#C9A84C" : "#eee3b4", display: "inline-block" }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c" }}>Today&apos;s Orders</p>
        <div style={{ width: "72px", height: "2px", background: "rgba(201,168,76,0.55)", marginTop: "10px", marginBottom: "18px" }} />
        {todaysOrders.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(238,227,180,0.62)" }}>No deliveries scheduled.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginBottom: "30px" }}>
            {todaysOrders.map((order) => {
              const badgeStyle = paymentBadgeMap[order.payment_status || "PENDING"] || paymentBadgeMap.PENDING;
              return (
                <button key={order.id} onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ textAlign: "left", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "14px", cursor: "pointer" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                  <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)", lineHeight: 1.5 }}>{order.delivery_address}</p>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c" }}>{order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "R0"}</p>
                  <span style={{ display: "inline-flex", marginTop: "10px", padding: "4px 8px", ...badgeStyle, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "#eee3b4", lineHeight: 1.5 }}>{order.special_instructions || "No action item recorded."}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", marginBottom: "32px" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(201,168,76,0.18)", background: "#0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#d29c6c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Orders for {moment(selectedDayKey).format("D MMMM YYYY")}</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input value={statusFilter === "all" ? "All statuses" : statusBlockConfig[statusFilter].label} readOnly style={{ ...inputBase, padding: "10px 12px", minWidth: "150px", color: "rgba(245,240,232,0.72)" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {selectedDayOrders.map((order) => (
            <button key={order.id} onClick={() => { setEditOrder(order); setFormOpen(true); }} style={{ textAlign: "left", padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "transparent", borderLeft: "none", borderRight: "none", borderTop: "none", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                  <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>{order.delivery_address}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c" }}>{order.order_value ? `R${Number(order.order_value).toLocaleString()}` : "R0"}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <OrderFormDialog open={formOpen} onOpenChange={setFormOpen} order={editOrder} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Order" description="This order will be permanently removed from the log." onConfirm={handleDelete} />
    </div>
  );
}