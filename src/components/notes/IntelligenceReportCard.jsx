import moment from "moment";

const badgeStyles = {
  Paid: {
    color: "#8fd6c7",
    border: "1px solid rgba(143,214,199,0.45)",
    background: "rgba(21,67,74,0.28)",
  },
  "To Be Paid": {
    color: "#d46a7f",
    border: "1px solid rgba(194,24,91,0.45)",
    background: "rgba(194,24,91,0.12)",
  },
};

export default function IntelligenceReportCard({ report, onOpen }) {
  const statusStyle = badgeStyles[report.payment_status] || badgeStyles["To Be Paid"];

  return (
    <button
      onClick={() => onOpen(report)}
      style={{
        width: "100%",
        textAlign: "left",
        background: "#141414",
        border: "1px solid rgba(201,168,76,0.18)",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.38)";
        e.currentTarget.style.background = "rgba(201,168,76,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.18)";
        e.currentTarget.style.background = "#141414";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#d29c6c", fontWeight: 600 }}>
          {report.client_name || "Unnamed Client"}
        </p>
        <span style={{ ...statusStyle, padding: "5px 10px", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {report.payment_status || "To Be Paid"}
        </span>
      </div>

      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {moment(report.created_date).format("D MMM YYYY · HH:mm")}
      </p>

      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#eee3b4" }}>
        Total Amount: {report.total_amount_zar || "Not confirmed."}
      </p>
    </button>
  );
}