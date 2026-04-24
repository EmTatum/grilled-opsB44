import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import WhatsAppExtractionPanel from "../components/notes/WhatsAppExtractionPanel";
import MemberIntelligenceCard from "../components/notes/MemberIntelligenceCard";
import MemberHistorySection from "../components/notes/MemberHistorySection";
import ReportContentModal from "../components/notes/ReportContentModal";
import { EXTRACTION_PROMPT, EXTRACTION_SCHEMA } from "../components/notes/member-intelligence-config";
import { buildCustomerNoteContent, sortByDeliveryDate } from "../components/notes/memberIntelligenceUtils";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function CustomerNotes() {
  const [notes, setNotes] = useState([]);
  const [memberOrders, setMemberOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState("");
  const [preview, setPreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const load = async () => {
    const [noteRecords, memberOrderRecords] = await Promise.all([
      base44.entities.CustomerNote.list("-updated_date", 200),
      base44.entities.MemberOrder.list("-updated_date", 300),
    ]);
    setNotes(noteRecords || []);
    setMemberOrders(memberOrderRecords || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubscribeNotes = base44.entities.CustomerNote.subscribe((event) => {
      if (event.type === "create") setNotes((prev) => [event.data, ...prev.filter((note) => note.id !== event.data.id)]);
      if (event.type === "update") setNotes((prev) => prev.map((note) => (note.id === event.id ? event.data : note)));
      if (event.type === "delete") setNotes((prev) => prev.filter((note) => note.id !== event.id));
    });

    const unsubscribeOrders = base44.entities.MemberOrder.subscribe((event) => {
      if (event.type === "create") setMemberOrders((prev) => [event.data, ...prev.filter((order) => order.id !== event.data.id)]);
      if (event.type === "update") setMemberOrders((prev) => prev.map((order) => (order.id === event.id ? event.data : order)));
      if (event.type === "delete") setMemberOrders((prev) => prev.filter((order) => order.id !== event.id));
    });

    return () => {
      unsubscribeNotes();
      unsubscribeOrders();
    };
  }, []);

  const notesById = useMemo(() => notes.reduce((acc, note) => {
    acc[note.id] = note;
    return acc;
  }, {}), [notes]);

  const activeOrders = useMemo(() => sortByDeliveryDate(memberOrders.filter((order) => order.fulfilment_status === "Active")), [memberOrders]);
  const historyOrders = useMemo(() => sortByDeliveryDate(memberOrders.filter((order) => order.fulfilment_status === "Fulfilled" || order.fulfilment_status === "Cancelled")), [memberOrders]);

  const generatePreview = async () => {
    if (!conversation.trim() || generating || saving) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${EXTRACTION_PROMPT}\n\nWhatsApp conversation:\n${conversation}`,
      response_json_schema: EXTRACTION_SCHEMA
    });
    setPreview({
      ...result,
      delivery_date: result.delivery_date || null,
      delivery_address: result.delivery_address || null,
      order_total: Number(result.order_total || 0),
      payment_status: result.payment_status || "PENDING"
    });
    setGenerating(false);
  };

  const savePreview = async () => {
    if (!preview || saving) return;
    setSaving(true);

    const existingNote = notes.find((note) => note.client_name === preview.client_name);
    const notePayload = {
      client_name: preview.client_name,
      note_type: "General",
      priority: existingNote?.priority || "Medium",
      content: buildCustomerNoteContent(preview),
      cell_number: preview.cell_number,
      delivery_date: preview.delivery_date || "",
      delivery_address: preview.delivery_address || "",
      order_list: preview.order_list || "",
      order_total: Number(preview.order_total || 0),
      payment_status: preview.payment_status,
      next_action: preview.next_action || "",
      total_spend: Number(preview.order_total || 0),
      fulfilment_status: existingNote?.fulfilment_status || "Active"
    };

    const savedNote = existingNote
      ? await base44.entities.CustomerNote.update(existingNote.id, notePayload)
      : await base44.entities.CustomerNote.create(notePayload);

    const existingOrder = memberOrders.find((order) => order.intelligence_report_id === savedNote.id);
    const orderPayload = {
      client_name: preview.client_name,
      cell_number: preview.cell_number,
      delivery_date: preview.delivery_date || "",
      delivery_address: preview.delivery_address || "",
      order_list: preview.order_list || "",
      order_total: Number(preview.order_total || 0),
      payment_status: preview.payment_status,
      next_action: preview.next_action || "",
      intelligence_report_id: savedNote.id,
      ...(existingOrder ? {} : { fulfilment_status: "Active" })
    };

    if (existingOrder) await base44.entities.MemberOrder.update(existingOrder.id, orderPayload);
    else await base44.entities.MemberOrder.create(orderPayload);

    setPreview(null);
    setConversation("");
    setSaving(false);
  };

  const handleFulfilled = async (order, note) => {
    setMemberOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, fulfilment_status: "Fulfilled" } : item));
    if (note) setNotes((prev) => prev.map((item) => item.id === note.id ? { ...item, priority: "Low" } : item));
    await Promise.all([
      base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Fulfilled" }),
      note ? base44.entities.CustomerNote.update(note.id, { priority: "Low" }) : Promise.resolve()
    ]);
  };

  const handleCancelled = async (order) => {
    setMemberOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, fulfilment_status: "Cancelled" } : item));
    await base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Cancelled" });
  };

  const handleSaveEdit = async (draft) => {
    setMemberOrders((prev) => prev.map((item) => item.id === draft.id ? { ...item, ...draft } : item));
    await base44.entities.MemberOrder.update(draft.id, {
      delivery_date: draft.delivery_date || "",
      delivery_address: draft.delivery_address || "",
      payment_status: draft.payment_status || "PENDING",
      order_total: Number(draft.order_total || 0),
      next_action: draft.next_action || ""
    });
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader title="Member Intelligence" subtitle="Extract, review, manage active member orders, and track archived delivery history." />

      <WhatsAppExtractionPanel
        conversation={conversation}
        onConversationChange={setConversation}
        onGenerate={generatePreview}
        generating={generating}
        preview={preview}
        onSave={savePreview}
        saving={saving}
      />

      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Active Member Intelligence Summary</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{activeOrders.length} active orders sorted by delivery date</p>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "rgba(201,168,76,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>No Active Member Orders</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {activeOrders.map((order) => (
              <MemberIntelligenceCard
                key={order.id}
                order={order}
                note={notesById[order.intelligence_report_id] || null}
                onFulfilled={handleFulfilled}
                onCancelled={handleCancelled}
                onViewReport={setSelectedNote}
                onSaveEdit={handleSaveEdit}
              />
            ))}
          </div>
        )}
      </section>

      <MemberHistorySection orders={historyOrders} />

      <ReportContentModal open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)} note={selectedNote} />
    </div>
  );
}