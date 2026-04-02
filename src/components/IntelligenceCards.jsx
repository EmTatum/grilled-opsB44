import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

const cardBase = {
  position: "relative",
  background: "#141414",
  borderRadius: 0,
  padding: "24px 24px 0 24px",
  display: "flex",
  flexDirection: "column",
  minHeight: "200px",
  transition: "all 0.25s ease",
  overflow: "hidden",
};

const labelStyle = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  marginBottom: "14px",
};

const bigNumStyle = {
  fontFamily: "'Cinzel', serif",
  fontSize: "48px",
  fontWeight: 600,
  lineHeight: 1,
  margin: 0,
};

const subTextStyle = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.1em",
  marginTop: "6px",
};

const bottomBtnStyle = {
  marginTop: "auto",
  borderTop: "1px solid rgba(201,168,76,0.15)",
  padding: "12px 0",
  textAlign: "center",
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(201,168,76,0.6)",
  cursor: "pointer",
  background: "none",
  border: "none",
  borderTop: "1px solid rgba(201,168,76,0.15)",
  width: "100%",
  transition: "color 0.2s",
};

/* Corner bracket pseudo-elements via inline divs */
function CornerBrackets({ color = "#C9A84C", opacity = 0.5 }) {
  const c = color;
  const o = opacity;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, width: "16px", height: "16px", borderTop: `1px solid ${c}`, borderLeft: `1px solid ${c}`, opacity: o }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "16px", height: "16px", borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}`, opacity: o }} />
    </>
  );
}

/* ── Card 1: Upcoming Orders ── */
function UpcomingOrdersCard({ count }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/orders")}
      style={{ ...cardBase, border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <CornerBrackets color="#C9A84C" opacity={0.5} />
      <p style={{ ...labelStyle, color: "rgba(201,168,76,0.55)" }}>Upcoming Orders</p>
      <p style={{ ...bigNumStyle, color: "#C9A84C" }}>{count}</p>
      <p style={{ ...subTextStyle, color: "rgba(245,240,232,0.3)" }}>active orders</p>
      <button
        onClick={e => { e.stopPropagation(); navigate("/orders"); }}
        style={bottomBtnStyle}
        onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.6)"}
      >
        View Orders →
      </button>
    </div>
  );
}

/* ── Card 2: Low Stock Alert ── */
function LowStockCard({ count }) {
  const navigate = useNavigate();
  const isAlert = count > 0;
  const borderColor = isAlert ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.25)";
  const bracketColor = isAlert ? "rgba(194,24,91,0.5)" : "#C9A84C";
  const labelColor = isAlert ? "rgba(194,24,91,0.7)" : "rgba(201,168,76,0.55)";
  const numColor = isAlert ? "#C2185B" : "rgba(245,240,232,0.3)";
  const subColor = isAlert ? "rgba(194,24,91,0.6)" : "rgba(245,240,232,0.3)";
  const subText = isAlert ? "items need restocking" : "items flagged";
  const pulseStyle = isAlert ? { animation: "lowStockPulse 2s infinite" } : {};

  return (
    <>
      <style>{`@keyframes lowStockPulse { 0%,100% { box-shadow: 0 0 10px rgba(194,24,91,0.1); } 50% { box-shadow: 0 0 24px rgba(194,24,91,0.22); } }`}</style>
      <div
        onClick={() => navigate("/inventory")}
        style={{ ...cardBase, border: `1px solid ${borderColor}`, cursor: "pointer", ...pulseStyle }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = isAlert ? "rgba(194,24,91,0.85)" : "rgba(201,168,76,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; }}
      >
        <CornerBrackets color={bracketColor} opacity={0.6} />
        <p style={{ ...labelStyle, color: labelColor }}>Low Stock</p>
        <p style={{ ...bigNumStyle, color: numColor }}>{count}</p>
        <p style={{ ...subTextStyle, color: subColor }}>{subText}</p>
        <button
          onClick={e => { e.stopPropagation(); navigate("/inventory"); }}
          style={{ ...bottomBtnStyle, borderTop: isAlert ? "1px solid rgba(194,24,91,0.2)" : "1px solid rgba(201,168,76,0.15)", color: isAlert ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.6)" }}
          onMouseEnter={e => e.currentTarget.style.color = isAlert ? "#C2185B" : "#C9A84C"}
          onMouseLeave={e => e.currentTarget.style.color = isAlert ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.6)"}
        >
          Check Inventory →
        </button>
      </div>
    </>
  );
}

/* ── Card 3: Client Notes Action ── */
function ClientNotesCard() {
  const navigate = useNavigate();
  return (
    <div style={{ ...cardBase, border: "1px solid rgba(201,168,76,0.25)" }}>
      <CornerBrackets color="#C9A84C" opacity={0.5} />
      <p style={{ ...labelStyle, color: "rgba(201,168,76,0.55)" }}>Client Notes</p>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 0 16px" }}>
        <FileText size={36} strokeWidth={1} style={{ color: "rgba(201,168,76,0.25)", marginBottom: "12px" }} />
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(245,240,232,0.4)", textAlign: "center", margin: 0 }}>
          Add a new client note
        </p>
        <button
          onClick={() => navigate("/notes?new=1")}
          style={{
            marginTop: "16px",
            background: "transparent",
            border: "1px solid #C9A84C",
            color: "#C9A84C",
            fontFamily: "'Raleway', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "10px 20px",
            borderRadius: 0,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
        >
          + New Client Note
        </button>
      </div>
      <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)", padding: "10px 0", textAlign: "center" }}>
        <button
          onClick={() => navigate("/notes")}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(201,168,76,0.35)", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(201,168,76,0.7)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.35)"}
        >
          View All Notes →
        </button>
      </div>
    </div>
  );
}

export default function IntelligenceCards({ upcomingCount, lowStockCount }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "20px",
      marginBottom: "40px",
    }}
      className="intelligence-grid"
    >
      <style>{`
        @media (max-width: 900px) {
          .intelligence-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .intelligence-grid > *:last-child { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .intelligence-grid { grid-template-columns: 1fr !important; }
          .intelligence-grid > *:last-child { grid-column: auto; }
        }
      `}</style>
      <UpcomingOrdersCard count={upcomingCount} />
      <LowStockCard count={lowStockCount} />
      <ClientNotesCard />
    </div>
  );
}