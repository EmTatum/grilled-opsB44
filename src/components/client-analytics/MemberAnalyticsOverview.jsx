import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency } from "../notes/memberIntelligenceUtils";

const panelStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "20px",
  display: "grid",
  gap: "18px"
};

const statCardStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "16px",
  display: "grid",
  gap: "6px"
};

function MetricCard({ label, value, sublabel }) {
  return (
    <div style={statCardStyle}>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "30px", color: "#C9A84C", lineHeight: 1 }}>{value}</p>
      {sublabel && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.45)" }}>{sublabel}</p>}
    </div>
  );
}

function TrendChart({ title, subtitle, data, dataKey, valueFormatter, stroke }) {
  return (
    <div style={panelStyle}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.45)" }}>{subtitle}</p>
      </div>
      <div style={{ width: "100%", height: "260px" }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(201,168,76,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }} axisLine={{ stroke: "rgba(201,168,76,0.12)" }} tickLine={false} />
            <YAxis tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip
              contentStyle={{ background: "#111111", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 0, color: "#F5F0E8" }}
              labelStyle={{ color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}
              formatter={(value) => [valueFormatter(value), title]}
            />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 3, fill: stroke, stroke: "#111111", strokeWidth: 1 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MemberAnalyticsOverview({ summary, revenueTrend, retentionTrend, monthlyActiveUsersTrend, purchaseFrequencyTrend }) {
  return (
    <section style={{ display: "grid", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <MetricCard label="Revenue Growth" value={summary.revenueGrowthLabel} sublabel="Latest month vs previous month" />
        <MetricCard label="Member Retention" value={summary.retentionRateLabel} sublabel="Members active in consecutive months" />
        <MetricCard label="Monthly Active Users" value={String(summary.latestMonthlyActiveUsers)} sublabel="Unique members in the latest month" />
        <MetricCard label="Purchase Frequency" value={summary.averagePurchaseFrequencyLabel} sublabel="Average premium product orders per active member" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }} className="max-lg:!grid-cols-1">
        <TrendChart title="Revenue Growth" subtitle="Monthly revenue movement across the member base" data={revenueTrend} dataKey="value" valueFormatter={(value) => formatCurrency(value)} stroke="#C9A84C" />
        <TrendChart title="Member Retention" subtitle="Percentage of members returning month over month" data={retentionTrend} dataKey="value" valueFormatter={(value) => `${value}%`} stroke="#E8D08A" />
        <TrendChart title="Monthly Active Users" subtitle="Unique active members per month" data={monthlyActiveUsersTrend} dataKey="value" valueFormatter={(value) => `${value}`} stroke="#F5F0E8" />
        <TrendChart title="Premium Purchase Frequency" subtitle="Average premium cannabis purchases per active member" data={purchaseFrequencyTrend} dataKey="value" valueFormatter={(value) => `${value}x`} stroke="#C2185B" />
      </div>
    </section>
  );
}