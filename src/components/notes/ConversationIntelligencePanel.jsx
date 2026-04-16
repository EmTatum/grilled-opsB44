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
    const parts = [report?.client_number, report?.dropoff_date, report?.client_address].filter((value) => value && value !== "Not recorded.");
    return parts.join(" · ");
  }, [report]);

  const analyzeConversation = async () => {
    if (!conversation.trim() || loading || saving) return;

    setLoading(true);
    const sanitizedConversation = maskSensitiveDetails(conversation);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are generating a fixed internal Grilled.inc member intelligence dossier from a pasted WhatsApp conversation.

Follow these rules exactly:
- Extract intelligence only. Do not summarize the conversation generally.
- Use a controlled, concise, operational tone.
- Declarative sentences only.
- No hype. No exclamation marks.
- Output only the requested structure. Nothing more.
- If a field is missing, use exactly the fallback required for that field.
- Payment Method may only be: Cash, EFT, or Not recorded.
- Payment Status may only be: Paid or To Be Paid.

Return exactly these three sections in this order:

SECTION 1 — CLIENT INFORMATION
- Client Name
- Client Number (phone/contact)
- Drop-off Date
- Client Address / Drop-off Location

SECTION 2 — ORDER DETAILS
- Full Order Description: every product and quantity listed line by line
- Payment Method: Cash or EFT only
- Total Amount in ZAR: calculated or mentioned total (if not stated, write exactly: Not confirmed.)
- Payment Status: Paid or To Be Paid

SECTION 3 — CLIENT NOTES
- Behavioral Insights: concise, observational, no judgment language
- Red Flags: any concerning signals from the conversation. If none, write exactly: None recorded.
- Green Flags: positive signals from the conversation. If none, write exactly: None recorded.

For Full Order Description:
- Use specifically the LAST enquiry or LAST order mentioned in the conversation.
- If earlier orders or products are mentioned but a later enquiry/order appears, ignore the earlier ones and use only the final one.
- Return a clean line-by-line list.
- Each line should follow: Product name — quantity/detail.
- No bullets, numbering, or extra labels.
- If no clear order is present, write exactly: Not recorded.

Conversation:\n${sanitizedConversation}`,
      response_json_schema: {
        type: "object",
        properties: {
          client_name: { type: "string" },
          client_number: { type: "string" },
          dropoff_date: { type: "string" },
          client_address: { type: "string" },
          full_order_description: { type: "string" },
          payment_method: { type: "string" },
          total_amount_zar: { type: "string" },
          payment_status: { type: "string" },
          behavioral_insights: { type: "string" },
          red_flags: { type: "string" },
          green_flags: { type: "string" }
        },
        required: [
          "client_name",
          "client_number",
          "dropoff_date",
          "client_address",
          "full_order_description",
          "payment_method",
          "total_amount_zar",
          "payment_status",
          "behavioral_insights",
          "red_flags",
          "green_flags"
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
        `Client Number: ${result.client_number || "Not recorded."}`,
        `Drop-off Date: ${result.dropoff_date || "Not recorded."}`,
        `Client Address / Drop-off Location: ${result.client_address || "Not recorded."}`,
        "",
        "ORDER DETAILS",
        `${result.full_order_description || "Not recorded."}`,
        `Payment Method: ${result.payment_method || "Not recorded."}`,
        `Total Amount in ZAR: ${result.total_amount_zar || "Not confirmed."}`,
        `Payment Status: ${result.payment_status || "To Be Paid"}`,
        "",
        "CLIENT NOTES",
        `Behavioral Insights: ${result.behavioral_insights || "Not recorded."}`,
        `Red Flags: ${result.red_flags || "None recorded."}`,
        `Green Flags: ${result.green_flags || "None recorded."}`,
      ].join("\n"),
      total_spend: Number(String(result.total_amount_zar || "").replace(/[^\d.]/g, "")) || 0,
      tags: [
        "intelligence-report-v2",
        `payment-status:${result.payment_status || "To Be Paid"}`,
        `report-data:${JSON.stringify({
          client_name: result.client_name || "Not recorded.",
          client_number: result.client_number || "Not recorded.",
          dropoff_date: result.dropoff_date || "Not recorded.",
          client_address: result.client_address || "Not recorded.",
          full_order_description: result.full_order_description || "Not recorded.",
          payment_method: result.payment_method || "Not recorded.",
          total_amount_zar: result.total_amount_zar || "Not confirmed.",
          payment_status: result.payment_status || "To Be Paid",
          behavioral_insights: result.behavioral_insights || "Not recorded.",
          red_flags: result.red_flags || "None recorded.",
          green_flags: result.green_flags || "None recorded.",
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
              <div><p style={fieldLabel}>Client Number</p><p style={fieldValue}>{report.client_number || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Drop-off Date</p><p style={fieldValue}>{report.dropoff_date || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Client Address / Drop-off Location</p><p style={fieldValue}>{report.client_address || "Not recorded."}</p></div>
            </div>

            <div style={reportSectionStyle}>
              <div>
                <p style={labelStyle}>Order Details</p>
                <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
              </div>
              <div><p style={fieldLabel}>Full Order Description</p><p style={{ ...fieldValue, whiteSpace: "pre-line" }}>{report.full_order_description || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Payment Method</p><p style={fieldValue}>{report.payment_method || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Total Amount in ZAR</p><p style={fieldValue}>{report.total_amount_zar || "Not confirmed."}</p></div>
              <div><p style={fieldLabel}>Payment Status</p><p style={fieldValue}>{report.payment_status || "To Be Paid"}</p></div>
            </div>
          </div>

          <div style={reportSectionStyle}>
            <div>
              <p style={labelStyle}>Client Notes</p>
              <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
            </div>
            <div><p style={fieldLabel}>Behavioral Insights</p><p style={fieldValue}>{report.behavioral_insights || "Not recorded."}</p></div>
            <div><p style={fieldLabel}>Red Flags</p><p style={fieldValue}>{report.red_flags || "None recorded."}</p></div>
            <div><p style={fieldLabel}>Green Flags</p><p style={fieldValue}>{report.green_flags || "None recorded."}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}