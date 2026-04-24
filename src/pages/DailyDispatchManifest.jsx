import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import DispatchIssuePanel from "../components/orders/DispatchIssuePanel";
import MemberOrderDispatchCards from "../components/orders/MemberOrderDispatchCards";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function DailyDispatchManifest() {
  const [manifestOrders, setManifestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const orders = await base44.entities.MemberOrder.list("delivery_date", 300);
      setManifestOrders((orders || []).filter((order) => order.fulfilment_status === "Active" && order.delivery_date));
      setLoading(false);
    };

    load();

    const unsubscribe = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "delete") {
        setManifestOrders((prev) => prev.filter((order) => order.id !== event.id));
        return;
      }

      const nextOrder = event.data;
      const shouldShow = nextOrder.fulfilment_status === "Active" && nextOrder.delivery_date;
      setManifestOrders((prev) => {
        const filtered = prev.filter((order) => order.id !== nextOrder.id);
        return shouldShow ? [...filtered, nextOrder].sort((a, b) => String(a.delivery_date).localeCompare(String(b.delivery_date))) : filtered;
      });
    });

    return unsubscribe;
  }, []);

  const handleStatusChange = async (id, fulfilment_status) => {
    await base44.entities.MemberOrder.update(id, { fulfilment_status });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Dispatch Manifest" subtitle="Live manifest generated from member orders" />

      {manifestOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)", marginBottom: "28px" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Active Dispatches</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>There are no active member orders with a delivery date.</p>
        </div>
      ) : (
        <MemberOrderDispatchCards orders={manifestOrders} onStatusChange={handleStatusChange} />
      )}

      <DispatchIssuePanel />
    </div>
  );
}