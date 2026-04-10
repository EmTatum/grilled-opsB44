import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import moment from "moment";

export default function ClientSpendChart({ data }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", padding: "20px" }}>
      <div style={{ marginBottom: "18px" }}>
        <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "18px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A84C" }}>Spend Over Time</p>
        <p style={{ margin: "6px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.4)" }}>Monthly spend trend for the selected client</p>
      </div>
      <div style={{ width: "100%", height: "280px" }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="clientSpendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(201,168,76,0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(201,168,76,0.12)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(245,240,232,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{ background: "#111111", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 0, color: "#F5F0E8" }}
              labelStyle={{ color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}
              formatter={(value) => [`R${Number(value).toLocaleString()}`, "Spend"]}
              labelFormatter={(value) => moment(value, "MMM YYYY").format("MMMM YYYY")}
            />
            <Area type="monotone" dataKey="spend" stroke="#C9A84C" strokeWidth={2} fill="url(#clientSpendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}