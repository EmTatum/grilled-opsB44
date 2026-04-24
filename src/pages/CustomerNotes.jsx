import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import WhatsAppExtractionPanel from "../components/notes/WhatsAppExtractionPanel";
import ActiveMemberIntelligenceSummary from "../components/notes/ActiveMemberIntelligenceSummary";
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
  const [historyOrders, setHistoryOrders] = useState([]);
  const [activeSummaryRefreshKey, setActiveSummaryRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState("");
  const [preview, setPreview] = useState(null);
  const [savedPreviewOrderId, setSavedPreviewOrderId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const normalizeClientName = (value) => String(value || "").trim().toLowerCase();

  const buildNotePayload = (report) => ({
    client_name: report.client_name,
    note_type: "General",
    priority: "Medium",
    content: buildCustomerNoteContent(report),
    tags: [
      `latest-order-status:${report.latest_order_status || "Not recorded."}`,
      `order-frequency:${report.order_frequency || "Not recorded."}`,
      `client-notes:${report.client_notes || "Not recorded."}`
    ]
  });

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
    const allOrders = await base44.entities.MemberOrder.list("delivery_date", 500);
    const liveOrders = allOrders || [];

    setHistoryOrders(sortByDeliveryDate(liveOrders.filter((order) => order.fulfilment_status === "Fulfilled" || order.fulfilment_status === "Cancelled")));
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
    setSaving(true);
    setSaveMessage("");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract structured data from this WhatsApp conversation for a private concierge delivery service.

RULES:
1. Never use pick up, pickup or collect — always use delivery
2. delivery_date: if date+time found, return 'YYYY-MM-DDTHH:MM'. If date only, return 'YYYY-MM-DD'. If only time with no date, return null. Today is 2026-04-24.
3. payment_status: PAID (already paid/EFT confirmed), CASH (paying cash on delivery), PENDING (not confirmed). No other values.
4. order_total: integer only, no currency symbols. R5,600 → 5600
5. ORDER EXTRACTION RULE: WhatsApp conversations often contain multiple orders or order revisions over time. You must extract ONLY the most recent, final confirmed order — the last version of what the client wants, based on the chronological order of messages. If a client first orders item A, then later adds item B, or changes their order entirely, use only the final order as it stands at the end of the conversation. Do not combine old and new orders. Do not use the first order mentioned if it was subsequently changed or added to. The order_list must reflect what was confirmed in the LAST order discussion in the chat.
6. cell_number: include country code. If not found, return null.
6. delivery_address: as stated in conversation. If not confirmed, return null.
7. order_list: one item per line with quantities and prices where mentioned.
8. latest_order_status: summarise whether order is confirmed, pending items, awaiting payment — based on the most recent messages.
9. order_frequency: infer from conversation — first time, repeat, referred, regular, etc.

Return JSON: { client_name, cell_number, delivery_date, delivery_address, order_list, order_total, payment_status, next_action, latest_order_status, order_frequency, sentiment_analysis, red_flags, green_flags, client_notes }

WhatsApp conversation:
${conversation}`,
      response_json_schema: EXTRACTION_SCHEMA
    });

    const extractedData = {
      ...result,
      cell_number: result.cell_number || null,
      delivery_date: String(result.delivery_date || "").trim().includes("T")
        ? String(result.delivery_date || "").trim()
        : buildCombinedDeliveryDate(result.delivery_date, null),
      delivery_address: result.delivery_address || null,
      order_total: parseInt(result.order_total || 0, 10) || 0,
      payment_status: result.payment_status || "PENDING"
    };

    const notePayload = buildNotePayload(extractedData);

    const existingOrders = await base44.entities.MemberOrder.filter({ client_name: extractedData.client_name }, "-updated_date", 1);
    const linkedNoteId = existingOrders?.[0]?.intelligence_report_id || null;
    const savedNote = linkedNoteId
      ? await base44.entities.CustomerNote.update(linkedNoteId, notePayload)
      : (await base44.entities.CustomerNote.filter({ client_name: extractedData.client_name }, "-updated_date", 1))?.[0]
        ? await base44.entities.CustomerNote.update((await base44.entities.CustomerNote.filter({ client_name: extractedData.client_name }, "-updated_date", 1))[0].id, notePayload)
        : await base44.entities.CustomerNote.create(notePayload);

    const orderPayload = {
      client_name: extractedData.client_name,
      cell_number: extractedData.cell_number || "",
      delivery_date: extractedData.delivery_date || "",
      delivery_address: extractedData.delivery_address || "",
      order_list: extractedData.order_list || "",
      order_total: parseInt(extractedData.order_total || 0, 10) || 0,
      payment_status: extractedData.payment_status,
      next_action: extractedData.next_action || "",
      intelligence_report_id: savedNote.id,
      fulfilment_status: "Active"
    };

    const savedOrder = existingOrders?.[0]
      ? await base44.entities.MemberOrder.update(existingOrders[0].id, orderPayload)
      : await base44.entities.MemberOrder.create(orderPayload);

    setActiveSummaryRefreshKey((current) => current + 1);
    await loadOrders();
    setSavedPreviewOrderId(savedOrder.id);
    setPreview({ ...extractedData, intelligence_report_id: savedNote.id, id: savedOrder.id });
    setSaveMessage(`Report saved for ${extractedData.client_name}`);
    await loadNotes();
    setGenerating(false);
    setSaving(false);
  };

  const handleFulfilled = async (order) => {
    const updatedOrder = await base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Fulfilled" });
    setHistoryOrders((current) => sortByDeliveryDate([updatedOrder, ...current.filter((item) => item.id !== order.id)]));
    return updatedOrder;
  };

  const handleCancelled = async (order) => {
    const updatedOrder = await base44.entities.MemberOrder.update(order.id, { fulfilment_status: "Cancelled" });
    setHistoryOrders((current) => sortByDeliveryDate([updatedOrder, ...current.filter((item) => item.id !== order.id)]));
    return updatedOrder;
  };

  const handleSaveEdit = async (draft) => {
    const updatedOrder = await base44.entities.MemberOrder.update(draft.id, {
      delivery_date: buildCombinedDeliveryDate(draft.delivery_date, null) || "",
      delivery_address: draft.delivery_address || "",
      payment_status: draft.payment_status || "PENDING",
      order_total: parseInt(draft.order_total || 0, 10) || 0,
      cell_number: draft.cell_number || "",
      next_action: draft.next_action || ""
    });

    if (updatedOrder.intelligence_report_id) {
      await base44.entities.CustomerNote.update(updatedOrder.intelligence_report_id, buildNotePayload({
        ...preview,
        ...draft,
        delivery_date: buildCombinedDeliveryDate(draft.delivery_date, null) || "",
        payment_status: draft.payment_status || "PENDING",
        order_total: parseInt(draft.order_total || 0, 10) || 0,
        cell_number: draft.cell_number || "",
        next_action: draft.next_action || ""
      }));
    }

    return updatedOrder;
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
        onPreviewChange={(updater) => {
          const nextPreview = typeof updater === "function" ? updater(preview) : updater;
          setPreview(nextPreview);
        }}
        saving={saving}
        saveMessage={saveMessage}
      />

      <ActiveMemberIntelligenceSummary
        notesById={notesById}
        refreshKey={activeSummaryRefreshKey}
        onFulfilled={async (order) => {
          const updatedOrder = await handleFulfilled(order);
          setActiveSummaryRefreshKey((current) => current + 1);
          return updatedOrder;
        }}
        onCancelled={async (order) => {
          const updatedOrder = await handleCancelled(order);
          setActiveSummaryRefreshKey((current) => current + 1);
          return updatedOrder;
        }}
        onViewReport={handleViewReport}
        onSaveEdit={async (draft) => {
          const updatedOrder = await handleSaveEdit(draft);
          if (updatedOrder.id === savedPreviewOrderId) {
            setPreview((current) => current ? ({
              ...current,
              delivery_date: updatedOrder.delivery_date || current.delivery_date,
              delivery_address: updatedOrder.delivery_address || "",
              payment_status: updatedOrder.payment_status || "PENDING",
              order_total: updatedOrder.order_total || 0,
              cell_number: updatedOrder.cell_number || "",
              next_action: updatedOrder.next_action || ""
            }) : current);
          }
          setActiveSummaryRefreshKey((current) => current + 1);
          return updatedOrder;
        }}
        onSaveFollowUp={async (order, nextAction) => {
          const updatedOrder = await base44.entities.MemberOrder.update(order.id, { next_action: nextAction });
          setActiveSummaryRefreshKey((current) => current + 1);
          return updatedOrder;
        }}
        onConfirmStatus={async (order, paymentStatus) => {
          const updatedOrder = await base44.entities.MemberOrder.update(order.id, { payment_status: paymentStatus, order_confirmed: true });
          setActiveSummaryRefreshKey((current) => current + 1);
          return updatedOrder;
        }}
      />

      <MemberHistorySection orders={historyOrders} notesById={notesById} onViewReport={handleViewReport} />

      <ReportContentModal open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)} note={selectedNote} />
    </div>
  );
}