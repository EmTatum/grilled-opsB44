import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import ClientAnalyticsList from "../components/client-analytics/ClientAnalyticsList";
import ClientDetailPanel from "../components/client-analytics/ClientDetailPanel";
import MemberAnalyticsOverview from "../components/client-analytics/MemberAnalyticsOverview";
import { cleanClientName, isValidClientName } from "../components/notes/memberIntelligenceUtils";

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
      const name = cleanClientName(note.client_name || "");
      if (!isValidClientName(name)) return acc;
      if (String(note.fulfilment_status || "") === "Cancelled") return acc;
      if (!acc[name]) acc[name] = [];
      acc[name].push({ ...note, client_name: name });
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

  const analyticsOverview = useMemo(() => {
    const monthMap = notes.reduce((acc, note) => {
      const clientName = cleanClientName(note.client_name || "");
      if (!isValidClientName(clientName)) return acc;
      if (String(note.fulfilment_status || "") === "Cancelled") return acc;

      const monthKey = moment(note.delivery_date || note.last_order_date || note.updated_date || note.created_date).startOf("month").format("YYYY-MM");
      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: moment(monthKey, "YYYY-MM").format("MMM YYYY"),
          revenue: 0,
          activeMembers: new Set(),
          premiumOrders: 0,
          premiumBuyers: new Set()
        };
      }

      acc[monthKey].revenue += Number(note.order_total || 0);
      acc[monthKey].activeMembers.add(clientName);

      const orderList = String(note.order_list || note.content || "").toLowerCase();
      if (/(bud|changa|mushroom|ketamine|ecstasy|acid|dougies|cola|md|xannie|zolpidiem)/i.test(orderList)) {
        acc[monthKey].premiumOrders += 1;
        acc[monthKey].premiumBuyers.add(clientName);
      }

      return acc;
    }, {});

    const sortedMonths = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value], index, array) => {
        const previous = index > 0 ? array[index - 1][1] : null;
        const retentionBase = previous ? previous.activeMembers : null;
        const retainedCount = retentionBase ? Array.from(value.activeMembers).filter((member) => retentionBase.has(member)).length : 0;
        const retentionRate = retentionBase && retentionBase.size > 0 ? Number(((retainedCount / retentionBase.size) * 100).toFixed(1)) : 0;
        const monthlyActiveUsers = value.activeMembers.size;
        const purchaseFrequency = monthlyActiveUsers > 0 ? Number((value.premiumOrders / monthlyActiveUsers).toFixed(2)) : 0;

        return {
          key,
          label: value.label,
          revenue: value.revenue,
          retentionRate,
          monthlyActiveUsers,
          purchaseFrequency
        };
      });

    const latest = sortedMonths[sortedMonths.length - 1] || { revenue: 0, retentionRate: 0, monthlyActiveUsers: 0, purchaseFrequency: 0 };
    const previous = sortedMonths[sortedMonths.length - 2] || { revenue: 0 };
    const growth = previous.revenue > 0 ? Number((((latest.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)) : 0;

    return {
      summary: {
        revenueGrowthLabel: `${growth >= 0 ? "+" : ""}${growth}%`,
        retentionRateLabel: `${latest.retentionRate}%`,
        latestMonthlyActiveUsers: latest.monthlyActiveUsers,
        averagePurchaseFrequencyLabel: `${latest.purchaseFrequency}x`
      },
      revenueTrend: sortedMonths.map((month) => ({ label: month.label, value: month.revenue })),
      retentionTrend: sortedMonths.map((month) => ({ label: month.label, value: month.retentionRate })),
      monthlyActiveUsersTrend: sortedMonths.map((month) => ({ label: month.label, value: month.monthlyActiveUsers })),
      purchaseFrequencyTrend: sortedMonths.map((month) => ({ label: month.label, value: month.purchaseFrequency }))
    };
  }, [notes]);

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
          <MemberAnalyticsOverview
            summary={analyticsOverview.summary}
            revenueTrend={analyticsOverview.revenueTrend}
            retentionTrend={analyticsOverview.retentionTrend}
            monthlyActiveUsersTrend={analyticsOverview.monthlyActiveUsersTrend}
            purchaseFrequencyTrend={analyticsOverview.purchaseFrequencyTrend}
          />
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