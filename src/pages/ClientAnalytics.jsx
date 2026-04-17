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
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientName, setSelectedClientName] = useState(null);

  useEffect(() => {
    base44.entities.CustomerNote.list("-updated_date", 500).then((noteData) => {
      setNotes(noteData || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = base44.entities.CustomerNote.subscribe((event) => {
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

    return unsubscribe;
  }, []);

  const clients = useMemo(() => {
    const grouped = notes.reduce((acc, note) => {
      const name = (note.client_name || "Unknown Client").trim();
      if (!name) return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push(note);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([client_name, clientNotes]) => {
        const sortedNotes = [...clientNotes].sort((a, b) => moment(a.delivery_date || a.last_order_date || a.updated_date || a.created_date).valueOf() - moment(b.delivery_date || b.last_order_date || b.updated_date || b.created_date).valueOf());
        const completedLikeNotes = sortedNotes.filter((note) => Number(note.order_total || 0) > 0);
        const orderCount = completedLikeNotes.length;
        const totalSpend = completedLikeNotes.reduce((sum, note) => sum + Number(note.order_total || 0), 0);
        const outstandingBalance = sortedNotes
          .filter((note) => ["CASH", "PENDING"].includes(String(note.payment_status || "").toUpperCase()))
          .reduce((sum, note) => sum + Number(note.order_total || 0), 0);
        const averageOrderValue = orderCount ? Math.round(totalSpend / orderCount) : 0;
        const firstOrderDate = sortedNotes[0]?.delivery_date || sortedNotes[0]?.last_order_date || sortedNotes[0]?.created_date;
        const lastOrderDate = sortedNotes[sortedNotes.length - 1]?.delivery_date || sortedNotes[sortedNotes.length - 1]?.last_order_date || sortedNotes[sortedNotes.length - 1]?.updated_date;
        const monthsActive = firstOrderDate && lastOrderDate ? Math.max(moment(lastOrderDate).diff(moment(firstOrderDate), "months", true), 1) : 1;
        const monthlyRate = Number((orderCount / monthsActive).toFixed(1));
        const daysSinceLastOrder = lastOrderDate ? moment().diff(moment(lastOrderDate), "days") : 0;
        const lastContactDate = sortedNotes[sortedNotes.length - 1]?.updated_date || sortedNotes[sortedNotes.length - 1]?.created_date || null;
        const spendSeriesMap = completedLikeNotes.reduce((acc, note) => {
          const key = moment(note.delivery_date || note.last_order_date || note.created_date).startOf("month").format("MMM YYYY");
          acc[key] = (acc[key] || 0) + Number(note.order_total || 0);
          return acc;
        }, {});
        const spendSeries = Object.entries(spendSeriesMap).map(([label, spend]) => ({ label, spend }));
        const needsAttention = sortedNotes.some((note) => (
          String(note.fulfilment_status || "") === "Active" &&
          note.delivery_date &&
          moment(note.delivery_date).isBefore(moment().subtract(48, "hours"))
        ));

        return {
          client_name,
          orders: [...sortedNotes].sort((a, b) => moment(b.delivery_date || b.last_order_date || b.updated_date || b.created_date).valueOf() - moment(a.delivery_date || a.last_order_date || a.updated_date || a.created_date).valueOf()),
          orderCount,
          totalSpend,
          outstandingBalance,
          averageOrderValue,
          purchaseFrequency: monthlyRate,
          purchaseFrequencyLabel: `${monthlyRate}/mo`,
          firstOrderDate,
          lastOrderDate,
          lastContactDate,
          daysSinceLastOrder,
          needsFollowUp: daysSinceLastOrder > 30,
          needsAttention,
          spendSeries,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [notes]);

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