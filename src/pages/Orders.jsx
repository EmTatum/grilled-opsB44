import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const sectionCardStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
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
  CASH: { background: "rgba(141,32,28,0.14)", border: "1px solid rgba(141,32,28,0.5)", color: "#8d201c" },
  PENDING: { background: "rgba(210,156,108,0.14)", border: "1px solid rgba(210,156,108,0.5)", color: "#d29c6c" }
};

function getDatePart(value) {
  return String(value || "").trim().split("T")[0] || "";
}

function formatDeliveryDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Date TBC";

  const [datePart, timePart] = raw.includes("T") ? raw.split("T") : [raw, ""];
  const date = moment(datePart, "YYYY-MM-DD", true);
  if (!date.isValid()) return "Date TBC";

  if (timePart) return `${date.format("D MMMM YYYY")} at ${timePart.slice(0, 5)}`;
  return `${date.format("D MMMM YYYY")} — Time TBC`;
}

function formatCurrency(value) {
  return `R${Number(value || 0).toLocaleString("en-ZA")}`;
}

function StatusBlocks({ counts }) {
  const blocks = [
    { label: "Active", value: counts.active, background: "#d29c6c", color: "#0a0a0a" },
    { label: "Fulfilled", value: counts.fulfilled, background: "#16a34a", color: "#F5F0E8" },
    { label: "Cancelled", value: counts.cancelled, background: "#8d201c", color: "#F5F0E8" }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
      {blocks.map((block) => (
        <div key={block.label} style={{ background: block.background, color: block.color, padding: "22px 18px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "10px", minHeight: "130px", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "42px", lineHeight: 1, fontWeight: 600 }}>{block.value}</p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.9 }}>{block.label}</p>
        </div>
      ))}
    </div>
  );
}

function PaymentBadge({ value }) {
  const style = paymentBadgeStyles[value] || paymentBadgeStyles.PENDING;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {value || "PENDING"}
    </span>
  );
}

function TodayOrders({ orders }) {
  return (
    <section style={sectionCardStyle}>
      <p style={sectionTitleStyle}>Today&apos;s Orders</p>
      {orders.length === 0 ? (
        <p style={emptyTextStyle}>No deliveries scheduled for today.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "16px", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                <PaymentBadge value={order.payment_status} />
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{formatDeliveryDate(order.delivery_date)}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: order.delivery_address ? "#F5F0E8" : "rgba(245,240,232,0.5)" }}>{order.delivery_address || "Address TBC"}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>{formatCurrency(order.order_total)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyView({ orders, today }) {
  const start = moment(today).startOf("isoWeek");
  const end = moment(today).endOf("isoWeek");

  const groups = Array.from({ length: 7 }, (_, index) => {
    const day = start.clone().add(index, "days");
    const key = day.format("YYYY-MM-DD");
    return {
      key,
      label: day.format("dddd, D MMMM"),
      orders: orders.filter((order) => getDatePart(order.delivery_date) === key)
    };
  }).filter((day) => day.orders.length > 0);

  return (
    <section style={sectionCardStyle}>
      <p style={sectionTitleStyle}>Weekly View</p>
      {groups.length === 0 ? (
        <p style={emptyTextStyle}>No orders scheduled this week.</p>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {groups.map((day) => (
            <div key={day.key} style={{ display: "grid", gap: "10px", paddingTop: "4px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.72)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{day.label}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {day.orders.map((order) => (
                  <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "14px", display: "grid", gap: "8px" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.75)" }}>{formatDeliveryDate(order.delivery_date)}</p>
                    <PaymentBadge value={order.payment_status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
        {days.map((day) => (
          <Popover key={day.key}>
            <PopoverTrigger asChild>
              <button style={{ minHeight: "82px", background: day.inMonth ? "#1a1a1a" : "#0f0f0f", border: "1px solid rgba(201,168,76,0.14)", color: day.inMonth ? "#F5F0E8" : "rgba(245,240,232,0.28)", padding: "10px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", cursor: day.orders.length ? "pointer" : "default" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>{day.day.format("D")}</span>
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
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px" }}>{order.client_name || "Unknown Client"}</p>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>{formatDeliveryDate(order.delivery_date)}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        ))}
      </div>
    </section>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const records = await base44.entities.MemberOrder.list("-updated_date", 1000);
      setOrders(records || []);
      setLoading(false);
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((item) => item.id !== event.id));
        return;
      }

      const next = event.data;
      setOrders((prev) => [next, ...prev.filter((item) => item.id !== next.id)]);
    });

    return unsubscribe;
  }, []);

  const today = moment().format("YYYY-MM-DD");

  const counts = useMemo(() => ({
    active: orders.filter((order) => order.fulfilment_status === "Active").length,
    fulfilled: orders.filter((order) => order.fulfilment_status === "Fulfilled").length,
    cancelled: orders.filter((order) => order.fulfilment_status === "Cancelled").length
  }), [orders]);

  const todaysOrders = useMemo(() => orders.filter((order) => getDatePart(order.delivery_date) === today), [orders, today]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Orders" subtitle="Live MemberOrder planning, delivery tracking, and calendar visibility." />
      <StatusBlocks counts={counts} />
      <TodayOrders orders={todaysOrders} />
      <WeeklyView orders={orders} today={today} />
      <MonthlyCalendar orders={orders} today={today} />
    </div>
  );
}