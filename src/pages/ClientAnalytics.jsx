import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import ClientAnalyticsCard from "../components/client-analytics/ClientAnalyticsCard";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const getSegment = ({ orderCount, totalSpend, daysSinceLastOrder }) => {
  if (orderCount >= 5 && totalSpend >= 5000 && daysSinceLastOrder <= 30) return "VIP";
  if (orderCount <= 2 && daysSinceLastOrder <= 30) return "New";
  if (daysSinceLastOrder > 45) return "At-Risk";
  return "Regular";
};

const getPriorityTag = (segment) => {
  if (segment === "VIP") return "High";
  if (segment === "At-Risk") return "Medium";
  return "Low";
};

export default function ClientAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.list("-order_date", 300).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const clients = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const name = (order.client_name || "Unknown Client").trim();
      if (!acc[name]) acc[name] = [];
      acc[name].push(order);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([client_name, clientOrders]) => {
        const sortedOrders = [...clientOrders].sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());
        const orderCount = sortedOrders.length;
        const totalSpend = sortedOrders.reduce((sum, order) => sum + Number(order.order_value || 0), 0);
        const averageOrderValue = orderCount ? Math.round(totalSpend / orderCount) : 0;
        const firstOrderDate = sortedOrders[0]?.order_date;
        const lastOrderDate = sortedOrders[orderCount - 1]?.order_date;
        const activeDays = Math.max(moment(lastOrderDate).diff(moment(firstOrderDate), "days"), 1);
        const monthlyRate = Number(((orderCount / activeDays) * 30).toFixed(1));
        const daysSinceLastOrder = lastOrderDate ? moment().diff(moment(lastOrderDate), "days") : 0;
        const segment = getSegment({ orderCount, totalSpend, daysSinceLastOrder });

        return {
          client_name,
          orderCount,
          totalSpend,
          averageOrderValue,
          purchaseFrequency: monthlyRate,
          purchaseFrequencyLabel: `${monthlyRate}/mo`,
          daysSinceLastOrder,
          segment,
          priorityTag: getPriorityTag(segment),
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Client Analytics" subtitle="Track client value, purchase rhythm, and retention segment at a glance" />

      {clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Client Data Yet</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>Create some orders to unlock analytics.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {clients.map((client) => (
            <ClientAnalyticsCard key={client.client_name} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}