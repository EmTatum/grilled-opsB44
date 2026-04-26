import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import TodaysOrdersWidget from "../components/orders/TodaysOrdersWidget";
import DispatchIssuePanel from "../components/orders/DispatchIssuePanel";
import { getDatePart, getTodayKey, sortByDeliveryDateAscNullsLast } from "../components/member-orders/memberOrderUtils";
import { buildDispatchDiscrepancies } from "../utils/dispatchReconciliation";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);


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

  const todaysOrders = useMemo(() => {
    const todayKey = getTodayKey();
    return orders.filter((order) => getDatePart(order.delivery_date) === todayKey);
  }, [orders]);

  const paidOrders = useMemo(() => todaysOrders.filter((order) => order.payment_status === "PAID"), [todaysOrders]);
  const cashOrders = useMemo(() => todaysOrders.filter((order) => order.payment_status === "CASH"), [todaysOrders]);

  const discrepancies = useMemo(() => buildDispatchDiscrepancies(orders, products), [orders, products]);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <PageHeader title="Dispatch Manifest" subtitle="Today’s paid and cash-confirmed orders from Member Intelligence." />

      <TodaysOrdersWidget paidOrders={paidOrders} cashOrders={cashOrders} />

      <DispatchIssuePanel discrepancies={discrepancies} />
    </div>
  );
}