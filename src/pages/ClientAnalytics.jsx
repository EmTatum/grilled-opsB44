import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import ClientAnalyticsList from "../components/client-analytics/ClientAnalyticsList";
import ClientDetailPanel from "../components/client-analytics/ClientDetailPanel";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function ClientAnalytics() {
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientName, setSelectedClientName] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-order_date", 500),
      base44.entities.CustomerNote.list("-created_date", 500),
    ]).then(([orderData, noteData]) => {
      setOrders(orderData || []);
      setNotes(noteData || []);
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
        const clientNotes = notes
          .filter((note) => (note.client_name || "").trim() === client_name)
          .sort((a, b) => moment(b.created_date).valueOf() - moment(a.created_date).valueOf());
        const orderCount = sortedOrders.length;
        const totalSpend = sortedOrders.reduce((sum, order) => sum + Number(order.order_value || 0), 0);
        const averageOrderValue = orderCount ? Math.round(totalSpend / orderCount) : 0;
        const firstOrderDate = sortedOrders[0]?.order_date;
        const lastOrderDate = sortedOrders[orderCount - 1]?.order_date;
        const monthsActive = Math.max(moment(lastOrderDate).diff(moment(firstOrderDate), "months", true), 1);
        const monthlyRate = Number((orderCount / monthsActive).toFixed(1));
        const daysSinceLastOrder = lastOrderDate ? moment().diff(moment(lastOrderDate), "days") : 0;
        const lastContactDate = clientNotes[0]?.created_date || null;
        const spendSeriesMap = sortedOrders.reduce((acc, order) => {
          const key = moment(order.order_date).startOf("month").format("MMM YYYY");
          acc[key] = (acc[key] || 0) + Number(order.order_value || 0);
          return acc;
        }, {});
        const spendSeries = Object.entries(spendSeriesMap).map(([label, spend]) => ({ label, spend }));

        return {
          client_name,
          orders: [...sortedOrders].sort((a, b) => moment(b.order_date).valueOf() - moment(a.order_date).valueOf()),
          orderCount,
          totalSpend,
          averageOrderValue,
          purchaseFrequency: monthlyRate,
          purchaseFrequencyLabel: `${monthlyRate}/mo`,
          firstOrderDate,
          lastOrderDate,
          lastContactDate,
          daysSinceLastOrder,
          needsFollowUp: daysSinceLastOrder > 30,
          spendSeries,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders, notes]);

  useEffect(() => {
    if (!selectedClientName && clients.length > 0) {
      setSelectedClientName(clients[0].client_name);
    }
  }, [clients, selectedClientName]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.client_name === selectedClientName) || null,
    [clients, selectedClientName]
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Member Circle" subtitle="Monitor member value, order cadence, contact recency, and attention risk in one place" />

      {clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Client Data Yet</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>Create some orders to unlock analytics.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "22px" }}>
          <ClientAnalyticsList
            clients={clients}
            selectedClientName={selectedClientName}
            onSelectClient={setSelectedClientName}
          />
          <ClientDetailPanel client={selectedClient} />
        </div>
      )}
    </div>
  );
}