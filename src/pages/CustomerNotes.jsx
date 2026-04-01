import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import NoteFormDialog from "../components/NoteFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const noteTypeStyles = {
  "Credit on Account": { color: "hsl(145 55% 55%)", bg: "hsl(145 55% 35% / 0.1)", border: "hsl(145 55% 35% / 0.25)" },
  "Debt on Account": { color: "hsl(0 65% 60%)", bg: "hsl(0 65% 48% / 0.1)", border: "hsl(0 65% 48% / 0.25)" },
  "Needs Attention": { color: "hsl(40 80% 58%)", bg: "hsl(40 80% 50% / 0.1)", border: "hsl(40 80% 50% / 0.25)" },
  "Client Retention": { color: "hsl(333 72% 65%)", bg: "hsl(333 72% 43% / 0.1)", border: "hsl(333 72% 43% / 0.28)" },
  "General": { color: "hsl(36 10% 52%)", bg: "hsl(0 0% 16%)", border: "hsl(0 0% 22%)" },
};

const GoldButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
    style={{
      background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))",
      color: "#0a0a0a",
      fontFamily: "Inter, sans-serif",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      padding: "10px 22px",
      border: "none",
      borderRadius: "2px",
    }}
  >
    {children}
  </button>
);

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];

export default function CustomerNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadNotes = async () => {
    const data = await base44.entities.CustomerNote.list("-created_date", 100);
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => { loadNotes(); }, []);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch = !search || n.client_name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || n.note_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [notes, search, typeFilter]);

  const handleSave = async (data) => {
    if (editNote) {
      await base44.entities.CustomerNote.update(editNote.id, data);
    } else {
      await base44.entities.CustomerNote.create(data);
    }
    setEditNote(null);
    loadNotes();
  };

  const handleDelete = async () => {
    await base44.entities.CustomerNote.delete(deleteId);
    setDeleteId(null);
    loadNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: "hsl(40 57% 54% / 0.2)", borderTopColor: "hsl(40 57% 54%)" }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Client Notes" subtitle="CRM — Notes, credits, and client intelligence">
        <GoldButton onClick={() => { setEditNote(null); setFormOpen(true); }}>
          <Plus size={12} strokeWidth={2} /> New Note
        </GoldButton>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div
          className="relative flex-1 max-w-sm"
        >
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "hsl(36 10% 40%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name..."
            style={{
              width: "100%",
              background: "#161616",
              border: "1px solid hsl(40 20% 16%)",
              borderRadius: "2px",
              padding: "9px 12px 9px 34px",
              color: "hsl(36 40% 88%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.4)"}
            onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 16%)"}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            background: "#161616",
            border: "1px solid hsl(40 20% 16%)",
            borderRadius: "2px",
            padding: "9px 14px",
            color: "hsl(36 30% 75%)",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            letterSpacing: "0.04em",
            outline: "none",
            minWidth: "180px",
          }}
        >
          <option value="all">All Types</option>
          {noteTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-sm" style={{ border: "1px dashed hsl(40 20% 18%)" }}>
          <p className="font-heading" style={{ fontSize: "22px", color: "hsl(36 40% 60%)" }}>
            {notes.length === 0 ? "No notes yet" : "No matching notes"}
          </p>
          <p style={{ fontSize: "12px", color: "hsl(36 10% 40%)", marginTop: "8px", fontFamily: "Inter, sans-serif" }}>
            {notes.length === 0 ? "Add your first client note." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => {
            const ts = noteTypeStyles[note.note_type] || noteTypeStyles.General;
            return (
              <div
                key={note.id}
                className="group rounded-sm overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: "linear-gradient(160deg, #1c1c1c, #181818)",
                  border: "1px solid hsl(40 20% 16%)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "hsl(40 57% 54% / 0.28)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "hsl(40 20% 16%)"}
              >
                {/* Top accent line = note type color */}
                <div className="h-px" style={{ background: ts.color, opacity: 0.55 }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "hsl(36 40% 88%)", fontWeight: 500 }}>
                        {note.client_name}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "hsl(36 10% 40%)", marginTop: "2px" }}>
                        {moment(note.created_date).format("MMM D, YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditNote(note); setFormOpen(true); }}
                        className="p-1.5 rounded-sm transition-colors"
                        style={{ color: "hsl(36 10% 45%)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "hsl(40 57% 54%)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                      >
                        <Pencil size={12} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setDeleteId(note.id)}
                        className="p-1.5 rounded-sm transition-colors"
                        style={{ color: "hsl(36 10% 45%)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "hsl(0 65% 55%)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                      >
                        <Trash2 size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-sm uppercase"
                      style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, fontSize: "9px", letterSpacing: "0.12em", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                    >
                      {note.note_type}
                    </span>
                    <StatusBadge status={note.priority} />
                  </div>

                  <p
                    className="line-clamp-3"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "hsl(36 10% 50%)", lineHeight: 1.65 }}
                  >
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