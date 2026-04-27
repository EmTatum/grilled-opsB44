import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const statCardStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.3)",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minHeight: "132px",
  justifyContent: "space-between"
};

const sectionCardStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const paymentBadgeStyles = {
  PAID: { background: "rgba(22,163,74,0.14)", border: "1px solid rgba(22,163,74,0.5)", color: "#16a34a" },
  CASH: { background: "rgba(141,32,28,0.14)", border: "1px solid rgba(141,32,28,0.5)", color: "#8d201c" },
  PENDING: { background: "rgba(210,156,108,0.14)", border: "1px solid rgba(210,156,108,0.5)", color: "#d29c6c" }
};

const fulfilmentBadgeStyles = {
  Active: { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C" },
  Fulfilled: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.75)" },
  Cancelled: { background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B" }
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

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>{label}</p>
      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "32px", color: "#C9A84C", fontWeight: 600, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function Badge({ value, styles }) {
  const style = styles[value] || styles.PENDING || styles.Active;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {value || "Unknown"}
    </span>
  );
}

function UpcomingDeliveries({ orders }) {
  return (
    <section style={sectionCardStyle}>
      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Upcoming Deliveries</p>
      {orders.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No upcoming deliveries scheduled.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "16px", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
                <Badge value={order.payment_status || "PENDING"} styles={paymentBadgeStyles} />
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

function RecentActivity({ orders }) {
  return (
    <section style={sectionCardStyle}>
      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Activity</p>
      <div style={{ display: "grid", gap: "10px" }}>
        {orders.map((order) => (
          <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "14px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>{formatCurrency(order.order_total)}</p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Badge value={order.fulfilment_status || "Active"} styles={fulfilmentBadgeStyles} />
              <Badge value={order.payment_status || "PENDING"} styles={paymentBadgeStyles} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
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

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => order.fulfilment_status === "Active");
    const fulfilledOrders = orders.filter((order) => order.fulfilment_status === "Fulfilled");
    const todaysDeliveries = orders.filter((order) => getDatePart(order.delivery_date) === today);
    const paymentCounts = {
      PAID: orders.filter((order) => order.payment_status === "PAID").length,
      CASH: orders.filter((order) => order.payment_status === "CASH").length,
      PENDING: orders.filter((order) => order.payment_status === "PENDING").length
    };

    const upcoming = activeOrders
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart >= today;
      })
      .sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")));

    const recent = [...orders]
      .sort((a, b) => String(b.updated_date || "").localeCompare(String(a.updated_date || "")))
      .slice(0, 5);

    return {
      activeCount: activeOrders.length,
      todaysDeliveries: todaysDeliveries.length,
      totalFulfilled: fulfilledOrders.length,
      totalRevenue: fulfilledOrders.reduce((sum, order) => sum + Number(order.order_total || 0), 0),
      paymentCounts,
      upcoming,
      recent
    };
  }, [orders, today]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Dashboard" subtitle="Live MemberOrder operations overview with delivery, payment, and fulfilment activity." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label="Active Orders" value={metrics.activeCount} />
        <StatCard label="Today&apos;s Deliveries" value={metrics.todaysDeliveries} />
        <StatCard label="Total Fulfilled" value={metrics.totalFulfilled} />
        <StatCard label="Total Revenue" value={formatCurrency(metrics.totalRevenue)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard label="Paid Orders" value={metrics.paymentCounts.PAID} />
        <StatCard label="Cash Orders" value={metrics.paymentCounts.CASH} />
        <StatCard label="Pending Payment" value={metrics.paymentCounts.PENDING} />
      </div>

      <UpcomingDeliveries orders={metrics.upcoming} />
      <RecentActivity orders={metrics.recent} />
    </div>
  );
}