import { CheckSquare, Download, XCircle } from "lucide-react";

const buttonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "10px 16px",
  borderRadius: "2px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const dangerButtonStyle = {
  ...buttonStyle,
  border: "1px solid rgba(194,24,91,0.6)",
  color: "#C2185B",
};

export default function BulkActionsBar({ selectedCount, onMarkFulfilled, onMarkCancelled, onExport }) {
  if (!selectedCount) return null;

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      padding: "14px 18px",
      borderBottom: "1px solid rgba(201,168,76,0.2)",
      background: "rgba(201,168,76,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CheckSquare size={14} style={{ color: "#C9A84C" }} />
        <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,240,232,0.72)" }}>
          {selectedCount} selected
        </span>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={onMarkFulfilled} style={buttonStyle}>
          <CheckSquare size={12} /> Mark fulfilled
        </button>
        <button onClick={onMarkCancelled} style={dangerButtonStyle}>
          <XCircle size={12} /> Mark cancelled
        </button>
        <button onClick={onExport} style={buttonStyle}>
          <Download size={12} /> Export PDF
        </button>
      </div>
    </div>
  );
}