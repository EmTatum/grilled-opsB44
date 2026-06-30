import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Spinner from "@/components/Spinner";

const priorityBadgeStyle = (priority) => {
  if (priority === "High") return { border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B", background: "rgba(194,24,91,0.08)" };
  if (priority === "Medium") return { border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C", background: "rgba(201,168,76,0.1)" };
  return { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.7)", background: "rgba(255,255,255,0.05)" };
};

const NOTE_TYPES = ["All", "Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];
const PRIORITIES = ["All", "High", "Medium", "Low"];

// Extract intelligence ID from note content markdown link
const extractIntelligenceId = (content = "") => {
  const match = content.match(/\/member-intelligence\?id=([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

// Render content with checkboxes (non-interactive display)
const NoteContent = ({ content }) => {
  const lines = (content || "").split("\n");
  return (
    <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.75)", lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (/^- \[ \]/.test(line)) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "2px 0" }}>
              <span style={{ display: "inline-block", width: "14px", height: "14px", border: "1px solid rgba(201,168,76,0.4)", borderRadius: "2px", marginTop: "3px", flexShrink: 0 }} />
              <span>{line.replace(/^- \[ \]\s*/, "")}</span>
            </div>
          );
        }
        if (/^- \[x\]/i.test(line)) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "2px 0" }}>
              <span style={{ display: "inline-block", width: "14px", height: "14px", border: "1px solid #C9A84C", borderRadius: "2px", marginTop: "3px", flexShrink: 0, background: "rgba(201,168,76,0.2)", textAlign: "center", fontSize: "10px", lineHeight: "14px", color: "#C9A84C" }}>✓</span>
              <span style={{ textDecoration: "line-through", opacity: 0.5 }}>{line.replace(/^- \[x\]\s*/i, "")}</span>
            </div>
          );
        }
        if (line === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(201,168,76,0.15)", margin: "8px 0" }} />;
        if (!line.trim()) return <div key={i} style={{ height: "6px" }} />;
        // Bold text
        const boldReplaced = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<strong style="color:#F5F0E8;font-weight:600">${m}</strong>`);
        return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
      })}
    </div>
  );
};

const NoteCard = ({ note, intelligenceRecords }) => {
  const intelId = extractIntelligenceId(note.content || "");
  // Also try to find by client_name match
  const intelMatch = intelId
    ? intelligenceRecords.find(r => r.id === intelId)
    : intelligenceRecords.find(r => (r.client_name || "").toLowerCase() === (note.client_name || "").toLowerCase());
  const intelLink = intelMatch ? `/member-intelligence?id=${intelMatch.id}` : null;

  return (
    <div style={{
      background: "#1a1a1a",
      border: "1px solid rgba(201,168,76,0.2)",
      borderRadius: "2px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "18px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {note.client_name || "Unknown Client"}
          </p>
          {note.note_type && (
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {note.note_type}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {note.priority && (
            <span style={{
              ...priorityBadgeStyle(note.priority),
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "2px",
            }}>
              {note.priority}
            </span>
          )}
          {note.created_date && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.35)" }}>
              {new Date(note.created_date).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <div style={{ borderLeft: "2px solid rgba(201,168,76,0.15)", paddingLeft: "14px" }}>
          <NoteContent content={note.content} />
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          {note.last_order_date && (
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Last Order</p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.65)" }}>
                {new Date(note.last_order_date).toLocaleDateString("en-GB")}
              </p>
            </div>
          )}
          {note.total_spend > 0 && (
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Spend</p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "#C9A84C", fontWeight: 600 }}>
                R{Number(note.total_spend).toLocaleString("en-ZA")}
              </p>
            </div>
          )}
        </div>
        {intelLink && (
          <Link
            to={intelLink}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "7px 14px",
              borderRadius: "2px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
          >
            View Intelligence
          </Link>
        )}
      </div>
    </div>
  );
};

export default function CustomerNotesViewer() {
  const [notes, setNotes] = useState([]);
  const [intelligenceRecords, setIntelligenceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchClient, setSearchClient] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    Promise.all([
      base44.entities.CustomerNote.list("-created_date", 500),
      base44.entities.MemberIntelligence.list("-updated_date", 500),
    ]).then(([n, intel]) => {
      setNotes(n || []);
      setIntelligenceRecords(intel || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return notes.filter(note => {
      if (searchClient.trim() && !(note.client_name || "").toLowerCase().includes(searchClient.toLowerCase())) return false;
      if (filterType !== "All" && note.note_type !== filterType) return false;
      if (filterPriority !== "All" && note.priority !== filterPriority) return false;
      return true;
    });
  }, [notes, searchClient, filterType, filterPriority]);

  const inputStyle = {
    background: "#1a1a1a",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "#F5F0E8",
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "2px",
    outline: "none",
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader
        title="Customer Notes"
        subtitle="Chronological intelligence notes — generated from WhatsApp imports on the Member Intelligence page."
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search client name..."
          value={searchClient}
          onChange={e => setSearchClient(e.target.value)}
          style={{ ...inputStyle, minWidth: "200px", flex: "1" }}
          onFocus={e => { e.target.style.borderColor = "#C9A84C"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.35)", whiteSpace: "nowrap" }}>
          {filtered.length} note{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.35)", letterSpacing: "0.06em" }}>
            {notes.length === 0
              ? "No notes yet — imports from Member Intelligence will appear here."
              : "No notes match the current filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map(note => (
            <NoteCard key={note.id} note={note} intelligenceRecords={intelligenceRecords} />
          ))}
        </div>
      )}
    </div>
  );
}