import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";

const panelStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "18px",
  display: "grid",
  gap: "16px"
};

function RevenueLabel({ x, y, width, value }) {
  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 10}
      fill={value === "R0" ? "rgba(194,24,91,0.58)" : "#C2185B"}
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
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "18px", fontWeight: 700, color: "#F5F0E8" }}>Weekly Performance</p>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.55)" }}>Order Volume this week</p>
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
            <Bar dataKey="orders" name="orders" fill="#C9A84C" radius={[2, 2, 0, 0]} maxBarSize={42}>
              <LabelList dataKey="revenueLabel" content={<RevenueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}