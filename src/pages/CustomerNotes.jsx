import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import MemberIntelligenceInput from "../components/notes/MemberIntelligenceInput";
import MemberOrderSummaryCard from "../components/notes/MemberOrderSummaryCard";
import FullIntelligenceReportPanel from "../components/notes/FullIntelligenceReportPanel";
import MemberHistoryProfilePanel from "../components/notes/MemberHistoryProfilePanel";
import { useEntityList } from "@/hooks/useEntityList";
import { EXTRACTION_PROMPT, EXTRACTION_SCHEMA, FULL_REPORT_PROMPT } from "../components/notes/member-intelligence-config";
import { cleanClientName, consolidateOrderList, normalizeClientName, normalizeDeliveryDate } from "../components/notes/memberIntelligenceUtils";

const sectionStyle = {
  display: "grid",
  gap: "16px"
};

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function CustomerNotes() {
  const { data: memberOrders, loading } = useEntityList("MemberOrder", "-updated_date", 500);
  const [conversation, setConversation] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [inputError, setInputError] = useState("");
  const [processingMessage, setProcessingMessage] = useState("");
  const [localGeneratedOrders, setLocalGeneratedOrders] = useState([]);
  const [updatingReport, setUpdatingReport] = useState(false);
  const [confirmedPayments, setConfirmedPayments] = useState({});
  const [pendingSelection, setPendingSelection] = useState({});
  const [cardStatus, setCardStatus] = useState({});
  const [followUpFlags, setFollowUpFlags] = useState({});
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [editReportRequestKey, setEditReportRequestKey] = useState(0);

  const activeOrders = useMemo(() => {
    const merged = [...localGeneratedOrders, ...memberOrders.filter((record) => !localGeneratedOrders.some((localRecord) => localRecord.id === record.id))];
    return merged.filter((record) => record.fulfilment_status !== "Fulfilled" && record.fulfilment_status !== "Cancelled");
  }, [memberOrders, localGeneratedOrders]);
  const selectedOrder = useMemo(() => activeOrders.find((order) => order.id === selectedReportId) || activeOrders[0] || null, [activeOrders, selectedReportId]);

  const findExistingByClientName = async (clientName) => {
    const records = await base44.entities.MemberOrder.list("-updated_date", 500);
    return (records || []).find((item) => normalizeClientName(item.client_name) === normalizeClientName(clientName)) || null;
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setConversation(text);
      const lineCount = text ? text.split(/\r?\n/).length : 0;
      setImportMessage(`Chat imported — ${lineCount} lines loaded.`);
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const buildStructuredFields = (result) => ({
    client_name: cleanClientName(result.client_name || ""),
    cell_number: result.cell_number || "",
    delivery_date: normalizeDeliveryDate(result.delivery_date || ""),
    delivery_address: result.delivery_address || "",
    order_list: consolidateOrderList(result.order_list || ""),
    order_total: parseInt(result.order_total || 0, 10) || 0,
    payment_status: result.payment_status || "PENDING",
    next_action: result.next_action || ""
  });

  const handleGenerate = async () => {
    if (generating) return;

    if (!conversation.trim() || conversation.trim().length < 50) {
      setInputError("Please paste or import a WhatsApp chat before generating.");
      return;
    }

    setInputError("");
    setGenerating(true);
    setProcessingMessage("Analysing chat... this takes a moment.");

    let fullReportText = "Report generation failed — please try again.";

    try {
      const reportResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `${FULL_REPORT_PROMPT}\n\nWhatsApp conversation:\n${conversation}`
      });

      if (typeof reportResponse === "string" && reportResponse.trim()) {
        fullReportText = reportResponse.trim();
      }
    } catch {
      fullReportText = "Report generation failed — please try again.";
    }

    setProcessingMessage("Extracting order details...");

    let extraction;
    try {
      extraction = await base44.integrations.Core.InvokeLLM({
        prompt: `${EXTRACTION_PROMPT}\n\nWhatsApp conversation:\n${conversation}`,
        response_json_schema: EXTRACTION_SCHEMA
      });
    } catch {
      toast.error("Extraction failed — check your chat text and try again.");
      setGenerating(false);
      setProcessingMessage("");
      return;
    }

    if (!extraction || typeof extraction !== "object" || Array.isArray(extraction)) {
      toast.error("Could not read extraction result — please try again.");
      setGenerating(false);
      setProcessingMessage("");
      return;
    }

    const cleanedClientName = cleanClientName(extraction.client_name || "");
    const jsonFields = buildStructuredFields({ ...extraction, client_name: cleanedClientName });
    const payload = {
      ...jsonFields,
      intelligence_report: fullReportText,
      fulfilment_status: "Active"
    };

    const existingLocalRecord = activeOrders.find((item) => normalizeClientName(item.client_name) === normalizeClientName(cleanedClientName));
    const temporaryId = existingLocalRecord?.id || `temp-${Date.now()}`;
    const localRecord = {
      ...existingLocalRecord,
      ...payload,
      id: temporaryId
    };

    setLocalGeneratedOrders((prev) => {
      const remaining = prev.filter((item) => normalizeClientName(item.client_name) !== normalizeClientName(cleanedClientName) && item.id !== temporaryId);
      return [localRecord, ...remaining];
    });
    setSelectedReportId(temporaryId);

    try {
      const existingRecord = await findExistingByClientName(cleanedClientName);
      const savedRecord = existingRecord
        ? await base44.entities.MemberOrder.update(existingRecord.id, payload)
        : await base44.entities.MemberOrder.create(payload);

      setLocalGeneratedOrders((prev) => {
        const remaining = prev.filter((item) => item.id !== temporaryId && normalizeClientName(item.client_name) !== normalizeClientName(cleanedClientName));
        return [savedRecord, ...remaining];
      });
      setSelectedReportId(savedRecord.id);
      toast.success(`Saved for ${savedRecord.client_name}`);
    } catch {
      toast.warning("Could not save to database — data will be lost on refresh.");
    } finally {
      setGenerating(false);
      setProcessingMessage("");
    }
  };

  const handleInlineSave = async (order, field, value) => {
    const nextValue = field === "client_name"
      ? cleanClientName(value)
      : field === "order_list"
        ? consolidateOrderList(value)
        : field === "order_total"
          ? Number(value || 0)
          : value;

    await base44.entities.MemberOrder.update(order.id, { [field]: nextValue });
  };

  const handleConfirmPayment = async (record) => {
    const selected = pendingSelection[record.id];
    if (!selected) return;
    try {
      await base44.entities.MemberOrder.update(record.id, { payment_status: selected });
      setConfirmedPayments((prev) => ({ ...prev, [record.id]: selected }));
    } catch {
      alert('Update failed — please try again');
    }
  };

  const handleFollowUp = async (order) => {
    setFollowUpFlags((prev) => ({ ...prev, [order.id]: !prev[order.id] }));
  };

  const handleFulfilled = async (record) => {
    try {
      await base44.entities.MemberOrder.update(record.id, { fulfilment_status: 'Fulfilled' });
      setCardStatus((prev) => ({ ...prev, [record.id]: 'Fulfilled' }));
      toast.success('Order fulfilled');
    } catch {
      toast.error('Update failed — please try again');
    }
  };

  const handleCancelled = async (record) => {
    try {
      await base44.entities.MemberOrder.update(record.id, { fulfilment_status: 'Cancelled' });
      setCardStatus((prev) => ({ ...prev, [record.id]: 'Cancelled' }));
      toast.success('Order cancelled');
    } catch {
      toast.error('Update failed — please try again');
    }
  };

  const handleUpdateReport = async (order, editedText) => {
    setUpdatingReport(true);
    try {
      const extraction = await base44.integrations.Core.InvokeLLM({
        prompt: `${EXTRACTION_PROMPT}\n\nWhatsApp conversation:\n${editedText}`,
        response_json_schema: EXTRACTION_SCHEMA
      });

      const reExtractedFields = {
        ...buildStructuredFields(extraction),
        intelligence_report: editedText
      };

      const updatedOrder = await base44.entities.MemberOrder.update(order.id, reExtractedFields);

      setLocalGeneratedOrders((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === order.id);
        if (existingIndex === -1) return [updatedOrder, ...prev.filter((item) => item.id !== order.id)];
        return prev.map((item) => item.id === order.id ? updatedOrder : item);
      });
      setSelectedReportId(updatedOrder.id);
      toast.success("Report and summary updated.");
      return true;
    } catch {
      toast.error("Update failed — please try again.");
      return false;
    } finally {
      setUpdatingReport(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <PageHeader title="Member Intelligence" subtitle="Generate reports from WhatsApp chats and manage live MemberOrder intelligence records." />

      <MemberIntelligenceInput
        conversation={conversation}
        onConversationChange={(value) => {
          setConversation(value);
          if (inputError) setInputError("");
        }}
        onImportFile={handleImportFile}
        importMessage={importMessage}
        onGenerate={handleGenerate}
        generating={generating}
        inputError={inputError}
        processingMessage={processingMessage}
      />

      <section style={sectionStyle}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Live MemberOrder Summary Cards</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{activeOrders.length} live records from MemberOrder.</p>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 20px", border: "1px dashed rgba(201,168,76,0.15)", background: "#111111" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.7)" }}>No live MemberOrder records yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
            {activeOrders.map((order) => (
              <MemberOrderSummaryCard
                key={order.id}
                order={order}
                confirmedPayments={confirmedPayments}
                setConfirmedPayments={setConfirmedPayments}
                pendingSelection={pendingSelection}
                setPendingSelection={setPendingSelection}
                cardStatus={cardStatus}
                followUpFlags={followUpFlags}
                onInlineSave={async (field, value) => handleInlineSave(order, field, value)}
                onConfirmPayment={handleConfirmPayment}
                onFollowUp={handleFollowUp}
                onFulfilled={handleFulfilled}
                onCancelled={handleCancelled}
                onSelectReport={(record) => setSelectedReportId(record.id)}
                onEditReport={(record) => {
                  setSelectedReportId(record.id);
                  setEditReportRequestKey(Date.now());
                }}
              />
            ))}
          </div>
        )}
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: "16px", alignItems: "start" }}>
        <FullIntelligenceReportPanel
          selectedOrder={selectedOrder}
          onUpdateReport={handleUpdateReport}
          updating={updatingReport}
          editRequestKey={editReportRequestKey}
        />
        <MemberHistoryProfilePanel
          selectedOrder={selectedOrder}
          orders={memberOrders}
        />
      </div>
    </div>
  );
}