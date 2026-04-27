import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const panelStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "18px",
  display: "grid",
  gap: "16px"
};

const headingStyle = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  color: "#C9A84C",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

function ChartCard({ title, dataKey, valueFormatter, data }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", padding: "16px", display: "grid", gap: "12px", minHeight: "280px" }}>
      <div style={{ display: "grid", gap: "4px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</p>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)" }}>Last 7 delivery days</p>
      </div>

      <div style={{ width: "100%", height: "210px" }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={8}>
            <CartesianGrid stroke="rgba(201,168,76,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "rgba(245,240,232,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(201,168,76,0.12)" }} tickLine={false} />
            <YAxis tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={valueFormatter} />
            <Tooltip
              cursor={{ fill: "rgba(201,168,76,0.05)" }}
              contentStyle={{ background: "#111111", border: "1px solid rgba(201,168,76,0.24)", borderRadius: "2px", color: "#F5F0E8" }}
              labelStyle={{ color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: 12 }}
              formatter={(value) => [valueFormatter(value), title]}
            />
            <Bar dataKey={dataKey} fill="#C9A84C" radius={[2, 2, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DailyPerformanceCharts({ data }) {
  return (
    <section style={panelStyle}>
      <p style={headingStyle}>Daily Performance</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <ChartCard title="Daily Revenue" dataKey="revenue" data={data} valueFormatter={(value) => `R${Number(value || 0).toLocaleString("en-ZA")}`} />
        <ChartCard title="Order Volume" dataKey="orders" data={data} valueFormatter={(value) => `${value}`} />
      </div>
    </section>
  );
}