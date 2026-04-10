import { useEffect, useState } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import DispatchManifestTable from "../components/orders/DispatchManifestTable";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function DailyDispatchManifest() {
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.list("order_date", 300).then((data) => {
      const activeOrders = data
        .filter((order) => order.status !== "Cancelled")
        .sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());

      setTodaysOrders(activeOrders.filter((order) => moment(order.order_date).isSame(moment(), "day")));
      setUpcomingOrders(activeOrders.filter((order) => moment(order.order_date).isAfter(moment(), "day")));
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Daily Dispatch Manifest" subtitle="Printable final-packaging sheet for all orders scheduled today and upcoming dispatches" />

      {todaysOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)", marginBottom: "28px" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Dispatches Today</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>Today has no active scheduled orders.</p>
        </div>
      ) : (
        <div style={{ marginBottom: "28px" }}>
          <DispatchManifestTable
            orders={todaysOrders}
            title="Daily Dispatch Manifest"
            subtitle={moment().format("dddd, D MMMM YYYY")}
            showPrintButton={true}
          />
        </div>
      )}

      {upcomingOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Upcoming Dispatches</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>There are no remaining active scheduled orders after today.</p>
        </div>
      ) : (
        <DispatchManifestTable
          orders={upcomingOrders}
          title="Upcoming Dispatch Manifest"
          subtitle="All remaining active scheduled orders"
          showDateAboveTime={true}
        />
      )}
    </div>
  );
}