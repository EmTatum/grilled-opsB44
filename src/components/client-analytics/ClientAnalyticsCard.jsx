import StatusBadge from "../StatusBadge";

const segmentStyles = {
  VIP: { border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C", background: "rgba(201,168,76,0.08)" },
  "At-Risk": { border: "1px solid rgba(194,24,91,0.45)", color: "#C2185B", background: "rgba(194,24,91,0.08)" },
  New: { border: "1px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)", background: "rgba(255,255,255,0.04)" },
  Regular: { border: "1px solid rgba(245,240,232,0.2)", color: "rgba(245,240,232,0.75)", background: "rgba(255,255,255,0.04)" },
};

const metricLabel = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "9px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(245,240,232,0.3)",
  marginBottom: "4px",
};

const metricValue = {
  fontFamily: "'Cinzel', serif",
  fontSize: "20px",
  color: "#C9A84C",
  lineHeight: 1,
};

export default function ClientAnalyticsCard({ client }) {
  const segmentStyle = segmentStyles[client.segment] || segmentStyles.Regular;

  return (
    <div style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.18)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 600, color: "#F5F0E8", margin: 0 }}>{client.client_name}</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,240,232,0.38)", marginTop: "4px" }}>{client.orderCount} total orders</p>
        </div>
        <span style={{ ...segmentStyle, fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "2px" }}>
          {client.segment}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }} className="max-md:!grid-cols-1">
        <div>
          <p style={metricLabel}>Average Order</p>
          <p style={metricValue}>R{client.averageOrderValue.toLocaleString()}</p>
        </div>
        <div>
          <p style={metricLabel}>Purchase Rate</p>
          <p style={metricValue}>{client.purchaseFrequencyLabel}</p>
        </div>
        <div>
          <p style={metricLabel}>Last Order</p>
          <p style={metricValue}>{client.daysSinceLastOrder}d</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap" }}>
        <div>
          <p style={metricLabel}>Lifetime Value</p>
          <p style={{ ...metricValue, fontSize: "24px" }}>R{client.totalSpend.toLocaleString()}</p>
        </div>
        <StatusBadge status={client.priorityTag} />
      </div>
    </div>
  );
}