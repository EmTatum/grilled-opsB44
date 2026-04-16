import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import { getIntelligenceReportViewModel, getReportDataFromTags, isIntelligenceReportNote, normalizePaymentStatus } from "../utils/customerNotes";

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
  upcoming: { label: "UPCOMING", background: "#1a1a1a", labelColor: "#C9A84C", valueColor: "#C9A84C" },
  pending: { label: "PENDING", background: "#1a1a1a", labelColor: "#C9A84C", valueColor: "#C9A84C" },
  urgent: { label: "URGENT", background: "#1a1a1a", labelColor: "#C9A84C", valueColor: "#C9A84C", strong: true },
  fulfilled: { label: "FULFILLED", background: "#1a1a1a", labelColor: "rgba(245,240,232,0.7)", valueColor: "#C9A84C" },
  overdue: { label: "OVERDUE", background: "#1a1a1a", labelColor: "#C2185B", valueColor: "#C9A84C", italic: true },
};

const parseReportDate = (value) => {
  if (!value || value === "Not recorded.") return null;
  const parsed = moment(value, [moment.ISO_8601, "D MMMM YYYY", "D MMM YYYY", "Do MMMM", "Do MMM", "D MMMM", "D MMM", "MMMM D YYYY", "MMM D YYYY", "MMMM D", "MMM D"], true);
  if (parsed.isValid()) {
    if (!/\d{4}/.test(String(value))) parsed.year(moment().year());
    return parsed;
  }
  const fallback = moment(new Date(value));
  return fallback.isValid() ? fallback : null;
};

const mapNoteToReport = (note) => {
  const rawData = getReportDataFromTags(note.tags || []) || {};
  const normalizedStatus = normalizePaymentStatus(rawData.payment_status, rawData.payment_method);
  const parsedDeliveryMoment = parseReportDate(rawData.delivery_date || "Not recorded.");

  return {
    ...getIntelligenceReportViewModel(note),
    id: note.id,
    client_name: note.client_name || rawData.client_name || "Not recorded.",
    delivery_date: rawData.delivery_date || "Not recorded.",
    payment_status: normalizedStatus,
    order_list: rawData.order_list || "Not recorded.",
    order_total: rawData.order_total || "Not confirmed.",
    delivery_address: rawData.delivery_address || "Not recorded.",
    next_action: rawData.next_action || "Not recorded.",
    delivery_time: parsedDeliveryMoment ? parsedDeliveryMoment.format("HH:mm") : "",
  };
};

const getReportMoment = (report) => parseReportDate(report.delivery_date);
const isFulfilled = (report) => {
  const reportMoment = getReportMoment(report);
  if (!reportMoment) return false;
  return reportMoment.isBefore(moment(), "day");
};
const isPending = (report) => report.delivery_date === "Not recorded.";
const isUrgent = (report) => {
  const reportMoment = getReportMoment(report);
  if (!reportMoment) return false;
  return reportMoment.isSame(moment(), "day") || (reportMoment.isAfter(moment()) && reportMoment.diff(moment(), "hours", true) <= 24);
};
const isUpcoming = (report) => {
  const reportMoment = getReportMoment(report);
  if (!reportMoment) return false;
  return reportMoment.isAfter(moment(), "day");
};
const isOverdue = (report) => {
  const reportMoment = getReportMoment(report);
  if (!reportMoment) return false;
  return reportMoment.isBefore(moment(), "day") && String(report.payment_status || "").toUpperCase() !== "PAID";
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

const sortByDateAsc = (items) => [...items].sort((a, b) => {
  const aMoment = getReportMoment(a);
  const bMoment = getReportMoment(b);
  return (aMoment?.valueOf() || 0) - (bMoment?.valueOf() || 0);
});

export default function Orders() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekCursor, setWeekCursor] = useState(moment().startOf("week"));
  const [monthCursor, setMonthCursor] = useState(moment().startOf("month"));
  const [selectedDayKey, setSelectedDayKey] = useState(moment().format("YYYY-MM-DD"));

  const load = async () => {
    const noteRecords = await base44.entities.CustomerNote.list("-updated_date", 300);
    setReports((noteRecords || []).filter(isIntelligenceReportNote).map(mapNoteToReport));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubscribeNotes = base44.entities.CustomerNote.subscribe((event) => {
      if (event.type === "create") {
        if (!isIntelligenceReportNote(event.data)) return;
        setReports((prev) => [mapNoteToReport(event.data), ...prev.filter((report) => report.id !== event.data.id)]);
        return;
      }
      if (event.type === "update") {
        if (!isIntelligenceReportNote(event.data)) {
          setReports((prev) => prev.filter((report) => report.id !== event.id));
          return;
        }
        const nextReport = mapNoteToReport(event.data);
        setReports((prev) => {
          const existing = prev.some((report) => report.id === event.id);
          if (!existing) return [nextReport, ...prev];
          return prev.map((report) => (report.id === event.id ? nextReport : report));
        });
        return;
      }
      if (event.type === "delete") {
        setReports((prev) => prev.filter((report) => report.id !== event.id));
      }
    });

    return unsubscribeNotes;
  }, []);

  const filteredOrders = useMemo(() => sortByDateAsc(reports.filter((report) => getFilterMatch(report, statusFilter))), [reports, statusFilter]);
  const allOrdersByDay = useMemo(() => reports.reduce((acc, report) => {
    const key = getReportMoment(report)?.format("YYYY-MM-DD");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(report);
    return acc;
  }, {}), [reports]);

  const statusCounts = useMemo(() => ({
    upcoming: reports.filter(isUpcoming).length,
    pending: reports.filter(isPending).length,
    urgent: reports.filter(isUrgent).length,
    fulfilled: reports.filter(isFulfilled).length,
    overdue: reports.filter(isOverdue).length,
  }), [reports]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => weekCursor.clone().add(index, "days")), [weekCursor]);

  const weeklyOrdersByDay = useMemo(() => {
    const map = {};
    weekDays.forEach((day) => {
      const key = day.format("YYYY-MM-DD");
      map[key] = allOrdersByDay[key] || [];
    });
    return map;
  }, [allOrdersByDay, weekDays]);

  const monthDays = useMemo(() => {
    const start = monthCursor.clone().startOf("month").startOf("week");
    const end = monthCursor.clone().endOf("month").endOf("week");
    const count = end.diff(start, "days") + 1;
    return Array.from({ length: count }, (_, index) => start.clone().add(index, "days"));
  }, [monthCursor]);

  const selectedDayOrders = useMemo(() => sortByDateAsc(allOrdersByDay[selectedDayKey] || []), [allOrdersByDay, selectedDayKey]);
  const todaysOrders = useMemo(() => sortByDateAsc(reports.filter((report) => {
    const reportMoment = getReportMoment(report);
    return reportMoment && reportMoment.isSame(moment(), "day");
  })), [reports]);

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
              border: statusFilter === key ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(201,168,76,0.25)",
              padding: "18px",
              cursor: "pointer",
              boxShadow: statusFilter === key ? "0 0 20px rgba(201,168,76,0.1)" : "none",
            }}
          >
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: config.labelColor, fontWeight: config.strong ? 700 : 500, fontStyle: config.italic ? "italic" : "normal" }}>{config.label}</p>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "34px", color: config.valueColor, fontWeight: 700 }}>{statusCounts[key]}</p>
          </button>
        ))}
      </div>

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
                    <div key={order.id} style={{ textAlign: "left", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "12px" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                      <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.58)", lineHeight: 1.5 }}>{order.delivery_address}</p>
                      <p style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: "18px", color: "#d29c6c" }}>{order.order_total || "Not confirmed."}</p>
                      <span style={{ display: "inline-flex", marginTop: "8px", padding: "4px 8px", ...badgeStyle, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span>
                    </div>
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
          const dayOrders = allOrdersByDay[key] || [];
          const uniqueDayOrders = dayOrders.reduce((acc, order) => {
            const existing = acc.find((item) => item.client_name === order.client_name);
            if (!existing) acc.push(order);
            return acc;
          }, []);
          const isCurrentMonth = day.isSame(monthCursor, "month");
          const isPastDay = day.isBefore(moment(), "day");
          const isToday = day.isSame(moment(), "day");
          return (
            <button key={key} onClick={() => setSelectedDayKey(key)} style={{ minHeight: "110px", background: isToday ? "rgba(210,156,108,0.08)" : selectedDayKey === key ? "rgba(201,168,76,0.08)" : "#111111", border: isToday ? "1px solid rgba(210,156,108,0.55)" : "1px solid rgba(201,168,76,0.16)", padding: "10px", cursor: "pointer", textAlign: "left", opacity: isCurrentMonth ? 1 : 0.45, position: "relative", overflow: "hidden" }}>
              {isPastDay && (
                <span style={{ position: "absolute", left: "-10%", top: "50%", width: "120%", height: "1px", background: "rgba(238,227,180,0.35)", transform: "rotate(-18deg)", transformOrigin: "center" }} />
              )}
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#F5F0E8", position: "relative", zIndex: 1 }}>{day.format("D")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px", position: "relative", zIndex: 1 }}>
                {uniqueDayOrders.slice(0, 2).map((order) => (
                  <div key={order.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(245,240,232,0.82)", display: "block", lineHeight: 1.2 }}>
                      {order.client_name}
                    </span>
                    {order.delivery_time && (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "9px", color: "rgba(201,168,76,0.72)", display: "block", lineHeight: 1.2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {order.delivery_time}
                      </span>
                    )}
                  </div>
                ))}
                {uniqueDayOrders.length > 2 && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#C9A84C", display: "block", lineHeight: 1.3 }}>
                    +{uniqueDayOrders.length - 2} more
                  </span>
                )}
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
                <div key={order.id} style={{ textAlign: "left", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "14px" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                  <p style={{ margin: "8px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)", lineHeight: 1.5 }}>{order.delivery_address}</p>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "#eee3b4", lineHeight: 1.6, whiteSpace: "pre-line" }}>{order.order_list}</p>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c" }}>{order.order_total || "Not confirmed."}</p>
                  <span style={{ display: "inline-flex", marginTop: "10px", padding: "4px 8px", ...badgeStyle, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "#eee3b4", lineHeight: 1.5 }}>{order.next_action || "Not recorded."}</p>
                </div>
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
          {selectedDayOrders.map((order) => {
            const badgeStyle = paymentBadgeMap[order.payment_status || "PENDING"] || paymentBadgeMap.PENDING;
            return (
              <div key={order.id} style={{ textAlign: "left", padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "#F5F0E8" }}>{order.client_name}</p>
                    <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>{order.delivery_address}</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c" }}>{order.order_total || "Not confirmed."}</p>
                    <span style={{ display: "inline-flex", padding: "4px 8px", ...badgeStyle, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{order.payment_status || "PENDING"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}