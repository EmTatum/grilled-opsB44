import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

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

export default function ConversationIntelligencePanel({ onSaved }) {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);

  const headerMeta = useMemo(() => {
    const parts = [report?.cell_number, report?.delivery_date, report?.delivery_address].filter((value) => value && value !== "Not recorded.");
    return parts.join(" · ");
  }, [report]);

  const analyzeConversation = async () => {
    if (!conversation.trim() || loading || saving) return;

    setLoading(true);
    const sanitizedConversation = maskSensitiveDetails(conversation);

    const result = await base44.integrations.Core.InvokeLLM({
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
- delivery_date: the delivery or pickup date/timeframe discussed, such as 23 April, tonight, tomorrow, this weekend.
- delivery_address: any physical address, suburb, landmark, meeting point, or implied repeat-location reference.
- order_list: every product and quantity mentioned from the VERY LAST time the client spoke to us about the order.
- Treat the conversation as chronological and prioritize the final exchange only for the active order.
- If earlier orders are mentioned but the last exchange contains a newer enquiry/order, ignore earlier order contents.
- order_list must be a clean line-by-line list.
- Each line must follow exactly: Product Name — Quantity.
- Do not group items.
- Do not summarise.
- If the final exchange contains no clear order, return exactly Not recorded.
- order_total: use the exact total in ZAR if mentioned or reasonably calculable from the conversation. If not, return exactly Not confirmed.
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

    setReport(result);
    setLoading(false);
    setSaving(true);

    const payload = {
      client_name: (result.client_name || "Client Intelligence Report").slice(0, 120),
      note_type: "General",
      priority: "Medium",
      content: [
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
        `Order Total: ${result.order_total || "Not confirmed."}`,
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
      ].join("\n"),
      total_spend: Number(String(result.order_total || "").replace(/[^\d.]/g, "")) || 0,
      tags: [
        "intelligence-report-v3",
        `payment-status:${result.payment_status || "PENDING"}`,
        `report-data:${JSON.stringify({
          client_name: result.client_name || "Not recorded.",
          cell_number: result.cell_number || "Not recorded.",
          payment_method: result.payment_method || "Not recorded.",
          payment_status: result.payment_status || "PENDING",
          delivery_date: result.delivery_date || "Not recorded.",
          delivery_address: result.delivery_address || "Not recorded.",
          order_list: result.order_list || "Not recorded.",
          order_total: result.order_total || "Not confirmed.",
          sentiment_analysis: result.sentiment_analysis || "Not recorded.",
          red_flags: result.red_flags || "None recorded.",
          green_flags: result.green_flags || "None recorded.",
          next_action: result.next_action || "Not recorded.",
        })}`,
      ],
    };

    await base44.entities.CustomerNote.create(payload);
    setSaving(false);
    onSaved?.();
  };

  return (
    <div style={{ ...cardStyle, marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Member Intelligence.</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)", margin: "6px 0 0" }}>Paste full WhatsApp logs to generate and auto-save a structured client dossier.</p>
      </div>

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

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={analyzeConversation}
          disabled={loading || saving || !conversation.trim()}
          style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 20px", cursor: loading || saving ? "default" : "pointer", opacity: loading || saving ? 0.6 : 1 }}
        >
          {loading ? "Generating..." : saving ? "Auto-saving..." : "Generate Report"}
        </button>
      </div>

      {report && (
        <div style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
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