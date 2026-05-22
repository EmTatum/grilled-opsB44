import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";

const panelStyle = {
  background: "var(--color-surface)",
  border: "1px solid rgba(201,168,76,0.3)",
  padding: "20px",
  display: "grid",
  gap: "16px",
  borderRadius: "2px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.8)"
};

function RevenueLabel({ x, y, width, value }) {
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 10}
      fill={value === "R0" ? "rgba(245,240,232,0.4)" : "var(--color-gold)"}
      textAnchor="middle"
      style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}
    >
      {value}
    </text>
  );
}

export default function DailyPerformanceCharts({ data }) {
  return (
    <section style={panelStyle}>
      <div style={{ display: "grid", gap: "4px" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "var(--color-gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Weekly Performance</p>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 300, color: "var(--color-text-muted)" }}>Order Volume this week</p>
      </div>

      <div style={{ width: "100%", height: "280px" }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 30, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(201,168,76,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "rgba(245,240,232,0.55)", fontSize: 11 }} axisLine={{ stroke: "rgba(201,168,76,0.12)" }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              cursor={{ fill: "rgba(201,168,76,0.05)" }}
              contentStyle={{ background: "#111111", border: "1px solid rgba(201,168,76,0.24)", borderRadius: "2px", color: "#F5F0E8" }}
              labelStyle={{ color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: 12 }}
              formatter={(value, name, payload) => {
                if (name === "orders") {
                  return [`${value} orders`, `Revenue ${payload?.payload?.revenueLabel || "R0"}`];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="orders" name="orders" fill="var(--color-gold)" radius={[2, 2, 0, 0]} maxBarSize={42}>
              <LabelList dataKey="revenueLabel" content={<RevenueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}