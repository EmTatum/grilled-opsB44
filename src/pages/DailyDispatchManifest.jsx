import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import MemberOrderDispatchCards from "../components/orders/MemberOrderDispatchCards";
import DispatchIssuePanel from "../components/orders/DispatchIssuePanel";
import { getDatePart, getTodayKey, sortByDeliveryDateAscNullsLast } from "../components/member-orders/memberOrderUtils";
import { buildDispatchDiscrepancies } from "../utils/dispatchReconciliation";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const sectionConfigs = {
  overdue: { title: "Overdue", borderColor: "#8d201c" },
  today: { title: "Today", borderColor: "#d29c6c" },
  upcoming: { title: "Upcoming", borderColor: "#15434a" },
  unscheduled: { title: "Unscheduled", borderColor: "rgba(255,255,255,0.22)" },
};

const confirmationPriority = {
  PAID: 0,
  CASH: 1,
  PENDING: 2,
};

function getDeliveryTimeValue(deliveryDate) {
  const raw = String(deliveryDate || "").trim();
  if (!raw.includes("T")) return Number.POSITIVE_INFINITY;
  const [, timePart = ""] = raw.split("T");
  const [hours = "99", minutes = "99"] = timePart.slice(0, 5).split(":");
  return (Number(hours) * 60) + Number(minutes);
}

function sortDispatchOrders(orders) {
  return [...orders].sort((a, b) => {
    const timeDifference = getDeliveryTimeValue(a.delivery_date) - getDeliveryTimeValue(b.delivery_date);
    if (timeDifference !== 0) return timeDifference;

    const priorityDifference = (confirmationPriority[a.payment_status] ?? 99) - (confirmationPriority[b.payment_status] ?? 99);
    if (priorityDifference !== 0) return priorityDifference;

    return String(a.client_name || "").localeCompare(String(b.client_name || ""));
  });
}

function DispatchSection({ title, borderColor, orders, onStatusChange }) {
  if (!orders.length) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</p>
        <div style={{ flex: 1, height: "1px", background: borderColor }} />
      </div>
      <MemberOrderDispatchCards orders={orders} onStatusChange={onStatusChange} sectionBorderColor={borderColor} />
    </section>
  );
}

export default function DailyDispatchManifest() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [records, stockRecords] = await Promise.all([
        base44.entities.MemberOrder.filter({ fulfilment_status: "Active" }, "delivery_date", 500),
        base44.entities.Product.list("product_name", 500)
      ]);
      setOrders(sortByDeliveryDateAscNullsLast(records || []));
      setProducts(stockRecords || []);
      setLoading(false);
    };

    load();

    const unsubscribeOrders = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "delete") {
        setOrders((prev) => prev.filter((item) => item.id !== event.id));
        return;
      }

      const next = event.data;
      setOrders((prev) => sortByDeliveryDateAscNullsLast([
        ...prev.filter((item) => item.id !== next.id),
        ...(next.fulfilment_status === "Active" ? [next] : []),
      ]));
    });

    const unsubscribeProducts = base44.entities.Product.subscribe((event) => {
      if (event.type === "delete") {
        setProducts((prev) => prev.filter((item) => item.id !== event.id));
        return;
      }

      setProducts((prev) => {
        const next = event.data;
        return [...prev.filter((item) => item.id !== next.id), next].sort((a, b) => String(a.product_name || '').localeCompare(String(b.product_name || '')));
      });
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const grouped = useMemo(() => {
    const todayKey = getTodayKey();
    return {
      overdue: sortDispatchOrders(orders.filter((order) => {
        const date = getDatePart(order.delivery_date);
        return date && date < todayKey;
      })),
      today: sortDispatchOrders(orders.filter((order) => getDatePart(order.delivery_date) === todayKey)),
      upcoming: sortDispatchOrders(orders.filter((order) => {
        const date = getDatePart(order.delivery_date);
        return date && date > todayKey;
      })),
      unscheduled: sortDispatchOrders(orders.filter((order) => !String(order.delivery_date || "").trim())),
    };
  }, [orders]);

  const discrepancies = useMemo(() => buildDispatchDiscrepancies(orders, products), [orders, products]);

  const handleStatusChange = async (id, fulfilment_status) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
    await base44.entities.MemberOrder.update(id, { fulfilment_status });
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Dispatch Manifest" subtitle="Live active dispatches from MemberOrder" />

      <DispatchIssuePanel discrepancies={discrepancies} />

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>No active dispatches.</p>
        </div>
      ) : (
        <>
          <DispatchSection title={sectionConfigs.overdue.title} borderColor={sectionConfigs.overdue.borderColor} orders={grouped.overdue} onStatusChange={handleStatusChange} />
          <DispatchSection title={sectionConfigs.today.title} borderColor={sectionConfigs.today.borderColor} orders={grouped.today} onStatusChange={handleStatusChange} />
          <DispatchSection title={sectionConfigs.upcoming.title} borderColor={sectionConfigs.upcoming.borderColor} orders={grouped.upcoming} onStatusChange={handleStatusChange} />
          <DispatchSection title={sectionConfigs.unscheduled.title} borderColor={sectionConfigs.unscheduled.borderColor} orders={grouped.unscheduled} onStatusChange={handleStatusChange} />
        </>
      )}
    </div>
  );
}