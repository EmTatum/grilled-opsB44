import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import { Phone } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cleanClientName, isVisibleOrderRecord } from "../components/notes/memberIntelligenceUtils";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const sectionCardStyle = {
  background: "var(--color-bg-secondary)",
  border: "1px solid var(--color-border-gold)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  borderRadius: "6px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.06)"
};

const sectionTitleStyle = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  color: "#C9A84C",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

const emptyTextStyle = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "rgba(245,240,232,0.6)"
};

const paymentBadgeStyles = {
  PAID: { background: "rgba(22,163,74,0.14)", border: "1px solid rgba(22,163,74,0.5)", color: "#16a34a" },
  CASH: { background: "rgba(210,156,108,0.14)", border: "1px solid rgba(210,156,108,0.5)", color: "#d29c6c" },
  PENDING: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(245,240,232,0.7)" }
};

function getDatePart(value) {
  return String(value || "").trim().split("T")[0] || "";
}

function getTimePart(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("T")) return "Time TBC";
  const [, timePart = ""] = raw.split("T");
  return timePart ? timePart.slice(0, 5) : "Time TBC";
}

function formatCurrency(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

function PaymentBadge({ value }) {
  const style = paymentBadgeStyles[value] || paymentBadgeStyles.PENDING;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {value || "PENDING"}
    </span>
  );
}

function TodayOrderCard({ order }) {
  const [copied, setCopied] = useState(false);
  const isFulfilled = order.fulfilment_status === "Fulfilled";

  const handleCopy = async () => {
    const lines = [
      cleanClientName(order.client_name),
      `${getTimePart(order.delivery_date)} — ${order.delivery_address || "Address TBC"}`,
      `📞 ${order.cell_number || "No contact number"}`
    ];

    if (order.payment_status === "CASH") {
      lines.push(`💵 ${formatCurrency(order.order_total)} — Cash on delivery`);
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div style={{ background: isFulfilled ? "rgba(21, 128, 61, 0.12)" : "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: isFulfilled ? "3px solid #15803d" : "1px solid rgba(201,168,76,0.18)", padding: "18px", display: "grid", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: "8px", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: 700, color: "#F5F0E8", opacity: isFulfilled ? 0.7 : 1 }}>{cleanClientName(order.client_name)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#F5F0E8", opacity: isFulfilled ? 0.7 : 1 }}>{getTimePart(order.delivery_date)}</p>
              {isFulfilled && (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#15803d", letterSpacing: "0.08em" }}>✓ Done</span>
              )}
            </div>
          </div>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: order.delivery_address ? "rgba(245,240,232,0.62)" : "rgba(245,240,232,0.4)" }}>{order.delivery_address || "Address TBC"}</p>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.58)" }}>
            <Phone size={12} />
            <span>{order.cell_number || "No contact number"}</span>
          </p>
          {order.payment_status === "CASH" && (
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>💵 {formatCurrency(order.order_total)} — Cash on delivery</p>
          )}
          <Link to="/daily-dispatch-manifest" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.68)", letterSpacing: "0.02em" }}>
            View Dispatch →
          </Link>
        </div>
        <PaymentBadge value={order.payment_status} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 14px", borderRadius: "2px", cursor: "pointer" }}
        >
          {copied ? "✓ Copied!" : "Copy for Driver"}
        </button>
      </div>
    </div>
  );
}

function TodayOrders({ orders, todayDisplay }) {
  return (
    <section style={sectionCardStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "baseline" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, color: "#F5F0E8", letterSpacing: "0.01em" }}>Today&apos;s Orders</p>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 600, color: "#C9A84C" }}>— {todayDisplay}</p>
      </div>
      {orders.length === 0 ? (
        <p style={emptyTextStyle}>No deliveries scheduled for today.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {orders.map((order) => (
            <TodayOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyView({ orders, today }) {
  const start = moment(today).startOf("isoWeek");

  const groups = Array.from({ length: 7 }, (_, index) => {
    const day = start.clone().add(index, "days");
    const key = day.format("YYYY-MM-DD");
    return {
      key,
      label: day.format("dddd, D MMMM"),
      orders: orders.filter((order) => getDatePart(order.delivery_date) === key)
    };
  });

  return (
    <section style={sectionCardStyle}>
      <p style={sectionTitleStyle}>Weekly View</p>
      <div style={{ display: "grid", gap: "14px" }}>
        {groups.map((day) => (
          <div key={day.key} style={{ display: "grid", gap: "10px", paddingTop: "4px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.72)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{day.label}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {day.orders.length === 0 ? (
                <p style={emptyTextStyle}>No orders.</p>
              ) : day.orders.map((order) => (
                <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "16px", display: "grid", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.75)" }}>{getTimePart(order.delivery_date)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <PaymentBadge value={order.payment_status} />
                    {order.payment_status === "CASH" && <span style={{ fontSize: "14px" }}>💵</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthlyCalendar({ orders, today }) {
  const monthStart = moment(today).startOf("month");
  const gridStart = monthStart.clone().startOf("isoWeek");
  const gridEnd = monthStart.clone().endOf("month").endOf("isoWeek");
  const totalDays = gridEnd.diff(gridStart, "days") + 1;

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = gridStart.clone().add(index, "days");
    const key = day.format("YYYY-MM-DD");
    const dayOrders = orders.filter((order) => getDatePart(order.delivery_date) === key);
    return { key, day, orders: dayOrders, inMonth: day.isSame(monthStart, "month") };
  });

  return (
    <section style={sectionCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "baseline" }}>
        <p style={sectionTitleStyle}>Monthly Calendar</p>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{monthStart.format("MMMM YYYY")}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "8px" }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} style={{ padding: "8px 4px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.72)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
        ))}
        {days.map((day) => {
          const isPastDay = day.day.isBefore(moment(today, "YYYY-MM-DD"), "day");
          const isToday = day.day.isSame(moment(today, "YYYY-MM-DD"), "day");
          return (
          <Popover key={day.key}>
            <PopoverTrigger asChild>
              <button style={{ minHeight: "82px", background: isToday ? "rgba(201,168,76,0.08)" : day.inMonth ? "#1a1a1a" : "#0f0f0f", border: isToday ? "1px solid rgba(201,168,76,0.45)" : "1px solid rgba(201,168,76,0.14)", color: day.inMonth ? "#F5F0E8" : "rgba(245,240,232,0.28)", padding: "10px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", cursor: day.orders.length ? "pointer" : "default", opacity: isPastDay ? 0.4 : 1 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", textDecoration: isPastDay ? "line-through" : "none" }}>{day.day.format("D")}</span>
                {day.orders.length > 0 ? (
                  <span style={{ minWidth: "22px", height: "22px", padding: "0 7px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(201,168,76,0.14)", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "11px" }}>
                    {day.orders.length}
                  </span>
                ) : <span style={{ width: "6px", height: "6px" }} />}
              </button>
            </PopoverTrigger>
            {day.orders.length > 0 && (
              <PopoverContent align="start" style={{ width: "260px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.24)", color: "#F5F0E8" }}>
                <div style={{ display: "grid", gap: "10px" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#C9A84C" }}>{day.day.format("D MMMM YYYY")}</p>
                  {day.orders.map((order) => (
                    <div key={order.id} style={{ display: "grid", gap: "4px", paddingTop: "6px", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px" }}>{cleanClientName(order.client_name)}</p>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>{getTimePart(order.delivery_date)}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
          );
        })}
      </div>
    </section>
  );
}

export default function Orders() {
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = moment().format("YYYY-MM-DD");
  const todayDisplay = moment().format("dddd, D MMMM YYYY");

  useEffect(() => {
    let active = true;

    const sortOrders = (records) => [...records].sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")));

    const load = async () => {
      try {
        const records = await base44.entities.MemberOrder.list("delivery_date", 1000);
        if (!active) return;
        setLiveOrders(records || []);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (!active || !event?.type) return;

      setLiveOrders((current) => {
        if (event.type === "create") {
          return sortOrders([event.data, ...current.filter((item) => item.id !== event.data.id)]);
        }
        if (event.type === "update") {
          return sortOrders(current.map((item) => item.id === event.id ? event.data : item));
        }
        if (event.type === "delete") {
          return current.filter((item) => item.id !== event.id);
        }
        return current;
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const orders = useMemo(() => {
    return [...liveOrders]
      .filter(isVisibleOrderRecord)
      .sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")));
  }, [liveOrders]);

  const todaysOrders = useMemo(() => {
    return [...orders.filter((order) => getDatePart(order.delivery_date) === today)].sort((a, b) => {
      const aFulfilled = a.fulfilment_status === 'Fulfilled';
      const bFulfilled = b.fulfilment_status === 'Fulfilled';
      if (aFulfilled && !bFulfilled) return 1;
      if (!aFulfilled && bFulfilled) return -1;
      return (a.delivery_date || '').localeCompare(b.delivery_date || '');
    });
  }, [orders, today]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <PageHeader title="Orders" subtitle="Live MemberOrder planning, delivery tracking, and calendar visibility." />
      <TodayOrders orders={todaysOrders} todayDisplay={todayDisplay} />
      <WeeklyView orders={orders} today={today} />
      <MonthlyCalendar orders={orders} today={today} />
    </div>
  );
}