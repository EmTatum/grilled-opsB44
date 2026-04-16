import moment from "moment";

const headerCell = {
  padding: "10px 12px",
  textAlign: "left",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  color: "rgba(201,168,76,0.65)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(201,168,76,0.25)",
  background: "#0a0a0a",
  verticalAlign: "top",
};

const bodyCell = {
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  verticalAlign: "top",
};

const checkboxRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  marginBottom: "6px",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "11px",
  color: "#F5F0E8",
  lineHeight: 1.5,
};

const splitItems = (text) =>
  String(text || "")
    .split(/\n|,|•|\-/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function DispatchManifestTable({ orders, title = "Daily Dispatch Manifest", subtitle, showPrintButton = false, showDateAboveTime = false }) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(201,168,76,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A84C", margin: 0 }}>{title}</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.4)", margin: "4px 0 0" }}>{subtitle || moment().format("dddd, D MMMM YYYY")}</p>
        </div>
        {showPrintButton && (
          <button onClick={() => window.print()} style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer" }}>
            Print Manifest
          </button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "920px" }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: "140px" }}>Schedule</th>
              <th style={{ ...headerCell, width: "180px" }}>Client Name</th>
              <th style={headerCell}>Items To Pack</th>
              <th style={{ ...headerCell, width: "220px" }}>Address</th>
              <th style={{ ...headerCell, width: "150px" }}>Payment</th>
              <th style={{ ...headerCell, width: "320px" }}>Verification Checklist</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const items = splitItems(order.order_details);
              return (
                <tr key={order.id}>
                  <td style={bodyCell}>
                    {showDateAboveTime && (
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.45)", margin: "0 0 4px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {moment(order.order_date).format("ddd D MMM YYYY")}
                      </p>
                    )}
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", color: "#C9A84C", margin: 0 }}>{order.time_slot || moment(order.order_date).format("h:mm A")}</p>
                  </td>
                  <td style={bodyCell}>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 600, color: "#F5F0E8", margin: 0 }}>{order.client_name}</p>
                  </td>
                  <td style={bodyCell}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {items.length > 0 ? items.map((item, index) => (
                        <p key={index} style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.78)", margin: 0 }}>{item}</p>
                      )) : (
                        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.35)", margin: 0 }}>No item breakdown provided</p>
                      )}
                    </div>
                  </td>
                  <td style={bodyCell}>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.78)", margin: 0, lineHeight: 1.5 }}>
                      {order.delivery_address || "Not recorded."}
                    </p>
                  </td>
                  <td style={bodyCell}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#F5F0E8", margin: 0 }}>{order.payment_method || "Other"}</p>
                      {order.payment_status && (
                        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.72)", margin: 0, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {order.payment_status}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={bodyCell}>
                    <div>
                      {(items.length > 0 ? items : ["Packaging check"]).map((item, index) => (
                        <label key={index} style={checkboxRow}>
                          <input type="checkbox" style={{ marginTop: "2px", accentColor: "#C9A84C" }} />
                          <span>{item} verified</span>
                        </label>
                      ))}
                    </div>
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