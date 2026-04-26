import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MemberIntelligenceCard from "./MemberIntelligenceCard";
import { sortByDeliveryDate } from "./memberIntelligenceUtils";

export default function ActiveMemberIntelligenceSummary({ notesById, refreshKey, onFulfilled, onCancelled, onViewReport, onSaveEdit, onSaveFollowUp, onConfirmStatus }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmedPayments, setConfirmedPayments] = useState({});

  const loadActiveOrders = async () => {
    const records = await base44.entities.MemberOrder.filter({ fulfilment_status: "Active" }, "delivery_date", 300);
    setOrders(sortByDeliveryDate(records || []));
    setLoading(false);
  };

  useEffect(() => {
    loadActiveOrders();
  }, [refreshKey]);

  useEffect(() => {
    const unsubscribe = base44.entities.MemberOrder.subscribe(() => {
      loadActiveOrders();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshKey]);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Active Member Intelligence Summary</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{orders.length} active orders with dispatch-critical details, checklist order lines, and report access.</p>
      </div>

      {!loading && orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>No active orders. Generate a report above to get started.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {orders.map((order) => (
            <MemberIntelligenceCard
              key={order.id}
              order={order}
              note={notesById[order.intelligence_report_id] || null}
              confirmedPayment={confirmedPayments[order.id]}
              setConfirmedPayments={setConfirmedPayments}
              onFulfilled={onFulfilled}
              onCancelled={onCancelled}
              onViewReport={onViewReport}
              onSaveEdit={onSaveEdit}
              onSaveFollowUp={onSaveFollowUp}
              onConfirmStatus={onConfirmStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}