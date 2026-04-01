import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import NoteFormDialog from "../components/NoteFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import moment from "moment";

const noteTypeColors = {
  "Credit on Account": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Debt on Account": "bg-red-500/10 text-red-400 border-red-500/20",
  "Needs Attention": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Client Retention": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "General": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

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
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Customer Notes" subtitle="CRM notes and client information">
        <Button
          onClick={() => { setEditNote(null); setFormOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} className="mr-2" /> New Note
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name..."
            className="pl-9 bg-card border-border text-foreground"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border text-foreground">
            <Filter size={14} className="mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Types</SelectItem>
            {["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-heading">{notes.length === 0 ? "No notes yet" : "No matching notes"}</p>
          <p className="text-sm mt-1">
            {notes.length === 0 ? "Add your first customer note." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{note.client_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {moment(note.created_date).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditNote(note); setFormOpen(true); }}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-md hover:bg-secondary"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${noteTypeColors[note.note_type] || noteTypeColors.General}`}>
                  {note.note_type}
                </span>
                <StatusBadge status={note.priority} />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <NoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        note={editNote}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Note"
        description="This note will be permanently removed."
        onConfirm={handleDelete}
      />
    </div>
  );
}