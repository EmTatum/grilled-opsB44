import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import NoteFormDialog from "../components/NoteFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const noteTypeAccent = {
  "Credit on Account": "#4caf82",
  "Debt on Account": "#C2185B",
  "Needs Attention": "#C9A84C",
  "Client Retention": "#9b7fcb",
  "General": "rgba(245,240,232,0.25)",
};

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C",
    fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600,
    letterSpacing: "0.2em", textTransform: "uppercase", padding: "10px 28px",
    borderRadius: "0", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.3)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.boxShadow = "none"; }}
  >{children}</button>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const inputBase = {
  background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "0",
  color: "#F5F0E8", fontFamily: "'Raleway', sans-serif", fontSize: "13px", outline: "none",
};

export default function CustomerNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = async () => { setNotes(await base44.entities.CustomerNote.list("-created_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => notes.filter(n => {
    const matchSearch = !search || n.client_name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || n.note_type === typeFilter;
    return matchSearch && matchType;
  }), [notes, search, typeFilter]);

  const handleSave = async (data) => {
    if (editNote) await base44.entities.CustomerNote.update(editNote.id, data);
    else await base44.entities.CustomerNote.create(data);
    setEditNote(null); load();
  };
  const handleDelete = async () => { await base44.entities.CustomerNote.delete(deleteId); setDeleteId(null); load(); };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Client Notes" subtitle="CRM — Notes, credits, debts, and client intelligence">
        <GoldBtn onClick={() => { setEditNote(null); setFormOpen(true); }}><Plus size={12} /> New Note</GoldBtn>
      </PageHeader>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", maxWidth: "300px" }}>
          <Search size={12} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,240,232,0.3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client name..."
            style={{ ...inputBase, width: "100%", padding: "10px 12px 10px 32px" }}
            onFocus={e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ ...inputBase, padding: "10px 14px", minWidth: "180px", cursor: "pointer" }}
          onFocus={e => e.target.style.borderColor = "#C9A84C"}
          onBlur={e => e.target.style.borderColor = "rgba(201,168,76,0.2)"}>
          <option value="all">All Types</option>
          {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>
            {notes.length === 0 ? "No Notes Recorded" : "No Matching Notes"}
          </p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>
            {notes.length === 0 ? "Add your first client note." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(note => {
            const accent = noteTypeAccent[note.note_type] || noteTypeAccent.General;
            return (
              <div key={note.id}
                style={{
                  background: "#141414",
                  borderLeft: `3px solid ${accent}`,
                  borderTop: "1px solid rgba(201,168,76,0.15)",
                  borderRight: "1px solid rgba(201,168,76,0.15)",
                  borderBottom: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 0,
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
                    <button onClick={() => { setEditNote(note); setFormOpen(true); }} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}>
                      <Pencil size={12} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => setDeleteId(note.id)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}>
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span style={{
                    background: `${accent}18`, border: `1px solid ${accent}55`,
                    color: accent, fontFamily: "'Raleway', sans-serif",
                    fontSize: "9px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
                    padding: "4px 9px", borderRadius: "2px",
                  }}>
                    {note.note_type}
                  </span>
                  <StatusBadge status={note.priority} />
                </div>

                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.65)", lineHeight: 1.8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: "12px" }}>
                  {note.content}
                </p>
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
          })}
        </div>
      )}

      <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} note={editNote} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Note" description="This note will be permanently removed." onConfirm={handleDelete} />
    </div>
  );
}