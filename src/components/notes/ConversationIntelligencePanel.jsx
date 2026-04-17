import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { syncOrderFromReport } from "../../utils/intelligenceOrderSync";

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

const labelStyle = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "10px",
  fontWeight: 500,
  color: "rgba(201,168,76,0.6)",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const cardStyle = {
  background: "#141414",
  border: "1px solid rgba(201,168,76,0.18)",
  padding: "22px",
};

const fieldLabel = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "11px",
  color: "#d29c6c",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: 0,
};

const fieldValue = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "14px",
  color: "#F5F0E8",
  lineHeight: 1.7,
  margin: "4px 0 0",
};

const reportSectionStyle = {
  background: "#141414",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const maskSensitiveDetails = (text) =>
  text
    .replace(/\+?\d[\d\s\-()]{7,}\d/g, "[redacted phone]")
    .replace(/\b\d{12,19}\b/g, "[redacted payment]")
    .replace(/\b\d{3,6}\s+[A-Za-z0-9\s,.-]{6,}/g, "[redacted address]");

const replacePickupWithDelivery = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/pick\s*up/gi, "delivery")
    .replace(/pickup/gi, "delivery");
};

const sanitizeGeneratedReport = (data) => Object.fromEntries(
  Object.entries(data || {}).map(([key, value]) => [key, replacePickupWithDelivery(value)])
);

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const getUpcomingWeekday = (weekday) => {
  const today = new Date();
  const currentDay = today.getDay();
  let diff = (weekday - currentDay + 7) % 7;
  if (diff === 0) diff = 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return toIsoDate(result);
};

const normalizeDeliveryDate = (value) => {
  const raw = replacePickupWithDelivery(String(value || "")).trim();
  if (!raw || /^not recorded\.?$/i.test(raw)) return null;

  const lower = raw.toLowerCase();
  const today = new Date();

  if (lower === "today" || lower === "tonight") return toIsoDate(today);
  if (lower === "tomorrow") {
    const result = new Date(today);
    result.setDate(today.getDate() + 1);
    return toIsoDate(result);
  }

  const nextWeekdayMatch = lower.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (nextWeekdayMatch) {
    const weekdayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return getUpcomingWeekday(weekdayMap[nextWeekdayMatch[1]]);
  }

  const dayMonthMatch = lower.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)$/);
  if (dayMonthMatch && MONTHS[dayMonthMatch[2]] !== undefined) {
    const year = today.getFullYear();
    const result = new Date(year, MONTHS[dayMonthMatch[2]], Number(dayMonthMatch[1]));
    return Number.isNaN(result.getTime()) ? null : toIsoDate(result);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : toIsoDate(parsed);
};

const normalizePaymentStatusValue = (value) => {
  const lower = String(value || "").toLowerCase();
  if (lower.includes("cash")) return "CASH";
  if (lower.includes("paid") || lower.includes("eft paid") || lower.includes("to be paid")) return "PAID";
  return "PENDING";
};

const normalizeOrderTotalValue = (value) => {
  const numeric = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildReportContent = (result) => [
  "CLIENT INFORMATION",
  `Client Name: ${result.client_name || "Not recorded."}`,
  `Cell Number: ${result.cell_number || "Not recorded."}`,
  `Payment Method: ${result.payment_method || "Not recorded."}`,
  `Payment Status: ${result.payment_status || "PENDING"}`,
  "",
  "DELIVERY INFORMATION",
  `Delivery Date: ${result.delivery_date || "Not recorded."}`,
  `Delivery Address: ${result.delivery_address || "Not recorded."}`,
  "",
  "ORDER DETAILS",
  `${result.order_list || "Not recorded."}`,
  `Order Total: ${result.order_total > 0 ? `R${result.order_total.toLocaleString("en-ZA")}` : "Not confirmed."}`,
  "",
  "CLIENT SENTIMENT",
  `Sentiment Analysis: ${result.sentiment_analysis || "Not recorded."}`,
  "",
  "FLAGS",
  `Red Flags: ${result.red_flags || "None recorded."}`,
  `Green Flags: ${result.green_flags || "None recorded."}`,
  "",
  "NEXT STEPS",
  `Next Action: ${result.next_action || "Not recorded."}`,
].join("\n");

export default function ConversationIntelligencePanel({ onSaved }) {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isComposerCollapsed, setIsComposerCollapsed] = useState(false);
  const reportRef = useRef(null);

  const headerMeta = useMemo(() => {
    const parts = [report?.cell_number, report?.delivery_date, report?.delivery_address].filter((value) => value && value !== "Not recorded.");
    return parts.join(" · ");
  }, [report]);

  useEffect(() => {
    if (!savedIndicator) return undefined;
    const timeout = window.setTimeout(() => setSavedIndicator(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [savedIndicator]);

  useEffect(() => {
    if (!report || !reportRef.current) return;
    reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [report]);

  const analyzeConversation = async () => {
    if (!conversation.trim() || loading || saving) return;

    setLoading(true);
    setSavedIndicator(false);
    const sanitizedConversation = maskSensitiveDetails(conversation);

    const rawResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are generating an internal Grilled.inc intelligence dossier from a pasted WhatsApp conversation.

Your job is to extract aggressively, thoroughly, and operationally.
Treat this as intelligence work.
Pull every possible usable detail from the conversation, including implied signals when they are reasonably supported by the wording.
If a client says "same place as last time", that is a delivery address signal.
If a client says "I'll sort you out when I see you", that is a payment status signal and should usually be treated as PENDING.
Do not leave any field blank.
If a field is genuinely not present, return exactly "Not recorded." except where a different fallback is explicitly required.

Return only the requested JSON structure.
No commentary.
No markdown.
No extra keys.

EXTRACTION RULES:
- client_name: full name as referenced in the chat.
- cell_number: any phone number mentioned or visible in the conversation/header metadata.
- payment_method: must be exactly one of Cash, EFT, Bank Transfer, Crypto, or Not recorded.
- payment_status: must be exactly one of PAID, CASH, or PENDING.
  - PAID = payment clearly confirmed as received or already sent.
  - CASH = cash on delivery / cash on pickup clearly agreed.
  - PENDING = payment not confirmed, deferred, vague, or still outstanding.
- delivery_date: the delivery date/timeframe discussed, such as 23 April, tonight, tomorrow, this weekend.
- delivery_address: any physical address, suburb, landmark, meeting point, or implied repeat-location reference.
- order_list: every product and quantity mentioned from the VERY LAST time the client spoke to us about the order.
- Treat the conversation as chronological and prioritize the final exchange only for the active order.
- If earlier orders are mentioned but the last exchange contains a newer enquiry/order, ignore earlier order contents.
- order_list must be a clean line-by-line list.
- Each line must follow exactly: Product Name — Quantity.
- Do not group items.
- Do not summarise.
- If the final exchange contains no clear order, return exactly Not recorded.
- order_total: actively look for any Rand amount mentioned anywhere in the entire conversation, not only in the last exchange.
- This includes totals, amounts owed, prices mentioned in passing, shorthand like R8k, values like R16,250, and written-out amounts such as sixteen thousand.
- If any monetary value appears anywhere, extract the most relevant overall Rand amount and format it as ZAR text like R16,250.
- Only return exactly Not confirmed. if absolutely no money amount appears anywhere in the conversation.
- The words pickup and pick up must never appear in any output field. Replace them with delivery everywhere.
- sentiment_analysis: 2-3 concise sentences describing the client's tone, communication style, and attitude. Observational only.
- red_flags: concerning signals only. If none, return exactly None recorded.
- green_flags: positive signals only. If none, return exactly None recorded.
- next_action: one declarative sentence only. The single most important next team action.

Conversation:\n${sanitizedConversation}`,
      response_json_schema: {
        type: "object",
        properties: {
          client_name: { type: "string" },
          cell_number: { type: "string" },
          payment_method: { type: "string" },
          payment_status: { type: "string" },
          delivery_date: { type: "string" },
          delivery_address: { type: "string" },
          order_list: { type: "string" },
          order_total: { type: "string" },
          sentiment_analysis: { type: "string" },
          red_flags: { type: "string" },
          green_flags: { type: "string" },
          next_action: { type: "string" }
        },
        required: [
          "client_name",
          "cell_number",
          "payment_method",
          "payment_status",
          "delivery_date",
          "delivery_address",
          "order_list",
          "order_total",
          "sentiment_analysis",
          "red_flags",
          "green_flags",
          "next_action"
        ]
      }
    });

    const sanitized = sanitizeGeneratedReport(rawResult);
    const normalizedResult = {
      ...sanitized,
      client_name: (sanitized.client_name || "Client Intelligence Report").slice(0, 120),
      delivery_date: normalizeDeliveryDate(sanitized.delivery_date),
      cell_number: sanitized.cell_number || "",
      payment_status: normalizePaymentStatusValue(sanitized.payment_status),
      order_total: normalizeOrderTotalValue(sanitized.order_total),
      delivery_address: sanitized.delivery_address || "",
      order_list: sanitized.order_list || "",
      next_action: sanitized.next_action || "",
      fulfilment_status: "Active",
      total_spend: normalizeOrderTotalValue(sanitized.order_total),
    };

    setReport({
      ...normalizedResult,
      order_total: normalizedResult.order_total > 0 ? `R${normalizedResult.order_total.toLocaleString("en-ZA")}` : "Not confirmed.",
      delivery_date: normalizedResult.delivery_date || "Not recorded.",
    });
    setIsComposerCollapsed(true);
    setLoading(false);
    setSaving(true);

    const payload = {
      client_name: normalizedResult.client_name,
      note_type: "General",
      priority: "Medium",
      content: buildReportContent(normalizedResult),
      delivery_date: normalizedResult.delivery_date,
      cell_number: normalizedResult.cell_number,
      payment_status: normalizedResult.payment_status,
      order_total: normalizedResult.order_total,
      delivery_address: normalizedResult.delivery_address,
      order_list: normalizedResult.order_list,
      next_action: normalizedResult.next_action,
      fulfilment_status: "Active",
      total_spend: normalizedResult.total_spend,
      tags: [
        "intelligence-report-v3",
        `payment-status:${normalizedResult.payment_status}`,
        `report-data:${JSON.stringify({
          client_name: normalizedResult.client_name,
          cell_number: normalizedResult.cell_number || "Not recorded.",
          payment_method: sanitized.payment_method || "Not recorded.",
          payment_status: normalizedResult.payment_status,
          delivery_date: normalizedResult.delivery_date || "Not recorded.",
          delivery_address: normalizedResult.delivery_address || "Not recorded.",
          order_list: normalizedResult.order_list || "Not recorded.",
          order_total: normalizedResult.order_total > 0 ? `R${normalizedResult.order_total.toLocaleString("en-ZA")}` : "Not confirmed.",
          sentiment_analysis: sanitized.sentiment_analysis || "Not recorded.",
          red_flags: sanitized.red_flags || "None recorded.",
          green_flags: sanitized.green_flags || "None recorded.",
          next_action: normalizedResult.next_action || "Not recorded.",
        })}`,
      ],
    };

    const existingRecord = normalizedResult.delivery_date
      ? (await base44.entities.CustomerNote.filter({ client_name: normalizedResult.client_name, delivery_date: normalizedResult.delivery_date }, "-updated_date", 1))[0]
      : null;

    const savedRecord = existingRecord
      ? await base44.entities.CustomerNote.update(existingRecord.id, payload)
      : await base44.entities.CustomerNote.create(payload);
    await syncOrderFromReport({
      ...sanitized,
      ...normalizedResult,
      order_total: normalizedResult.order_total > 0 ? `R${normalizedResult.order_total.toLocaleString("en-ZA")}` : "Not confirmed.",
      delivery_date: normalizedResult.delivery_date || "Not recorded.",
    }, savedRecord.id);
    setSaving(false);
    setSavedIndicator(true);
    setConversation("");
    onSaved?.(savedRecord);
  };

  return (
    <div style={{ ...cardStyle, marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Member Intelligence.</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)", margin: "6px 0 0" }}>Paste full WhatsApp logs to generate and auto-save a structured client dossier.</p>
      </div>

      {!isComposerCollapsed ? (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>WhatsApp Conversation</label>
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste the conversation here..."
              style={{ width: "100%", minHeight: "180px", background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", padding: "14px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", resize: "vertical", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={analyzeConversation}
              disabled={loading || saving || !conversation.trim()}
              style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 20px", cursor: loading || saving ? "default" : "pointer", opacity: loading || saving ? 0.6 : 1 }}
            >
              {loading ? "Generating..." : saving ? "Auto-saving..." : "Generate Report"}
            </button>
            {(loading || saving) && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.75)", letterSpacing: "0.08em" }}>
                {loading ? "Processing conversation..." : "Saving dossier..."}
              </span>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid rgba(201,168,76,0.18)", background: "rgba(201,168,76,0.04)", marginBottom: "4px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)" }}>WhatsApp paste block minimised</p>
          <button
            onClick={() => setIsComposerCollapsed(false)}
            style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.28)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", padding: "8px 12px", cursor: "pointer" }}
          >
            New Conversation
          </button>
        </div>
      )}

      {savedIndicator && (
        <p style={{ margin: "12px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.72)", letterSpacing: "0.08em", transition: "opacity 0.3s ease" }}>
          Saved.
        </p>
      )}

      {report && (
        <div ref={reportRef} style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c", margin: 0 }}>
              {report.client_name || "Client Dossier"}
            </p>
            {headerMeta && (
              <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", letterSpacing: "0.04em", color: "#eee3b4", margin: 0 }}>
                {headerMeta}
              </p>
            )}
            <div style={{ height: "1px", width: "100%", background: "#d29c6c" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", alignItems: "start" }}>
            <div style={reportSectionStyle}>
              <div>
                <p style={labelStyle}>Client Information</p>
                <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
              </div>
              <div><p style={fieldLabel}>Client Name</p><p style={fieldValue}>{report.client_name || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Cell Number</p><p style={fieldValue}>{report.cell_number || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Payment Method</p><p style={fieldValue}>{report.payment_method || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Payment Status</p><p style={fieldValue}>{report.payment_status || "PENDING"}</p></div>
            </div>

            <div style={reportSectionStyle}>
              <div>
                <p style={labelStyle}>Order Details</p>
                <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
              </div>
              <div><p style={fieldLabel}>Delivery Date</p><p style={fieldValue}>{report.delivery_date || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Delivery Address</p><p style={{ ...fieldValue, whiteSpace: "pre-line" }}>{report.delivery_address || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Order List</p><p style={{ ...fieldValue, whiteSpace: "pre-line" }}>{report.order_list || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Order Total</p><p style={fieldValue}>{report.order_total || "Not confirmed."}</p></div>
            </div>
          </div>

          <div style={reportSectionStyle}>
            <div>
              <p style={labelStyle}>Client Notes</p>
              <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
            </div>
            <div><p style={fieldLabel}>Sentiment Analysis</p><p style={fieldValue}>{report.sentiment_analysis || "Not recorded."}</p></div>
            <div><p style={fieldLabel}>Red Flags</p><p style={fieldValue}>{report.red_flags || "None recorded."}</p></div>
            <div><p style={fieldLabel}>Green Flags</p><p style={fieldValue}>{report.green_flags || "None recorded."}</p></div>
            <div><p style={fieldLabel}>Next Action</p><p style={fieldValue}>{report.next_action || "Not recorded."}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}