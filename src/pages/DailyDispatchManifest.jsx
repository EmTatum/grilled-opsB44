import { useEffect, useState } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import DispatchManifestTable from "../components/orders/DispatchManifestTable";
import DispatchIssuePanel from "../components/orders/DispatchIssuePanel";
import { getReportDataFromTags, isIntelligenceReportNote, normalizePaymentStatus } from "../utils/customerNotes";
import { syncDispatchManifestOrders } from "@/functions/syncDispatchManifestOrders";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const buildReportMap = (notes) =>
  (notes || []).filter(isIntelligenceReportNote).reduce((acc, note) => {
    acc[note.id] = getReportDataFromTags(note.tags || []) || {};
    return acc;
  }, {});

const enhanceOrder = (order, reportData) => ({
  ...order,
  client_name: order.client_name || reportData.client_name || "Not recorded.",
  delivery_address: order.delivery_address || reportData.delivery_address || "Not recorded.",
  payment_method: order.payment_method || reportData.payment_method || "Other",
  payment_status: order.payment_status || normalizePaymentStatus(reportData.payment_status, order.payment_method || reportData.payment_method),
  order_details: order.order_details || reportData.order_list || "Not recorded.",
  status: order.status || "Pending",
});

const getManifestKey = (order) => order.source_report_id || order.id;

const getDeduplicatedManifestOrders = (orders) => {
  const latestOrders = new Map();

  (orders || []).forEach((order) => {
    const key = getManifestKey(order);
    const existing = latestOrders.get(key);

    if (!existing || moment(order.updated_date || order.created_date || order.order_date).valueOf() >= moment(existing.updated_date || existing.created_date || existing.order_date).valueOf()) {
      latestOrders.set(key, order);
    }
  });

  return Array.from(latestOrders.values());
};

export default function DailyDispatchManifest() {
  const [manifestOrders, setManifestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intelligenceReports = [];
    let ordersData = [];

    const rebuildManifest = () => {
      const reportMap = buildReportMap(intelligenceReports);
      const activeOrders = getDeduplicatedManifestOrders(ordersData || [])
        .filter((order) => order.status !== "Cancelled")
        .map((order) => enhanceOrder(order, reportMap[order.source_report_id] || {}))
        .filter((order) => moment(order.order_date).isValid() && (moment(order.order_date).isSame(moment(), "day") || moment(order.order_date).isAfter(moment(), "day")))
        .sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());

      setManifestOrders(activeOrders);
      setLoading(false);
    };

    Promise.all([
      base44.entities.Order.list("order_date", 300),
      base44.entities.CustomerNote.list("-updated_date", 300),
    ]).then(([orders, notes]) => {
      ordersData = orders || [];
      intelligenceReports = notes || [];
      rebuildManifest();
    });

    const unsubscribeOrders = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        ordersData = [event.data, ...ordersData.filter((order) => order.id !== event.data.id)];
      }
      if (event.type === "update") {
        ordersData = ordersData.map((order) => order.id === event.id ? event.data : order);
      }
      if (event.type === "delete") {
        ordersData = ordersData.filter((order) => order.id !== event.id);
      }
      rebuildManifest();
    });

    const unsubscribeNotes = base44.entities.CustomerNote.subscribe((event) => {
      if (event.type === "create") {
        intelligenceReports = [event.data, ...intelligenceReports.filter((note) => note.id !== event.data.id)];
        if (isIntelligenceReportNote(event.data)) {
          syncDispatchManifestOrders({ noteId: event.data.id });
        }
      }
      if (event.type === "update") {
        intelligenceReports = intelligenceReports.map((note) => note.id === event.id ? event.data : note);
        if (isIntelligenceReportNote(event.data)) {
          syncDispatchManifestOrders({ noteId: event.data.id });
        } else {
          ordersData = ordersData.filter((order) => order.source_report_id !== event.id);
        }
      }
      if (event.type === "delete") {
        intelligenceReports = intelligenceReports.filter((note) => note.id !== event.id);
        ordersData = ordersData.filter((order) => order.source_report_id !== event.id);
      }
      rebuildManifest();
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotes();
    };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Dispatch Manifest" subtitle="Live automated manifest generated from orders and client intelligence" />

      {manifestOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)", marginBottom: "28px" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Active Dispatches</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>The live manifest has no current active scheduled orders.</p>
        </div>
      ) : (
        <DispatchManifestTable
          orders={manifestOrders}
          title="Dispatch Manifest"
          subtitle="Current automated order feed"
          showPrintButton={true}
          showDateAboveTime={true}
        />
      )}

      <DispatchIssuePanel />
    </div>
  );
}