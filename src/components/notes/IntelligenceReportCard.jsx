import { Trash2 } from "lucide-react";
import { normalizePaymentStatus } from "../../utils/customerNotes";

const statusStyles = {
  PAID: {
    background: "#15434a",
    color: "#F5F0E8",
  },
  CASH: {
    background: "#d29c6c",
    color: "#0a0a0a",
  },
  PENDING: {
    background: "#8d201c",
    color: "#F5F0E8",
  },
};

const labelStyle = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.58)",
};

const valueStyle = {
  margin: "4px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  color: "#F5F0E8",
  lineHeight: 1.5,
};

export default function IntelligenceReportCard({ report, onOpen, onMarkFulfilled, onDelete }) {
  const normalizedStatus = normalizePaymentStatus(report.payment_status, report.payment_method);
  const badgeStyle = statusStyles[normalizedStatus];
  const isFulfilled = report.fulfilment_status === "Fulfilled";

  return (
    <div
      style={{
        width: "100%",
        textAlign: "left",
        background: "#1c191a",
        border: "1px solid rgba(201,168,76,0.22)",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
        e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.22)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <button onClick={() => onOpen(report)} style={{ background: "transparent", border: "none", padding: 0, margin: 0, textAlign: "left", cursor: "pointer", flex: 1 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, color: "#d29c6c", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {report.client_name || "Not recorded."}
          </p>
        </button>
        <button
          onClick={() => onDelete?.(report.id)}
          style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#C2185B"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(245,240,232,0.28)"; }}
          aria-label="Delete report"
        >
          <Trash2 size={12} strokeWidth={1.5} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px 18px" }}>
        <div>
          <p style={labelStyle}>Date of Delivery</p>
          <p style={valueStyle}>{report.delivery_date || "Not recorded."}</p>
        </div>
        <div>
          <p style={labelStyle}>Cell Number</p>
          <p style={valueStyle}>{report.cell_number || "Not recorded."}</p>
        </div>
        <div>
          <p style={labelStyle}>Payment Status</p>
          <span style={{ display: "inline-flex", alignItems: "center", marginTop: "6px", padding: "6px 12px", background: badgeStyle.background, color: badgeStyle.color, fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {normalizedStatus}
          </span>
        </div>
      </div>

      <div>
        <p style={labelStyle}>Action Item</p>
        <p style={{ ...valueStyle, color: "rgba(238,227,180,0.72)" }}>{report.next_action || "Not recorded."}</p>
      </div>

      <button
        onClick={() => !isFulfilled && onMarkFulfilled?.(report.memberOrder?.id)}
        disabled={isFulfilled}
        style={{
          background: "transparent",
          border: isFulfilled ? "1px solid rgba(21,67,74,0.8)" : "1px solid #C9A84C",
          color: isFulfilled ? "#7fc3cb" : "#C9A84C",
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          padding: "10px 14px",
          cursor: isFulfilled ? "default" : "pointer",
          opacity: isFulfilled ? 0.9 : 1,
          alignSelf: "flex-start"
        }}
      >
        {isFulfilled ? "Fulfilled" : "Mark Fulfilled"}
      </button>
    </div>
  );
}