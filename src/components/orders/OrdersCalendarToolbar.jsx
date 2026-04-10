import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function OrdersCalendarToolbar({ label, onPrev, onNext, onToday }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={onPrev} style={buttonStyle}><ChevronLeft size={14} /> Prev Month</button>
        <button onClick={onToday} style={buttonStyle}><CalendarDays size={14} /> Current Month</button>
        <button onClick={onNext} style={buttonStyle}>Next Month <ChevronRight size={14} /></button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}