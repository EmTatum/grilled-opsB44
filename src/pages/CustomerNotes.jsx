import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import MemberIntelligenceInput from "../components/notes/MemberIntelligenceInput";
import MemberOrderSummaryCard from "../components/notes/MemberOrderSummaryCard";
import FullIntelligenceReportPanel from "../components/notes/FullIntelligenceReportPanel";
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
  const [updatingReport, setUpdatingReport] = useState(false);
  const [confirmedPayments, setConfirmedPayments] = useState({});
  const [pendingSelection, setPendingSelection] = useState({});
  const [cardStatus, setCardStatus] = useState({});
  const [followUpFlags, setFollowUpFlags] = useState({});
  const [selectedReportId, setSelectedReportId] = useState(null);

  const activeOrders = useMemo(() => memberOrders.filter((record) => record.fulfilment_status !== "Fulfilled" && record.fulfilment_status !== "Cancelled"), [memberOrders]);
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
    if (!conversation.trim() || generating) return;
    setGenerating(true);

    try {
      const fullReportText = await base44.integrations.Core.InvokeLLM({
        prompt: `${FULL_REPORT_PROMPT}\n\nWhatsApp conversation:\n${conversation}`
      });

      const extraction = await base44.integrations.Core.InvokeLLM({
        prompt: `${EXTRACTION_PROMPT}\n\nWhatsApp conversation:\n${conversation}`,
        response_json_schema: EXTRACTION_SCHEMA
      });

      const cleanedClientName = cleanClientName(extraction.client_name || "");
      const jsonFields = buildStructuredFields({ ...extraction, client_name: cleanedClientName });
      const existingRecord = await findExistingByClientName(cleanedClientName);
      const payload = {
        ...jsonFields,
        intelligence_report: fullReportText
      };

      const savedRecord = existingRecord
        ? await base44.entities.MemberOrder.update(existingRecord.id, payload)
        : await base44.entities.MemberOrder.create({ ...payload, fulfilment_status: "Active" });

      setSelectedReportId(savedRecord.id);
      toast.success(`Saved for ${savedRecord.client_name}`);
    } catch {
      toast.error("Save failed — please try again");
    } finally {
      setGenerating(false);
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
    } catch {
      alert('Update failed');
    }
  };

  const handleCancelled = async (record) => {
    try {
      await base44.entities.MemberOrder.update(record.id, { fulfilment_status: 'Cancelled' });
      setCardStatus((prev) => ({ ...prev, [record.id]: 'Cancelled' }));
    } catch {
      alert('Update failed');
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

      await base44.entities.MemberOrder.update(order.id, reExtractedFields);
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
        onConversationChange={setConversation}
        onImportFile={handleImportFile}
        importMessage={importMessage}
        onGenerate={handleGenerate}
        generating={generating}
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
              />
            ))}
          </div>
        )}
      </section>

      <FullIntelligenceReportPanel
        selectedOrder={selectedOrder}
        onUpdateReport={handleUpdateReport}
        updating={updatingReport}
      />
    </div>
  );
}