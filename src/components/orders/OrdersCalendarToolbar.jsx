import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, Rows3 } from "lucide-react";

const buttonStyle = {
  background: "transparent",
  border: "1px solid rgba(201,168,76,0.3)",
  color: "#C9A84C",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

export default function OrdersCalendarToolbar({ view, onViewChange, label, onPrev, onNext, onToday }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={onPrev} style={buttonStyle}><ChevronLeft size={14} /> Prev</button>
        <button onClick={onToday} style={buttonStyle}><CalendarDays size={14} /> Today</button>
        <button onClick={onNext} style={buttonStyle}>Next <ChevronRight size={14} /></button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
        <div style={{ display: "flex", border: "1px solid rgba(201,168,76,0.2)" }}>
          <button onClick={() => onViewChange("week")} style={{ ...buttonStyle, border: "none", background: view === "week" ? "rgba(201,168,76,0.08)" : "transparent" }}><Rows3 size={14} /> Week</button>
          <button onClick={() => onViewChange("month")} style={{ ...buttonStyle, border: "none", borderLeft: "1px solid rgba(201,168,76,0.2)", background: view === "month" ? "rgba(201,168,76,0.08)" : "transparent" }}><LayoutGrid size={14} /> Month</button>
        </div>
      </div>
    </div>
  );
}