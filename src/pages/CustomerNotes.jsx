import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import NoteFormDialog from "../components/NoteFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const noteTypeColors = {
  "Credit on Account": { color: "rgba(120,200,140,0.85)", border: "rgba(120,200,140,0.3)", bg: "rgba(120,200,140,0.06)" },
  "Debt on Account": { color: "#C2185B", border: "rgba(194,24,91,0.35)", bg: "rgba(194,24,91,0.06)" },
  "Needs Attention": { color: "#C9A84C", border: "rgba(201,168,76,0.4)", bg: "rgba(201,168,76,0.06)" },
  "Client Retention": { color: "rgba(180,140,220,0.85)", border: "rgba(180,140,220,0.3)", bg: "rgba(180,140,220,0.05)" },
  "General": { color: "rgba(245,240,232,0.5)", border: "rgba(245,240,232,0.12)", bg: "rgba(255,255,255,0.03)" },
};

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
    transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
  >{children}</button>
);

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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const inputBase = {
    background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px",
    color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none",
  };

  return (
    <div>
      <PageHeader title="Client Notes" subtitle="CRM — Notes, credits, and client intelligence">
        <GoldBtn onClick={() => { setEditNote(null); setFormOpen(true); }}><Plus size={13} /> New Note</GoldBtn>
      </PageHeader>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", maxWidth: "320px" }}>
          <Search size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,240,232,0.3)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name..."
            style={{ ...inputBase, width: "100%", padding: "10px 12px 10px 34px" }}
            onFocus={e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ ...inputBase, padding: "10px 14px", minWidth: "180px", cursor: "pointer" }}
          onFocus={e => { e.target.style.borderColor = "#C9A84C"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; }}>
          <option value="all">All Types</option>
          {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.2)", borderRadius: "2px" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "22px", color: "rgba(201,168,76,0.5)" }}>
            {notes.length === 0 ? "No notes yet" : "No matching notes"}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.3)", marginTop: "8px" }}>
            {notes.length === 0 ? "Add your first client note." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(note => {
            const ts = noteTypeColors[note.note_type] || noteTypeColors.General;
            return (
              <div key={note.id}
                style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", overflow: "hidden", transition: "all 0.25s ease" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Top stripe */}
                <div style={{ height: "2px", background: ts.color, opacity: 0.6 }} />
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#F5F0E8", fontWeight: 500 }}>{note.client_name}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(245,240,232,0.3)", marginTop: "3px" }}>{moment(note.created_date).format("MMM D, YYYY")}</p>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => { setEditNote(note); setFormOpen(true); }}
                        style={{ padding: "5px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.3)", transition: "color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.3)"}>
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setDeleteId(note.id)}
                        style={{ padding: "5px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.3)", transition: "color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.3)"}>
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "2px" }}>
                      {note.note_type}
                    </span>
                    <StatusBadge status={note.priority} />
                  </div>

                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.55)", lineHeight: 1.65, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {note.content}
                  </p>
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