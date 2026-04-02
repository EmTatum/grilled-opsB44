import { useNavigate } from "react-router-dom";
import { AlertTriangle, Box, ClipboardList, FileText, Users, TrendingUp } from "lucide-react";

const cardBase = {
  position: "relative",
  background: "#141414",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 0,
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  minHeight: "220px",
  transition: "all 0.25s ease",
  overflow: "hidden",
};

const labelStyle = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.55)",
  marginBottom: "14px",
};

const valueStyle = {
  fontFamily: "'Cinzel', serif",
  fontSize: "42px",
  fontWeight: 600,
  lineHeight: 1,
  color: "#C9A84C",
  margin: 0,
};

const rowLabel = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(245,240,232,0.35)",
};

const rowValue = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "12px",
  color: "#F5F0E8",
  fontWeight: 500,
};

const bottomBtnStyle = {
  marginTop: "auto",
  borderTop: "1px solid rgba(201,168,76,0.15)",
  paddingTop: "12px",
  textAlign: "center",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.6)",
  cursor: "pointer",
  background: "none",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "none",
  width: "100%",
  transition: "color 0.2s",
};

function CornerBrackets({ color = "#C9A84C", opacity = 0.5 }) {
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, width: "16px", height: "16px", borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}`, opacity }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "16px", height: "16px", borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}`, opacity }} />
    </>
  );
}

function MetricRow({ label, value, danger = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ ...rowLabel, color: danger ? "rgba(194,24,91,0.7)" : rowLabel.color }}>{label}</span>
      <span style={{ ...rowValue, color: danger ? "#C2185B" : rowValue.color }}>{value}</span>
    </div>
  );
}

function WidgetCard({ icon, title, onClick, children, actionLabel, danger = false }) {
  const IconComponent = icon;
  return (
    <div
      onClick={onClick}
      style={{
        ...cardBase,
        border: danger ? "1px solid rgba(194,24,91,0.45)" : cardBase.border,
        cursor: "pointer",
        boxShadow: danger ? "0 0 20px rgba(194,24,91,0.08)" : "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = danger ? "rgba(194,24,91,0.7)" : "rgba(201,168,76,0.5)";
        e.currentTarget.style.boxShadow = danger ? "0 0 22px rgba(194,24,91,0.12)" : "0 0 20px rgba(201,168,76,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = danger ? "rgba(194,24,91,0.45)" : "rgba(201,168,76,0.25)";
        e.currentTarget.style.boxShadow = danger ? "0 0 20px rgba(194,24,91,0.08)" : "none";
      }}
    >
      <CornerBrackets color={danger ? "rgba(194,24,91,0.85)" : "#C9A84C"} opacity={0.5} />
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <IconComponent size={16} strokeWidth={1.5} style={{ color: danger ? "rgba(194,24,91,0.8)" : "rgba(201,168,76,0.6)" }} />
        <p style={{ ...labelStyle, color: danger ? "rgba(194,24,91,0.75)" : labelStyle.color, marginBottom: 0 }}>{title}</p>
      </div>
      {children}
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
        style={{ ...bottomBtnStyle, borderTop: danger ? "1px solid rgba(194,24,91,0.18)" : bottomBtnStyle.borderTop, color: danger ? "rgba(194,24,91,0.7)" : bottomBtnStyle.color }}
      >
        {actionLabel} →
      </button>
    </div>
  );
}

function OrdersOverviewWidget({ stats }) {
  const navigate = useNavigate();
  return (
    <WidgetCard icon={ClipboardList} title="Orders Overview" onClick={() => navigate("/orders")} actionLabel="View Orders" danger={stats.overdue > 0}>
      <p style={valueStyle}>{stats.todayTotal}</p>
      <div style={{ marginTop: "10px" }}>
        <MetricRow label="Pending" value={stats.pending} />
        <MetricRow label="Processing" value={stats.processing} />
        <MetricRow label="Completed" value={stats.completed} />
        <MetricRow label="Overdue" value={stats.overdue} danger={stats.overdue > 0} />
      </div>
    </WidgetCard>
  );
}

function InventoryStatusWidget({ stats }) {
  const navigate = useNavigate();
  return (
    <WidgetCard icon={Box} title="Inventory Status" onClick={() => navigate("/inventory")} actionLabel="Check Inventory" danger={stats.lowStock > 0 || stats.outOfStock > 0}>
      <p style={valueStyle}>{stats.lowStock}</p>
      <div style={{ marginTop: "10px" }}>
        <MetricRow label="Low Stock" value={stats.lowStock} danger={stats.lowStock > 0} />
        <MetricRow label="Out of Stock" value={stats.outOfStock} danger={stats.outOfStock > 0} />
        <MetricRow label="Top Seller" value={stats.topSeller || "—"} />
      </div>
    </WidgetCard>
  );
}

function AlertsIssuesWidget({ stats }) {
  const navigate = useNavigate();
  const totalIssues = stats.lateOrders + stats.lowInventory + stats.clientIssues;
  return (
    <WidgetCard icon={AlertTriangle} title="Alerts & Issues" onClick={() => navigate("/orders")} actionLabel="Review Issues" danger={totalIssues > 0}>
      <p style={{ ...valueStyle, color: totalIssues > 0 ? "#C2185B" : "rgba(245,240,232,0.35)" }}>{totalIssues}</p>
      <div style={{ marginTop: "10px" }}>
        <MetricRow label="Late Orders" value={stats.lateOrders} danger={stats.lateOrders > 0} />
        <MetricRow label="Low Inventory" value={stats.lowInventory} danger={stats.lowInventory > 0} />
        <MetricRow label="Client Issues" value={stats.clientIssues} danger={stats.clientIssues > 0} />
      </div>
    </WidgetCard>
  );
}

function ClientActivityWidget({ stats }) {
  const navigate = useNavigate();
  return (
    <WidgetCard icon={Users} title="Client Activity" onClick={() => navigate("/notes")} actionLabel="View Notes">
      <p style={valueStyle}>{stats.recentInteractions}</p>
      <div style={{ marginTop: "10px" }}>
        <MetricRow label="Recent Interactions" value={stats.recentInteractions} />
        <MetricRow label="New Notes" value={stats.newNotes} />
        <MetricRow label="Need Follow-Up" value={stats.followUp} danger={stats.followUp > 0} />
      </div>
    </WidgetCard>
  );
}

function DailyPerformanceWidget({ stats }) {
  const navigate = useNavigate();
  return (
    <WidgetCard icon={TrendingUp} title="Daily Performance" onClick={() => navigate("/orders")} actionLabel="Open Orders">
      <p style={valueStyle}>{stats.completedToday}</p>
      <div style={{ marginTop: "10px" }}>
        <MetricRow label="Vs Yesterday" value={`${stats.completedToday} / ${stats.completedYesterday}`} />
        <MetricRow label="Revenue" value={stats.revenue > 0 ? `R${Number(stats.revenue).toLocaleString()}` : "—"} />
        <MetricRow label="Fulfillment Rate" value={`${stats.fulfillmentRate}%`} />
      </div>
    </WidgetCard>
  );
}

export default function IntelligenceCards({ ordersOverview, inventoryStatus, alertsIssues, clientActivity, dailyPerformance }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }} className="intelligence-grid">
      <style>{`
        @media (max-width: 1100px) {
          .intelligence-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .intelligence-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <OrdersOverviewWidget stats={ordersOverview} />
      <InventoryStatusWidget stats={inventoryStatus} />
      <AlertsIssuesWidget stats={alertsIssues} />
      <ClientActivityWidget stats={clientActivity} />
      <DailyPerformanceWidget stats={dailyPerformance} />
    </div>
  );
}