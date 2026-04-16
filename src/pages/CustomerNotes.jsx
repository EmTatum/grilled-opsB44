import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import NoteFormDialog from "../components/NoteFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import ConversationIntelligencePanel from "../components/notes/ConversationIntelligencePanel";
import CustomerNoteCard from "../components/notes/CustomerNoteCard";
import DuplicateNotesBanner from "../components/notes/DuplicateNotesBanner";
import IntelligenceReportCard from "../components/notes/IntelligenceReportCard";
import IntelligenceReportModal from "../components/notes/IntelligenceReportModal";
import { getDeduplicatedNotes, getGeneratedDuplicateSets } from "../utils/customerNotes";

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid var(--color-gold)", color: "var(--color-gold)",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease",
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
  background: "#1c191a", border: "1px solid rgba(210,156,108,0.2)", borderRadius: "2px",
  color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "14px", outline: "none",
};

export default function CustomerNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mergingDuplicates, setMergingDuplicates] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const location = useLocation();
  const load = async () => { setNotes(await base44.entities.CustomerNote.list("-created_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "1") { setEditNote(null); setFormOpen(true); }
  }, [location.search]);

  const { deduped, duplicateSets } = useMemo(() => getDeduplicatedNotes(notes), [notes]);
  const generatedDuplicateSets = useMemo(() => getGeneratedDuplicateSets(notes), [notes]);

  const filtered = useMemo(() => deduped.filter(n => {
    const matchSearch = !search || n.client_name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || n.note_type === typeFilter;
    return matchSearch && matchType;
  }), [deduped, search, typeFilter]);

  const duplicateCount = useMemo(
    () => generatedDuplicateSets.reduce((sum, group) => sum + group.length - 1, 0),
    [generatedDuplicateSets]
  );

  const intelligenceReports = useMemo(() => {
    return notes
      .filter((note) => (note.tags || []).includes("intelligence-report-v2"))
      .map((note) => {
        const payloadTag = (note.tags || []).find((tag) => typeof tag === "string" && tag.startsWith("report-data:"));
        const parsed = payloadTag ? JSON.parse(payloadTag.slice("report-data:".length)) : {};

        return {
          id: note.id,
          created_date: note.created_date,
          client_name: parsed.client_name || note.client_name,
          client_number: parsed.client_number || "Not recorded.",
          dropoff_date: parsed.dropoff_date || "Not recorded.",
          client_address: parsed.client_address || "Not recorded.",
          full_order_description: parsed.full_order_description || "Not recorded.",
          payment_method: parsed.payment_method || "Not recorded.",
          total_amount_zar: parsed.total_amount_zar || "Not confirmed.",
          payment_status: parsed.payment_status || "To Be Paid",
          behavioral_insights: parsed.behavioral_insights || "Not recorded.",
          red_flags: parsed.red_flags || "None recorded.",
          green_flags: parsed.green_flags || "None recorded.",
        };
      })
      .filter((report) => !reportSearch || report.client_name.toLowerCase().includes(reportSearch.toLowerCase()))
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  }, [notes, reportSearch]);

  const handleSave = async (data) => {
    if (editNote) await base44.entities.CustomerNote.update(editNote.id, data);
    else await base44.entities.CustomerNote.create(data);
    setEditNote(null); load();
  };
  const handleDelete = async () => { await base44.entities.CustomerNote.delete(deleteId); setDeleteId(null); load(); };

  const handleMergeDuplicates = async () => {
    if (!generatedDuplicateSets.length || mergingDuplicates) return;
    setMergingDuplicates(true);

    const duplicateIds = generatedDuplicateSets.flatMap((group) =>
      [...group]
        .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
        .slice(1)
        .map((note) => note.id)
    );

    await Promise.all(duplicateIds.map((id) => base44.entities.CustomerNote.delete(id)));
    await load();
    setMergingDuplicates(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Member Intelligence" subtitle="Circle notes, credits, debts, member intelligence, and conversation analysis">
        <GoldBtn onClick={() => { setEditNote(null); setFormOpen(true); }}><Plus size={12} /> New Note</GoldBtn>
      </PageHeader>

      <ConversationIntelligencePanel onSaved={load} />

      <DuplicateNotesBanner duplicateCount={duplicateCount} onMerge={handleMergeDuplicates} merging={mergingDuplicates} />

      <div style={{ marginBottom: "28px", background: "#111111", border: "1px solid rgba(201,168,76,0.18)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#d29c6c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Saved Intelligence Reports</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>Search by client name. Most recent dossiers appear first.</p>
          </div>
          <input
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
            placeholder="Search saved reports..."
            style={{ ...inputBase, minWidth: "280px", padding: "10px 14px" }}
            onFocus={e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(210,156,108,0.2)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {intelligenceReports.length === 0 ? (
          <div style={{ padding: "32px 0", color: "rgba(245,240,232,0.4)", fontFamily: "var(--font-body)", fontSize: "13px" }}>No saved intelligence reports found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
            {intelligenceReports.map((report) => (
              <IntelligenceReportCard key={report.id} report={report} onOpen={setSelectedReport} />
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", maxWidth: "300px" }}>
          <Search size={12} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(245,240,232,0.3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by member name."
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
            {notes.length === 0 ? "No intelligence recorded." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map(note => (
            <CustomerNoteCard
              key={note.id}
              note={note}
              onEdit={(currentNote) => { setEditNote(currentNote); setFormOpen(true); }}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} note={editNote} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Note" description="This note will be permanently removed." onConfirm={handleDelete} />
      <IntelligenceReportModal open={!!selectedReport} onOpenChange={() => setSelectedReport(null)} report={selectedReport} onDelete={async (id) => { await base44.entities.CustomerNote.delete(id); setSelectedReport(null); load(); }} />
    </div>
  );
}