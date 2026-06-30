import { useMemo, useEffect } from "react";
import { useEntityList } from "@/hooks/useEntityList";
import moment from "moment";
import { syncInventoryFromFulfilledOrders } from "@/functions/syncInventoryFromFulfilledOrders";
import { CalendarDays, AlertTriangle, Package, Banknote, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import PageHeader from "../components/PageHeader";
import Spinner from "../components/Spinner";
import StatusPill, { PAYMENT_BADGE_STYLES } from "../components/StatusPill";
import DailyPerformanceCharts from "../components/dashboard/DailyPerformanceCharts";
import { cleanClientName, isVisibleOrderRecord } from "../components/notes/memberIntelligenceUtils";
import { formatCurrency, getDatePart, formatDeliveryDate } from "../utils/formatting";

const widgetGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px"
};

const sectionCardStyle = {
  background: "var(--color-surface)",
  border: "1px solid rgba(201,168,76,0.3)",
  padding: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  borderRadius: "2px"
};



function WidgetShell({ title, icon: IconComponent, accentBorder = sectionCardStyle.border, badge, children, fullWidth = false }) {
  return (
    <section style={{ ...sectionCardStyle, border: accentBorder, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <IconComponent size={16} color="#C9A84C" />
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</p>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

function NextDeliveriesWidget({ orders }) {
  return (
    <WidgetShell title="Next Deliveries" icon={CalendarDays} fullWidth>
      {orders.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No upcoming deliveries.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "14px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "grid", gap: "4px" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>{formatDeliveryDate(order.delivery_date)}</p>
              </div>
              <StatusPill value={order.payment_status || "PENDING"} styleMap={PAYMENT_BADGE_STYLES} />
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function ActionRequiredWidget({ items }) {
  const badge = (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid rgba(194,24,91,0.4)", background: "rgba(194,24,91,0.08)", color: "#C2185B", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {items.length}
    </span>
  );

  return (
    <WidgetShell title="Action Required" icon={AlertTriangle} accentBorder="1px solid rgba(194,24,91,0.35)" badge={badge}>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "#16a34a" }}>All clear — nothing needs attention.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {items.map((order) => (
            <div key={order.id} style={{ background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.22)", padding: "14px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "#F5F0E8" }}>{cleanClientName(order.client_name)}</p>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid rgba(201,168,76,0.45)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
                {order.actionReason}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function LowStockWidget({ products }) {
  const badge = (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid rgba(201,168,76,0.45)", background: "rgba(201,168,76,0.1)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px" }}>
      {products.length}
    </span>
  );

  return (
    <WidgetShell title="Low Stock" icon={Package} accentBorder="1px solid rgba(201,168,76,0.35)" badge={badge}>
      {products.length === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "#16a34a" }}>All products well stocked.</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {products.map((product) => (
            <div key={product.id} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.16)", padding: "14px", display: "grid", gap: "4px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "#F5F0E8" }}>{product.product_name || "Unnamed Product"}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "#C2185B" }}>Stock: {Number(product.current_stock || 0)}</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>Threshold: {Number(product.low_stock_threshold || 0)}</p>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function WeeklyRevenueWidget({ thisWeekRevenue, lastWeekRevenue }) {
  const TrendIcon = thisWeekRevenue > lastWeekRevenue ? TrendingUp : thisWeekRevenue < lastWeekRevenue ? TrendingDown : Minus;
  const trendColor = thisWeekRevenue > lastWeekRevenue ? "var(--color-teal)" : thisWeekRevenue < lastWeekRevenue ? "var(--color-rose)" : "rgba(245,240,232,0.55)";

  return (
    <WidgetShell title="Weekly Revenue" icon={CalendarDays}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>{formatCurrency(thisWeekRevenue)}</p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>{formatCurrency(lastWeekRevenue)} last week</p>
        </div>
        <TrendIcon size={22} color={trendColor} />
      </div>
    </WidgetShell>
  );
}

function CashToCollectWidget({ total, count }) {
  return (
    <WidgetShell title="Cash to Collect" icon={Banknote} accentBorder="1px solid rgba(201,168,76,0.35)">
      {count === 0 ? (
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>No cash outstanding.</p>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, color: "#C9A84C", lineHeight: 1 }}>{formatCurrency(total)}</p>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>{count} cash order(s) outstanding</p>
        </div>
      )}
    </WidgetShell>
  );
}

function BreakdownLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) {
  if (!value) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  return (
    <text x={x} y={y} fill="#F5F0E8" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600 }}>
      {`${value} (${Math.round(percent * 100)}%)`}
    </text>
  );
}

function OrderBreakdownWidget({ data }) {
  const colors = ["var(--color-gold)", "var(--color-teal)", "var(--color-rose)"];
  return (
    <WidgetShell title="Order Breakdown" icon={Package}>
      <div style={{ width: "100%", height: "220px" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} labelLine={false} label={BreakdownLabel}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#111111", border: "1px solid rgba(201,168,76,0.24)", borderRadius: "2px", color: "#F5F0E8" }}
              formatter={(value, name) => [`${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {data.map((item, index) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", background: colors[index], display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.7)" }}>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

export default function Dashboard() {
  const { data: orders, loading: loadingOrders } = useEntityList("MemberOrder", "-updated_date", 1000);
  const { data: products, loading: loadingProducts } = useEntityList("Product", "product_name", 1000);

  useEffect(() => {
    syncInventoryFromFulfilledOrders({});
  }, []);

  const today = moment().format("YYYY-MM-DD");

  const metrics = useMemo(() => {
    const visibleOrders = orders.filter(isVisibleOrderRecord);
    const activeOrders = visibleOrders.filter((order) => order.fulfilment_status === "Active");
    const fulfilledOrders = visibleOrders.filter((order) => order.fulfilment_status === "Fulfilled");
    const cancelledOrders = visibleOrders.filter((order) => order.fulfilment_status === "Cancelled");

    const nextDeliveries = [...visibleOrders]
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && datePart >= today;
      })
      .sort((a, b) => String(a.delivery_date || "").localeCompare(String(b.delivery_date || "")))
      .slice(0, 5);

    const actionRequired = [...visibleOrders]
      .filter((order) => order.payment_status === "PENDING" || !String(order.delivery_date || "").trim())
      .map((order) => ({
        ...order,
        actionReason: order.payment_status === "PENDING" ? "Payment pending" : "No delivery date set"
      }))
      .sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));

    const lowStock = [...products]
      .filter((product) => Number(product.current_stock || 0) <= Number(product.low_stock_threshold || 0))
      .sort((a, b) => Number(a.current_stock || 0) - Number(b.current_stock || 0));

    const weekStart = moment(today).startOf("isoWeek");
    const lastWeekStart = weekStart.clone().subtract(1, "week");
    const lastWeekEnd = weekStart.clone().subtract(1, "day");
    const weeklyPerformance = Array.from({ length: 7 }, (_, index) => {
      const date = weekStart.clone().add(index, "days");
      const dateKey = date.format("YYYY-MM-DD");
      const dayOrders = visibleOrders.filter((order) => String(order.delivery_date || "").startsWith(dateKey));
      const revenue = dayOrders.reduce((sum, order) => sum + Number(order.order_total || 0), 0);

      return {
        date: dateKey,
        label: date.format("ddd"),
        orders: dayOrders.length,
        revenue,
        revenueLabel: `R${Number(revenue || 0).toLocaleString("en-ZA")}`
      };
    });

    const thisWeekRevenue = visibleOrders
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && moment(datePart).isBetween(weekStart, weekStart.clone().endOf("isoWeek"), "day", "[]");
      })
      .reduce((sum, order) => sum + Number(order.order_total || 0), 0);

    const lastWeekRevenue = visibleOrders
      .filter((order) => {
        const datePart = getDatePart(order.delivery_date);
        return datePart && moment(datePart).isBetween(lastWeekStart, lastWeekEnd, "day", "[]");
      })
      .reduce((sum, order) => sum + Number(order.order_total || 0), 0);

    const outstandingCashOrders = visibleOrders.filter((order) => order.payment_status === "CASH" && order.fulfilment_status === "Active");
    const outstandingCashTotal = outstandingCashOrders.reduce((sum, order) => sum + Number(order.order_total || 0), 0);

    const orderBreakdown = [
      { name: "Active", value: activeOrders.length },
      { name: "Fulfilled", value: fulfilledOrders.length },
      { name: "Cancelled", value: cancelledOrders.length }
    ];

    return {
      weeklyPerformance,
      nextDeliveries,
      actionRequired,
      lowStock,
      thisWeekRevenue,
      lastWeekRevenue,
      outstandingCashTotal,
      outstandingCashCount: outstandingCashOrders.length,
      orderBreakdown
    };
  }, [orders, products, today]);

  if (loadingOrders || loadingProducts) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      <PageHeader title="Dashboard" subtitle="Live MemberOrder operations overview with delivery, payment, and fulfilment activity." />

      <DailyPerformanceCharts data={metrics.weeklyPerformance} />

      <div style={widgetGridStyle}>
        <NextDeliveriesWidget orders={metrics.nextDeliveries} />
        <ActionRequiredWidget items={metrics.actionRequired} />
        <LowStockWidget products={metrics.lowStock} />
        <WeeklyRevenueWidget thisWeekRevenue={metrics.thisWeekRevenue} lastWeekRevenue={metrics.lastWeekRevenue} />
        <CashToCollectWidget total={metrics.outstandingCashTotal} count={metrics.outstandingCashCount} />
        <OrderBreakdownWidget data={metrics.orderBreakdown} />
      </div>
    </div>
  );
}