import moment from "moment";

const tableHeader = {
  padding: "14px 16px",
  textAlign: "left",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  color: "rgba(201,168,76,0.7)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(201,168,76,0.25)",
  background: "#0a0a0a",
  whiteSpace: "nowrap",
};

const cellBase = {
  padding: "14px 16px",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "13px",
  color: "#F5F0E8",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  verticalAlign: "top",
};

export default function ClientAnalyticsList({ clients, selectedClientName, onSelectClient }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
          <thead>
            <tr>
              <th style={tableHeader}>Member</th>
              <th style={tableHeader}>Total Spend</th>
              <th style={tableHeader}>Orders</th>
              <th style={tableHeader}>Avg Order</th>
              <th style={tableHeader}>Orders / Month</th>
              <th style={tableHeader}>Last Order</th>
              <th style={tableHeader}>Last Contact</th>
              <th style={tableHeader}>Attention</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const isSelected = client.client_name === selectedClientName;
              const followUpStyle = client.needsFollowUp
                ? { border: "1px solid rgba(194,24,91,0.45)", color: "#C2185B", background: "rgba(194,24,91,0.08)" }
                : { border: "1px solid rgba(201,168,76,0.35)", color: "#C9A84C", background: "rgba(201,168,76,0.08)" };

              return (
                <tr
                  key={client.client_name}
                  onClick={() => onSelectClient(client.client_name)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "rgba(201,168,76,0.07)" : "#111111",
                    borderLeft: isSelected ? "2px solid #C9A84C" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "rgba(201,168,76,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#111111";
                  }}
                >
                  <td style={cellBase}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#F5F0E8", fontWeight: 600 }}>{client.client_name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "10px", color: "rgba(245,240,232,0.38)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{client.daysSinceLastOrder} days since order</p>
                    </div>
                  </td>
                  <td style={{ ...cellBase, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#C9A84C" }}>R{client.totalSpend.toLocaleString()}</td>
                  <td style={cellBase}>{client.orderCount}</td>
                  <td style={cellBase}>R{client.averageOrderValue.toLocaleString()}</td>
                  <td style={cellBase}>{client.purchaseFrequencyLabel}</td>
                  <td style={cellBase}>{client.lastOrderDate ? moment(client.lastOrderDate).format("D MMM YYYY") : "—"}</td>
                  <td style={cellBase}>{client.lastContactDate ? moment(client.lastContactDate).format("D MMM YYYY") : "—"}</td>
                  <td style={cellBase}>
                    <span style={{ ...followUpStyle, display: "inline-flex", padding: "5px 9px", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {client.needsFollowUp ? "Requires attention" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}