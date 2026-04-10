import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { ShoppingCart, Package, StickyNote, Clock, ArrowRight, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import IntelligenceCards from "../components/IntelligenceCards";
import StatusBadge from "../components/StatusBadge";
import RollingCalendarStrip from "../components/dashboard/RollingCalendarStrip";
import TodayOrdersCard from "../components/dashboard/TodayOrdersCard";
import ClientNotesDrawer from "../components/dashboard/ClientNotesDrawer";
import ThemeToneSwitch from "../components/dashboard/ThemeToneSwitch";
import OrderFormDialog from "../components/OrderFormDialog";
import { getRollingDays, isSameDay, toDayKey, getTodayKey } from "../lib/dashboardDateUtils";

const quickLinks = [
  { path: "/orders", label: "Upcoming Orders", desc: "Log and manage all pending and confirmed orders.", icon: ShoppingCart },
  { path: "/inventory", label: "Inventory", desc: "Track product stock counts and low-stock alerts.", icon: Package },
  { path: "/notes", label: "Client Notes", desc: "CRM notes, credits, debts, and client retention.", icon: StickyNote },
];

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const CornerBracket = ({ flip }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
    style={{ position: "absolute", ...(flip ? { bottom: 0, right: 0, transform: "rotate(180deg)" } : { top: 0, left: 0 }) }}>
    <path d="M2 26 L2 2 L26 2" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
    <path d="M2 10 L8 10 L8 2" stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.4" fill="none" />
  </svg>
);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [themeMode, setThemeMode] = useState("noir");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-created_date", 50),
      base44.entities.Product.list("-created_date", 50),
      base44.entities.CustomerNote.list("-created_date", 50),
    ]).then(([orderData, productData, noteData]) => {
      setOrders(orderData ?? []);
      setProducts(productData ?? []);
      setNotes(noteData ?? []);
      setLoading(false);
    });
  }, []);

  const safeOrders = orders ?? [];
  const safeProducts = products ?? [];
  const safeNotes = notes ?? [];
  const rollingDays = useMemo(() => getRollingDays(new Date()), []);

  const isUrgentOrder = (order) => {
    if (order.status !== "Pending") return false;
    const slotMoment = order.time_slot
      ? moment(`${moment(order.order_date).format("YYYY-MM-DD")} ${order.time_slot}`, "YYYY-MM-DD h:mm A", true)
      : null;
    const reference = slotMoment?.isValid() ? slotMoment : moment(order.order_date);
    return reference.diff(moment(), "hours") <= 24 && reference.isAfter(moment());
  };

  const normalizedOrders = useMemo(() => {
    return safeOrders.map((order) => ({
      ...order,
      scheduledFor: order.scheduledFor || order.order_date,
      clientId: order.clientId || order.client_name || order.id,
    }));
  }, [safeOrders]);

  const filteredOrders = useMemo(() => {
    const byDate = normalizedOrders.filter((order) => toDayKey(order.scheduledFor) === selectedDate);

    return byDate.filter((order) => {
      if (orderStatusFilter === "all") return true;
      if (orderStatusFilter === "urgent") return isUrgentOrder(order);
      return order.status === orderStatusFilter;
    }).map((order) => ({
      ...order,
      isUrgent: isUrgentOrder(order),
      notesCount: safeNotes.filter((note) => (note.clientId || note.client_name) === order.clientId || note.client_name === order.client_name).length,
    }));
  }, [normalizedOrders, selectedDate, orderStatusFilter, safeNotes]);

  const selectedClientNotes = useMemo(() => {
    if (!selectedClientId) return [];
    return safeNotes.filter((note) => (note.clientId || note.client_name) === selectedClientId || note.client_name === selectedClientId);
  }, [safeNotes, selectedClientId]);

  const selectedClientName = useMemo(() => {
    if (!selectedClientId) return null;
    return filteredOrders.find((order) => order.clientId === selectedClientId || order.client_name === selectedClientId)?.client_name || selectedClientId;
  }, [filteredOrders, selectedClientId]);

  const todayOrders = useMemo(() => normalizedOrders.filter((o) => moment(o.order_date).isSame(moment(), "day")), [normalizedOrders]);
  const pendingOrders = useMemo(() => normalizedOrders.filter((o) => o.status === "Pending"), [normalizedOrders]);
  const processingOrders = useMemo(() => normalizedOrders.filter((o) => o.status === "Confirmed"), [normalizedOrders]);
  const completedOrders = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled"), [normalizedOrders]);
  const overdueOrders = useMemo(() => normalizedOrders.filter((o) => (o.status === "Pending" || o.status === "Confirmed") && moment(o.order_date).isBefore(moment(), "day")), [normalizedOrders]);
  const lowStock = useMemo(() => safeProducts.filter((p) => p.current_stock <= (p.low_stock_threshold || 5)), [safeProducts]);
  const outOfStock = useMemo(() => safeProducts.filter((p) => p.current_stock <= 0), [safeProducts]);
  const topSeller = useMemo(() => normalizedOrders.length > 0
    ? Object.entries(normalizedOrders.reduce((acc, order) => {
        const key = order.client_name || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null, [normalizedOrders]);
  const unresolvedClientIssues = useMemo(() => safeNotes.filter((n) => n.priority === "High" || n.note_type === "Needs Attention" || n.note_type === "Debt on Account"), [safeNotes]);
  const recentNotes = useMemo(() => safeNotes.slice(0, 3), [safeNotes]);
  const recentInteractions = useMemo(() => safeNotes.filter((n) => moment(n.created_date).isAfter(moment().subtract(7, "days"))).length, [safeNotes]);
  const newNotesToday = useMemo(() => safeNotes.filter((n) => moment(n.created_date).isSame(moment(), "day")).length, [safeNotes]);
  const followUpClients = useMemo(() => safeNotes.filter((n) => n.note_type === "Client Retention" || n.note_type === "Needs Attention").length, [safeNotes]);
  const completedToday = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled" && moment(o.updated_date || o.order_date).isSame(moment(), "day")).length, [normalizedOrders]);
  const completedYesterday = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled" && moment(o.updated_date || o.order_date).isSame(moment().subtract(1, "day"), "day")).length, [normalizedOrders]);
  const revenueToday = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled" && moment(o.order_date).isSame(moment(), "day")).reduce((sum, order) => sum + Number(order.order_value || 0), 0), [normalizedOrders]);
  const revenueWeek = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled" && moment(o.order_date).isSame(moment(), "week")).reduce((sum, order) => sum + Number(order.order_value || 0), 0), [normalizedOrders]);
  const revenueMonth = useMemo(() => normalizedOrders.filter((o) => o.status === "Fulfilled" && moment(o.order_date).isSame(moment(), "month")).reduce((sum, order) => sum + Number(order.order_value || 0), 0), [normalizedOrders]);
  const creditOnAccountNotes = useMemo(() => safeNotes.filter((n) => n.note_type === "Credit on Account"), [safeNotes]);
  const debtOnAccountNotes = useMemo(() => safeNotes.filter((n) => n.note_type === "Debt on Account"), [safeNotes]);
  const totalCreditOnAccount = useMemo(() => creditOnAccountNotes.reduce((sum, note) => sum + Number(note.total_spend || 0), 0), [creditOnAccountNotes]);
  const totalDebtOnAccount = useMemo(() => debtOnAccountNotes.reduce((sum, note) => sum + Number(note.total_spend || 0), 0), [debtOnAccountNotes]);
  const potentialMonthlyRevenue = useMemo(() => Math.max(totalCreditOnAccount - totalDebtOnAccount, 0), [totalCreditOnAccount, totalDebtOnAccount]);
  const fulfillmentRate = useMemo(() => todayOrders.length > 0 ? Math.round((completedToday / todayOrders.length) * 100) : 0, [todayOrders, completedToday]);

  const getDayMeta = (day) => {
    const dayOrders = normalizedOrders
      .filter((order) => isSameDay(order.scheduledFor || order.order_date, day))
      .sort((a, b) => moment(a.order_date).valueOf() - moment(b.order_date).valueOf());
    const hasOverdue = dayOrders.some((order) => (order.status === "Pending" || order.status === "Confirmed") && moment(order.order_date).isBefore(moment(), "day"));
    const hasCritical = dayOrders.some((order) => isUrgentOrder(order));
    return {
      orderCount: dayOrders.length,
      hasOrders: dayOrders.length > 0,
      hasAlert: hasOverdue || hasCritical,
      isCritical: hasCritical,
      entries: dayOrders.slice(0, 2).map((order) => ({
        id: order.id,
        client_name: order.client_name,
        time: order.time_slot || moment(order.order_date).format("h:mm A"),
      })),
    };
  };

  const handleMetricSelect = (filter) => {
    setOrderStatusFilter(filter === "confirmed" ? "Confirmed" : filter === "fulfilled" ? "Fulfilled" : filter === "pending" ? "Pending" : filter === "overdue" ? "overdue" : filter === "urgent" ? "urgent" : "all");
    setSelectedDate(getTodayKey());
    setShowOrdersPanel(true);
  };

  const handleQuickAddOrder = async (data) => {
    await base44.entities.Order.create({
      ...data,
      quantity: Number(data.quantity) || 0,
    });

    const [orderData, productData, noteData] = await Promise.all([
      base44.entities.Order.list("-created_date", 50),
      base44.entities.Product.list("-created_date", 50),
      base44.entities.CustomerNote.list("-created_date", 50),
    ]);

    setOrders(orderData ?? []);
    setProducts(productData ?? []);
    setNotes(noteData ?? []);
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ filter: themeMode === "soft-noir" ? "brightness(1.04) saturate(0.92)" : "none" }}>
      <div style={{
        position: "relative",
        marginBottom: "40px",
        padding: "36px 40px",
        background: "linear-gradient(135deg, #0f0a00 0%, #0a0a0a 50%, #100808 100%)",
        border: "1px solid rgba(201,168,76,0.25)",
        overflow: "hidden",
      }}>
        <CornerBracket />
        <CornerBracket flip />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "40px", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src="https://media.base44.com/images/public/69cd3aaf3e23608c6e7a4c23/85abe4afd_generated_image.png"
              alt="Grilled Inc"
              style={{ width: "160px", filter: "drop-shadow(0 0 24px rgba(201,168,76,0.4)) drop-shadow(0 0 6px rgba(194,24,91,0.2))" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 400, color: "rgba(201,168,76,0.45)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "8px" }}>
              ◆ &nbsp; Private Operations Terminal &nbsp; ◆
            </p>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, lineHeight: 1.1, textShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
              Operations
            </h1>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, color: "#F5F0E8", letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, lineHeight: 1.1, opacity: 0.9 }}>
              Terminal
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <span style={{ color: "rgba(201,168,76,0.5)", fontSize: "8px" }}>◆</span>
              <div style={{ height: "1px", width: "40px", background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.35)", letterSpacing: "0.15em", marginTop: "10px" }}>
              Grilled.inc — Members-only dashboard
            </p>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
            <button
              onClick={() => setQuickAddOpen(true)}
              style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
            >
              <Plus size={12} /> Quick Add Order
            </button>
            <ThemeToneSwitch
              mode={themeMode}
              onToggle={() => setThemeMode((prev) => prev === "noir" ? "soft-noir" : "noir")}
            />
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "22px", fontWeight: 400, color: "rgba(201,168,76,0.6)", lineHeight: 1 }}>{moment().format("DD")}</p>
              <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{moment().format("MMM YYYY")}</p>
            </div>
          </div>
        </div>
      </div>

      <RollingCalendarStrip
        days={rollingDays}
        selectedDate={selectedDate}
        getDayMeta={getDayMeta}
        onSelectDay={(dayKey) => {
          setSelectedDate(dayKey);
          setOrderStatusFilter("all");
          setShowOrdersPanel(true);
        }}
      />

      {(showOrdersPanel || filteredOrders.length > 0) && (
        <TodayOrdersCard
          selectedDate={selectedDate}
          orders={filteredOrders}
          onClientClick={(clientIdOrName) => {
            setSelectedClientId(clientIdOrName);
            setShowOrdersPanel(true);
          }}
        />
      )}

      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(201,168,76,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
        Live Intelligence
      </p>
      <IntelligenceCards
        ordersOverview={{
          todayTotal: todayOrders.length,
          pending: pendingOrders.length,
          processing: processingOrders.length,
          completed: completedOrders.length,
          overdue: overdueOrders.length,
          onSelectFilter: handleMetricSelect,
        }}
        inventoryStatus={{
          lowStock: lowStock.length,
          outOfStock: outOfStock.length,
          topSeller,
        }}
        alertsIssues={{
          lateOrders: overdueOrders.length,
          lowInventory: lowStock.length,
          clientIssues: unresolvedClientIssues.length,
          onSelectFilter: handleMetricSelect,
        }}
        clientActivity={{
          recentInteractions,
          newNotes: newNotesToday,
          followUp: followUpClients,
        }}
        dailyPerformance={{
          completedToday,
          completedYesterday,
          revenue: revenueToday,
          fulfillmentRate,
        }}
        financialSummary={{
          today: revenueToday,
          week: revenueWeek,
          month: revenueMonth,
        }}
        liquidityTracking={{
          totalDebt: totalDebtOnAccount,
          totalCredit: totalCreditOnAccount,
          potentialMonthlyRevenue,
        }}
      />

      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(201,168,76,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
        Quick Access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "40px" }}>
        {quickLinks.map(card => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              display: "block", position: "relative",
              background: "linear-gradient(135deg, #141414 0%, #0f0f0f 100%)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 0, padding: "24px",
              textDecoration: "none", transition: "all 0.25s ease",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(201,168,76,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: "14px", height: "14px", borderTop: "1px solid rgba(201,168,76,0.5)", borderLeft: "1px solid rgba(201,168,76,0.5)" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", borderBottom: "1px solid rgba(201,168,76,0.5)", borderRight: "1px solid rgba(201,168,76,0.5)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <card.icon size={16} strokeWidth={1.2} style={{ color: "rgba(201,168,76,0.5)" }} />
              <ArrowRight size={14} strokeWidth={1} style={{ color: "rgba(201,168,76,0.35)" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 600, fontStyle: "italic", color: "#C9A84C", marginBottom: "8px" }}>{card.label}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7 }}>{card.desc}</p>
          </Link>
        ))}
      </div>

      <div className="gold-divider"><span className="gold-divider-diamond">◆</span></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-md:!grid-cols-1">
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase", fontWeight: 600 }}>Recent Notes</span>
            <Link to="/notes" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All →</Link>
          </div>
          <div>
            {recentNotes.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.2)" }}>No notes yet.</p>
            ) : recentNotes.map(note => (
              <div key={note.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontWeight: 600, color: "#F5F0E8" }}>{note.client_name}</span>
                  <StatusBadge status={note.priority} />
                </div>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.45)", lineHeight: 1.6, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{note.content}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={9} style={{ color: "rgba(245,240,232,0.2)" }} />
                  <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.2)", letterSpacing: "0.08em" }}>{moment(note.created_date).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 0 }}>
          <div style={{ background: "#0a0a0a", padding: "14px 20px", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", letterSpacing: "0.2em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase", fontWeight: 600 }}>Low Stock Alerts</span>
            <Link to="/inventory" style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>View All →</Link>
          </div>
          <div>
            {lowStock.length === 0 ? (
              <p style={{ padding: "24px 20px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.2)" }}>All products well stocked.</p>
            ) : lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
               <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", fontWeight: 500, color: "#F5F0E8" }}>{p.product_name}</p>
               <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.3)", marginTop: "2px" }}>{p.category} · Threshold {p.low_stock_threshold || 5}</p>
              </div>
              <div style={{ textAlign: "right" }}>
               <p style={{ fontFamily: "'Cinzel', serif", fontSize: "28px", fontWeight: 600, color: "#C2185B", lineHeight: 1 }}>{p.current_stock}</p>
               <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.22)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>units</p>
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ClientNotesDrawer
        open={!!selectedClientId}
        clientName={selectedClientName}
        notes={selectedClientNotes}
        onClose={() => setSelectedClientId(null)}
      />

      <OrderFormDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        order={null}
        onSave={handleQuickAddOrder}
      />
    </div>
  );
}