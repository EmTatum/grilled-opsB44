import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import WhatsAppExtractionPanel from "../components/notes/WhatsAppExtractionPanel";
import MemberIntelligenceCard from "../components/notes/MemberIntelligenceCard";
import MemberHistorySection from "../components/notes/MemberHistorySection";
import ReportContentModal from "../components/notes/ReportContentModal";
import { EXTRACTION_SCHEMA } from "../components/notes/member-intelligence-config";
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

  const normalizeClientName = (value) => String(value || "").trim().toLowerCase();

  const normalizeTimeValue = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    if (raw === "midday") return "12:00";
    const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) return `${hhmmMatch[1].padStart(2, "0")}:${hhmmMatch[2]}`;
    const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (ampmMatch) {
      let hours = Number(ampmMatch[1]);
      const minutes = ampmMatch[2] || "00";
      const meridiem = ampmMatch[3];
      if (meridiem === "pm" && hours !== 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }
    return null;
  };

  const buildCombinedDeliveryDate = (dateValue, timeValue) => {
    const dateRaw = String(dateValue || "").trim();
    const dateMatch = dateRaw.match(/\d{4}-\d{2}-\d{2}/);
    const normalizedDate = dateMatch ? dateMatch[0] : null;
    const normalizedTime = normalizeTimeValue(timeValue);
    if (normalizedDate && normalizedTime) return `${normalizedDate}T${normalizedTime}`;
    if (normalizedDate) return normalizedDate;
    return null;
  };

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
      prompt: `Extract structured data from this WhatsApp conversation for a private concierge delivery service.

RULES:
1. Never use pick up, pickup or collect — always use delivery
2. delivery_date: if date+time found, return 'YYYY-MM-DDTHH:MM'. If date only, return 'YYYY-MM-DD'. If only time with no date, return null. Today is 2026-04-24.
3. payment_status: PAID (already paid/EFT confirmed), CASH (paying cash on delivery), PENDING (not confirmed). No other values.
4. order_total: integer only, no currency symbols. R5,600 → 5600
5. cell_number: include country code. If not found, return null.
6. delivery_address: as stated in conversation. If not confirmed, return null.
7. order_list: one item per line with quantities and prices where mentioned.
8. latest_order_status: summarise whether order is confirmed, pending items, awaiting payment — based on the most recent messages.
9. order_frequency: infer from conversation — first time, repeat, referred, regular, etc.

Return JSON: { client_name, cell_number, delivery_date, delivery_address, order_list, order_total, payment_status, next_action, latest_order_status, order_frequency, sentiment_analysis, red_flags, green_flags, client_notes }

WhatsApp conversation:
${conversation}`,
      response_json_schema: EXTRACTION_SCHEMA
    });

    const rawDeliveryValue = String(result.delivery_date || "").trim();
    const combinedDeliveryDate = rawDeliveryValue.includes("T")
      ? rawDeliveryValue
      : buildCombinedDeliveryDate(rawDeliveryValue, null);

    setPreview({
      ...result,
      cell_number: result.cell_number || null,
      delivery_date: combinedDeliveryDate,
      delivery_address: result.delivery_address || null,
      order_total: parseInt(result.order_total || 0, 10) || 0,
      payment_status: result.payment_status || "PENDING"
    });
    setGenerating(false);
  };

  const savePreview = async () => {
    if (!preview || saving) return;
    setSaving(true);

    const existingNote = notes.find((note) => normalizeClientName(note.client_name) === normalizeClientName(preview.client_name));
    const combinedDeliveryDate = buildCombinedDeliveryDate(preview.delivery_date, null);
    const notePayload = {
      client_name: preview.client_name,
      note_type: "General",
      priority: existingNote?.priority || "Medium",
      content: buildCustomerNoteContent(preview),
      tags: [
        `latest-order-status:${preview.latest_order_status || "Not recorded."}`,
        `order-frequency:${preview.order_frequency || "Not recorded."}`,
        `client-notes:${preview.client_notes || "Not recorded."}`
      ],
      cell_number: preview.cell_number || "",
      delivery_date: combinedDeliveryDate || "",
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

    const existingOrder = memberOrders.find((order) => normalizeClientName(order.client_name) === normalizeClientName(preview.client_name));
    const orderPayload = {
      client_name: preview.client_name,
      cell_number: preview.cell_number || "",
      delivery_date: combinedDeliveryDate || "",
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
      delivery_date: buildCombinedDeliveryDate(draft.delivery_date, null) || "",
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
        onPreviewChange={setPreview}
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
                onSaveFollowUp={async (order, nextAction) => {
                  setMemberOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, next_action: nextAction } : item));
                  await base44.entities.MemberOrder.update(order.id, { next_action: nextAction });
                }}
                onConfirmStatus={async (order, paymentStatus) => {
                  setMemberOrders((prev) => prev.map((item) => item.id === order.id ? { ...item, payment_status: paymentStatus, order_confirmed: true } : item));
                  await base44.entities.MemberOrder.update(order.id, { payment_status: paymentStatus, order_confirmed: true });
                }}
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