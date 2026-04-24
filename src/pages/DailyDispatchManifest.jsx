import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCcw } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MemberOrderDispatchCards from "../components/orders/MemberOrderDispatchCards";

const TODAY = "2026-04-24";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const countBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "28px",
  height: "28px",
  padding: "0 10px",
  border: "1px solid rgba(201,168,76,0.4)",
  background: "rgba(201,168,76,0.08)",
  color: "#d29c6c",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const refreshButtonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const sectionConfigs = {
  overdue: { title: "Overdue", borderColor: "#8d201c" },
  today: { title: "Today's Dispatches", borderColor: "#d29c6c" },
  upcoming: { title: "Upcoming", borderColor: "#15434a" },
  unscheduled: { title: "Unscheduled", borderColor: "rgba(255,255,255,0.22)" },
};

const normalizeDate = (value) => String(value || "").trim();

const classifyOrders = (orders) => {
  const activeOrders = orders.filter((order) => order.fulfilment_status === "Active");

  return {
    activeOrders,
    overdue: activeOrders.filter((order) => {
      const date = normalizeDate(order.delivery_date);
      return date && date < TODAY;
    }),
    today: activeOrders.filter((order) => normalizeDate(order.delivery_date) === TODAY),
    upcoming: activeOrders.filter((order) => {
      const date = normalizeDate(order.delivery_date);
      return date && date > TODAY;
    }),
    unscheduled: activeOrders.filter((order) => !normalizeDate(order.delivery_date)),
  };
};

function DispatchSection({ title, borderColor, orders, onStatusChange }) {
  if (!orders.length) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {title}
          </h2>
          <span style={countBadgeStyle}>{orders.length}</span>
        </div>
        <div style={{ flex: 1, minWidth: "140px", height: "1px", background: borderColor, opacity: 0.8 }} />
      </div>

      <MemberOrderDispatchCards orders={orders} onStatusChange={onStatusChange} sectionBorderColor={borderColor} />
    </section>
  );
}

export default function DailyDispatchManifest() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const records = await base44.entities.MemberOrder.list("delivery_date", 500);
    setOrders(records || []);
    setLoading(false);
    if (isRefresh) setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((order) => order.id !== event.id));
        return;
      }

      const nextOrder = event.data;
      setOrders((prev) => {
        const filtered = prev.filter((order) => order.id !== nextOrder.id);
        return [...filtered, nextOrder].sort((a, b) => normalizeDate(a.delivery_date).localeCompare(normalizeDate(b.delivery_date)));
      });
    });

    return unsubscribe;
  }, []);

  const grouped = useMemo(() => classifyOrders(orders), [orders]);

  const handleStatusChange = async (id, fulfilment_status) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    await base44.entities.MemberOrder.update(id, { fulfilment_status });
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ background: "#0b0e11", minHeight: "100%" }}>
      <PageHeader title="Dispatch Manifest" subtitle="Live MemberOrder manifest grouped by dispatch priority">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={countBadgeStyle}>{grouped.activeOrders.length} Active</span>
          <button onClick={() => loadOrders(true)} style={refreshButtonStyle}>
            <RefreshCcw size={14} style={{ animation: refreshing ? "spin 0.9s linear infinite" : "none" }} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </PageHeader>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <DispatchSection title={sectionConfigs.overdue.title} borderColor={sectionConfigs.overdue.borderColor} orders={grouped.overdue} onStatusChange={handleStatusChange} />
        <DispatchSection title={sectionConfigs.today.title} borderColor={sectionConfigs.today.borderColor} orders={grouped.today} onStatusChange={handleStatusChange} />
        <DispatchSection title={sectionConfigs.upcoming.title} borderColor={sectionConfigs.upcoming.borderColor} orders={grouped.upcoming} onStatusChange={handleStatusChange} />
        <DispatchSection title={sectionConfigs.unscheduled.title} borderColor={sectionConfigs.unscheduled.borderColor} orders={grouped.unscheduled} onStatusChange={handleStatusChange} />

        {grouped.activeOrders.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "rgba(201,168,76,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
              No Active Dispatches
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.35)", marginTop: "10px" }}>
              There are no active MemberOrder records to dispatch right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}