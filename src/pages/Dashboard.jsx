import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import DashboardStatCard from "../components/member-orders/DashboardStatCard.jsx";
import OrdersByPaymentStatus from "../components/member-orders/OrdersByPaymentStatus.jsx";
import TodaysOrdersList from "../components/member-orders/TodaysOrdersList.jsx";
import { getDatePart, getTodayKey, sortByDeliveryDateAscNullsLast } from "../components/member-orders/memberOrderUtils";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const records = await base44.entities.MemberOrder.list("delivery_date", 500);
      if (!isMounted) return;
      setOrders(sortByDeliveryDateAscNullsLast(records || []));
      setLoading(false);
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((item) => item.id !== event.id));
        return;
      }

      const nextRecord = event.data;
      setOrders((prev) => sortByDeliveryDateAscNullsLast([
        ...prev.filter((item) => item.id !== nextRecord.id),
        nextRecord,
      ]));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const todayKey = getTodayKey();

  const metrics = useMemo(() => {
    const active = orders.filter((order) => order.fulfilment_status === "Active");
    const fulfilled = orders.filter((order) => order.fulfilment_status === "Fulfilled");
    const paymentCounts = orders.reduce((acc, order) => {
      const key = order.payment_status || "PENDING";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, { PAID: 0, CASH: 0, PENDING: 0 });

    return {
      activeCount: active.length,
      fulfilledCount: fulfilled.length,
      revenue: fulfilled.reduce((sum, order) => sum + Number(order.order_total || 0), 0),
      paymentCounts,
      todaysDeliveries: orders.filter((order) => getDatePart(order.delivery_date) === todayKey).length,
      upcomingDeliveries: orders.filter((order) => {
        const date = getDatePart(order.delivery_date);
        return date && date > todayKey;
      }).length,
      todayOrders: orders.filter((order) => getDatePart(order.delivery_date) === todayKey),
    };
  }, [orders, todayKey]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Dashboard" subtitle={`Live MemberOrder overview · ${moment().format("D MMMM YYYY")}`} />

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>No MemberOrder records yet.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <DashboardStatCard label="Total Active Orders" value={metrics.activeCount} />
            <DashboardStatCard label="Total Fulfilled Orders" value={metrics.fulfilledCount} accent="rgba(245,240,232,0.8)" />
            <DashboardStatCard label="Total Revenue" value={`R${metrics.revenue.toLocaleString("en-ZA")}`} />
            <DashboardStatCard label="Today&apos;s Deliveries" value={metrics.todaysDeliveries} />
            <DashboardStatCard label="Upcoming Deliveries" value={metrics.upcomingDeliveries} accent="#15434a" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-md:!grid-cols-1">
            <OrdersByPaymentStatus counts={metrics.paymentCounts} />
            <TodaysOrdersList orders={metrics.todayOrders} emptyMessage="No deliveries scheduled for today." />
          </div>
        </>
      )}
    </div>
  );
}