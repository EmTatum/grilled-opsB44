import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import moment from "moment";
import StatusBadge from "../StatusBadge";
import { getNotePreview } from "../../utils/customerNotes";

const noteTypeAccent = {
  "Credit on Account": "#C9A84C",
  "Debt on Account": "#C2185B",
  "Needs Attention": "#C9A84C",
  "Client Retention": "rgba(245,240,232,0.55)",
  "General": "rgba(245,240,232,0.35)",
};

export default function CustomerNoteCard({ note, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const accent = noteTypeAccent[note.note_type] || noteTypeAccent.General;
  const preview = getNotePreview(note.content);

  return (
    <div
      style={{
        background: "#141414",
        borderLeft: `3px solid ${accent}`,
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderRight: "1px solid rgba(201,168,76,0.15)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        borderRadius: "2px",
        padding: "20px",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderTopColor = "rgba(201,168,76,0.4)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderTopColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 600, color: "#F5F0E8" }}>{note.client_name}</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.3)", letterSpacing: "0.1em", marginTop: "2px" }}>{moment(note.created_date).format("MMM D, YYYY")}</p>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => onEdit(note)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}><Pencil size={12} strokeWidth={1.5} /></button>
          <button onClick={() => onDelete(note.id)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}><Trash2 size={12} strokeWidth={1.5} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <span style={{ background: `${accent}18`, border: `1px solid ${accent}55`, color: accent, fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 9px", borderRadius: "2px" }}>
          {note.note_type}
        </span>
        <StatusBadge status={note.priority} />
      </div>

      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.65)", lineHeight: 1.8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2, WebkitBoxOrient: "vertical", whiteSpace: expanded ? "pre-wrap" : "normal", marginBottom: "12px" }}>
        {expanded ? note.content : preview}
      </p>

      <button onClick={() => setExpanded((prev) => !prev)} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.22)", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 12px", borderRadius: "2px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Hide Full Note" : "View Full Note"}
      </button>

      {(note.tags && note.tags.length > 0) && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
          {note.tags.map((tag, i) => (
            <span key={i} style={{ padding: "3px 8px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", color: "rgba(201,168,76,0.6)", fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {note.last_order_date && (
          <div>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>Last Order</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.5)" }}>{moment(note.last_order_date).format("D MMM YYYY")}</p>
          </div>
        )}
        {note.total_spend > 0 && (
          <div>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>Total Spend</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C", fontWeight: 600 }}>R{Number(note.total_spend).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}