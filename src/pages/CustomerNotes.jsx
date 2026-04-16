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
import { getDeduplicatedNotes, getGeneratedDuplicateSets, getIntelligenceReportViewModel, isIntelligenceReportNote, normalizePaymentStatus } from "../utils/customerNotes";

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
  const [activeReport, setActiveReport] = useState(null);

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

  const reportNotes = useMemo(() => filtered.filter(isIntelligenceReportNote), [filtered]);
  const standardNotes = useMemo(() => filtered.filter((note) => !isIntelligenceReportNote(note)), [filtered]);

  const duplicateCount = useMemo(
    () => generatedDuplicateSets.reduce((sum, group) => sum + group.length - 1, 0),
    [generatedDuplicateSets]
  );

  const handleSave = async (data) => {
    if (editNote) await base44.entities.CustomerNote.update(editNote.id, data);
    else await base44.entities.CustomerNote.create(data);
    setEditNote(null); load();
  };

  const handleReportSave = async (reportData) => {
    const content = [
      "CLIENT INFORMATION",
      `Client Name: ${reportData.client_name || "Not recorded."}`,
      `Client Number: ${reportData.client_number || "Not recorded."}`,
      `Drop-off Date: ${reportData.dropoff_date || "Not recorded."}`,
      `Client Address / Drop-off Location: ${reportData.client_address || "Not recorded."}`,
      "",
      "ORDER DETAILS",
      `${reportData.full_order_description || "Not recorded."}`,
      `Payment Method: ${reportData.payment_method || "Not recorded."}`,
      `Total Amount in ZAR: ${reportData.total_amount_zar || "Not confirmed."}`,
      `Payment Status: ${normalizePaymentStatus(reportData.payment_status, reportData.payment_method)}`,
      "",
      "CLIENT NOTES",
      `Behavioral Insights: ${reportData.behavioral_insights || "Not recorded."}`,
      `Red Flags: ${reportData.red_flags || "None recorded."}`,
      `Green Flags: ${reportData.green_flags || "None recorded."}`,
      `Action Item: ${reportData.action_item || "Not recorded."}`,
    ].join("\n");

    const currentNote = notes.find((note) => note.id === reportData.id);
    const nextTags = [
      ...(currentNote?.tags || []).filter((tag) => !String(tag).startsWith("report-data:") && !String(tag).startsWith("payment-status:")),
      `payment-status:${normalizePaymentStatus(reportData.payment_status, reportData.payment_method)}`,
      `report-data:${JSON.stringify({
        client_name: reportData.client_name || "Not recorded.",
        client_number: reportData.client_number || "Not recorded.",
        dropoff_date: reportData.dropoff_date || "Not recorded.",
        client_address: reportData.client_address || "Not recorded.",
        full_order_description: reportData.full_order_description || "Not recorded.",
        payment_method: reportData.payment_method || "Not recorded.",
        total_amount_zar: reportData.total_amount_zar || "Not confirmed.",
        payment_status: normalizePaymentStatus(reportData.payment_status, reportData.payment_method),
        behavioral_insights: reportData.behavioral_insights || "Not recorded.",
        red_flags: reportData.red_flags || "None recorded.",
        green_flags: reportData.green_flags || "None recorded.",
        action_item: reportData.action_item || "Not recorded.",
      })}`,
    ];

    await base44.entities.CustomerNote.update(reportData.id, {
      client_name: reportData.client_name,
      content,
      tags: nextTags,
      total_spend: Number(String(reportData.total_amount_zar || "").replace(/[^\d.]/g, "")) || 0,
    });

    setActiveReport(reportData);
    await load();
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

      <ConversationIntelligencePanel notes={notes} onSaved={load} />

      <DuplicateNotesBanner duplicateCount={duplicateCount} onMerge={handleMergeDuplicates} merging={mergingDuplicates} />

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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reportNotes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {reportNotes.map((note) => (
                <IntelligenceReportCard
                  key={note.id}
                  report={getIntelligenceReportViewModel(note)}
                  onOpen={setActiveReport}
                />
              ))}
            </div>
          )}

          {standardNotes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {standardNotes.map(note => (
                <CustomerNoteCard
                  key={note.id}
                  note={note}
                  onEdit={(currentNote) => { setEditNote(currentNote); setFormOpen(true); }}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} note={editNote} onSave={handleSave} />
      <IntelligenceReportModal open={!!activeReport} onOpenChange={(open) => !open && setActiveReport(null)} report={activeReport} onSave={handleReportSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Note" description="This note will be permanently removed." onConfirm={handleDelete} />
    </div>
  );
}