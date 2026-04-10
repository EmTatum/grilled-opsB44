import moment from "moment";
import ClientSpendChart from "./ClientSpendChart";
import ClientOrderHistoryTable from "./ClientOrderHistoryTable";

const statLabel = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.6)",
  marginBottom: "6px",
};

const statValue = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "28px",
  color: "#C9A84C",
  lineHeight: 1,
  fontWeight: 600,
};

export default function ClientDetailPanel({ client }) {
  if (!client) return null;

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "18px" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "34px", color: "#F5F0E8", fontWeight: 600 }}>{client.client_name}</p>
            <p style={{ margin: "6px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Last order {client.lastOrderDate ? moment(client.lastOrderDate).format("D MMM YYYY") : "—"} · Last contact {client.lastContactDate ? moment(client.lastContactDate).format("D MMM YYYY") : "—"}
            </p>
          </div>
          <div style={{ alignSelf: "flex-start", padding: "6px 10px", border: client.needsFollowUp ? "1px solid rgba(194,24,91,0.45)" : "1px solid rgba(201,168,76,0.35)", color: client.needsFollowUp ? "#C2185B" : "#C9A84C", background: client.needsFollowUp ? "rgba(194,24,91,0.08)" : "rgba(201,168,76,0.08)", fontFamily: "'Raleway', sans-serif", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {client.needsFollowUp ? "Needs Follow-Up" : "Active Client"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "14px" }} className="max-lg:!grid-cols-2 max-sm:!grid-cols-1">
          <div><p style={statLabel}>Total Spend</p><p style={statValue}>R{client.totalSpend.toLocaleString()}</p></div>
          <div><p style={statLabel}>Orders</p><p style={statValue}>{client.orderCount}</p></div>
          <div><p style={statLabel}>Avg Order</p><p style={statValue}>R{client.averageOrderValue.toLocaleString()}</p></div>
          <div><p style={statLabel}>Orders / Month</p><p style={statValue}>{client.purchaseFrequencyLabel}</p></div>
          <div><p style={statLabel}>Days Since Order</p><p style={statValue}>{client.daysSinceLastOrder}</p></div>
        </div>
      </div>

      <ClientSpendChart data={client.spendSeries} />
      <ClientOrderHistoryTable orders={client.orders} />
    </div>
  );
}