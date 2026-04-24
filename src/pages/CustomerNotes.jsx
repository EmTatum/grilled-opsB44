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
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
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

  const loadNotes = async () => {
    const noteRecords = await base44.entities.CustomerNote.list("-updated_date", 200);
    setNotes(noteRecords || []);
  };

  const loadOrders = async () => {
    const [activeRecords, fulfilledRecords, cancelledRecords] = await Promise.all([
      base44.entities.MemberOrder.filter({ fulfilment_status: "Active" }, "delivery_date", 300),
      base44.entities.MemberOrder.filter({ fulfilment_status: "Fulfilled" }, "delivery_date", 300),
      base44.entities.MemberOrder.filter({ fulfilment_status: "Cancelled" }, "delivery_date", 300),
    ]);

    setActiveOrders(sortByDeliveryDate(activeRecords || []));
    setHistoryOrders(sortByDeliveryDate([...(fulfilledRecords || []), ...(cancelledRecords || [])]));
  };

  const load = async () => {
    await Promise.all([loadNotes(), loadOrders()]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubscribeNotes = base44.entities.CustomerNote.subscribe(() => {
      loadNotes();
    });

    const unsubscribeOrders = base44.entities.MemberOrder.subscribe(() => {
      loadOrders();
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

    const combinedDeliveryDate = buildCombinedDeliveryDate(preview.delivery_date, null);
    const reportContent = buildCustomerNoteContent(preview);
    const notePayload = {
      client_name: preview.client_name,
      note_type: "General",
      priority: "Medium",
      content: reportContent,
      tags: [
        `latest-order-status:${preview.latest_order_status || "Not recorded."}`,
        `order-frequency:${preview.order_frequency || "Not recorded."}`,
        `client-notes:${preview.client_notes || "Not recorded."}`
      ]
    };

    const existingNotes = await base44.entities.CustomerNote.filter({ client_name: preview.client_name }, "-updated_date", 1);
    const savedNote = existingNotes?.[0]
      ? await base44.entities.CustomerNote.update(existingNotes[0].id, notePayload)
      : await base44.entities.CustomerNote.create(notePayload);

    const orderPayload = {
      client_name: preview.client_name,
      cell_number: preview.cell_number || "",
      delivery_date: combinedDeliveryDate || "",
      delivery_address: preview.delivery_address || "",
      order_list: preview.order_list || "",
      order_total: parseInt(preview.order_total || 0, 10) || 0,
      payment_status: preview.payment_status,
      next_action: preview.next_action || "",
      intelligence_report_id: savedNote.id
    };

    const existingOrders = await base44.entities.MemberOrder.filter({ client_name: preview.client_name }, "-updated_date", 1);

    if (existingOrders?.[0]) {
      await base44.entities.MemberOrder.update(existingOrders[0].id, orderPayload);
    } else {
      await base44.entities.MemberOrder.create({ ...orderPayload, fulfilment_status: "Active" });
    }

    await Promise.all([loadNotes(), loadOrders()]);
    setPreview(null);
    setConversation("");
    setSaving(false);
  };

  const handleFulfilled = async (order) => {
    await base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Fulfilled" });
    await loadOrders();
  };

  const handleCancelled = async (order) => {
    await base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Cancelled" });
    await loadOrders();
  };

  const handleSaveEdit = async (draft) => {
    await base44.entities.MemberOrder.update(draft.id, {
      delivery_date: buildCombinedDeliveryDate(draft.delivery_date, null) || "",
      delivery_address: draft.delivery_address || "",
      payment_status: draft.payment_status || "PENDING",
      order_total: parseInt(draft.order_total || 0, 10) || 0,
      cell_number: draft.cell_number || "",
      next_action: draft.next_action || ""
    });
    await loadOrders();
  };

  const handleViewReport = async (order) => {
    if (order.intelligence_report_id) {
      const linked = await base44.entities.CustomerNote.filter({ id: order.intelligence_report_id }, "-updated_date", 1);
      if (linked?.[0]) {
        setSelectedNote(linked[0]);
        return;
      }
    }

    const matched = await base44.entities.CustomerNote.list("-updated_date", 200);
    const note = (matched || []).find((item) => normalizeClientName(item.client_name) === normalizeClientName(order.client_name));
    setSelectedNote(note || { client_name: order.client_name, content: "No report content found." });
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
                onViewReport={handleViewReport}
                onSaveEdit={handleSaveEdit}
                onSaveFollowUp={async (order, nextAction) => {
                  await base44.entities.MemberOrder.update(order.id, { next_action: nextAction });
                  await loadOrders();
                }}
                onConfirmStatus={async (order, paymentStatus) => {
                  await base44.entities.MemberOrder.update(order.id, { payment_status: paymentStatus, order_confirmed: true });
                  await loadOrders();
                }}
              />
            ))}
          </div>
        )}
      </section>

      <MemberHistorySection orders={historyOrders} notesById={notesById} onViewReport={handleViewReport} />

      <ReportContentModal open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)} note={selectedNote} />
    </div>
  );
}