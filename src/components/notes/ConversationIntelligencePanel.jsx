import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import ConfirmDialog from "../ConfirmDialog";
import { getGeneratedIntelligenceKey } from "../../utils/customerNotes";

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

const bodyText = {
  fontFamily: "'Raleway', sans-serif",
  fontSize: "13px",
  color: "#F5F0E8",
  lineHeight: 1.7,
  margin: 0,
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

export default function ConversationIntelligencePanel({ notes = [], onSaved }) {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const existingGeneratedNotes = useMemo(() => {
    return notes.filter((note) => getGeneratedIntelligenceKey(note) === getGeneratedIntelligenceKey({ client_name: report?.member_snapshot?.name || "", tags: ["sales-intelligence", "whatsapp-analysis"] }));
  }, [notes, report]);

  const analyzeConversation = async () => {
    if (!conversation.trim()) return;
    setLoading(true);
    const sanitizedConversation = maskSensitiveDetails(conversation);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are generating a fixed internal Grilled.inc member intelligence report from a pasted WhatsApp conversation.

Use a controlled, precise, concierge-level tone.

Follow these rules exactly:
- Extract intelligence only. Do not summarise the conversation.
- Declarative sentences only.
- No hype.
- No exclamation marks.
- If a field has no data from the conversation, write exactly: Not recorded.
- Output only the requested structure. Nothing more. Nothing less.
- Use the exact section names and field order provided below.

Return the report using this exact structure and order:

MEMBER SNAPSHOT
- Name
- Contact number
- Location / Area
- Referred by

ORDER PROFILE
- Products ordered or discussed
- Quantities
- Preferred delivery method
- Preferred delivery area or meeting point
- Any standing preferences noted

FINANCIAL STATUS
- Amount owed
- Credit on account
- Payment method used or preferred
- Any outstanding payment flag

CONCIERGE BRIEF
- How this member communicates
- Response style recommended
- Any red flags noted from the conversation
- Any green flags

NEXT ACTION
- One clear sentence stating exactly what needs to happen next with this member.

Conversation:\n${sanitizedConversation}`,
      response_json_schema: {
        type: "object",
        properties: {
          member_snapshot: {
            type: "object",
            properties: {
              name: { type: "string" },
              contact_number: { type: "string" },
              location_area: { type: "string" },
              referred_by: { type: "string" }
            },
            required: ["name", "contact_number", "location_area", "referred_by"]
          },
          order_profile: {
            type: "object",
            properties: {
              products_ordered_or_discussed: { type: "string" },
              quantities: { type: "string" },
              preferred_delivery_method: { type: "string" },
              preferred_delivery_area_or_meeting_point: { type: "string" },
              standing_preferences: { type: "string" }
            },
            required: ["products_ordered_or_discussed", "quantities", "preferred_delivery_method", "preferred_delivery_area_or_meeting_point", "standing_preferences"]
          },
          financial_status: {
            type: "object",
            properties: {
              amount_owed: { type: "string" },
              credit_on_account: { type: "string" },
              payment_method: { type: "string" },
              outstanding_payment_flag: { type: "string" }
            },
            required: ["amount_owed", "credit_on_account", "payment_method", "outstanding_payment_flag"]
          },
          concierge_brief: {
            type: "object",
            properties: {
              communication_style: { type: "string" },
              response_style_recommended: { type: "string" },
              red_flags: { type: "string" },
              green_flags: { type: "string" }
            },
            required: ["communication_style", "response_style_recommended", "red_flags", "green_flags"]
          },
          next_action: { type: "string" }
        },
        required: ["member_snapshot", "order_profile", "financial_status", "concierge_brief", "next_action"]
      }
    });
    setReport(result);
    setLoading(false);
  };

  const saveReport = async () => {
    if (!report || saving) return;
    setSaving(true);

    const title = (report.member_snapshot?.name || "Member intelligence report").replace(/^-\s*/, "").slice(0, 120);
    const tags = ["sales-intelligence", "whatsapp-analysis"];
    const content = [
      "MEMBER SNAPSHOT",
      `- Name: ${report.member_snapshot?.name || "Not recorded."}`,
      `- Contact number: ${report.member_snapshot?.contact_number || "Not recorded."}`,
      `- Location / Area: ${report.member_snapshot?.location_area || "Not recorded."}`,
      `- Referred by: ${report.member_snapshot?.referred_by || "Not recorded."}`,
      "",
      "ORDER PROFILE",
      `- Products ordered or discussed: ${report.order_profile?.products_ordered_or_discussed || "Not recorded."}`,
      `- Quantities: ${report.order_profile?.quantities || "Not recorded."}`,
      `- Preferred delivery method: ${report.order_profile?.preferred_delivery_method || "Not recorded."}`,
      `- Preferred delivery area or meeting point: ${report.order_profile?.preferred_delivery_area_or_meeting_point || "Not recorded."}`,
      `- Any standing preferences noted: ${report.order_profile?.standing_preferences || "Not recorded."}`,
      "",
      "FINANCIAL STATUS",
      `- Amount owed: ${report.financial_status?.amount_owed || "Not recorded."}`,
      `- Credit on account: ${report.financial_status?.credit_on_account || "Not recorded."}`,
      `- Payment method used or preferred: ${report.financial_status?.payment_method || "Not recorded."}`,
      `- Any outstanding payment flag: ${report.financial_status?.outstanding_payment_flag || "Not recorded."}`,
      "",
      "CONCIERGE BRIEF",
      `- How this member communicates: ${report.concierge_brief?.communication_style || "Not recorded."}`,
      `- Response style recommended: ${report.concierge_brief?.response_style_recommended || "Not recorded."}`,
      `- Any red flags noted from the conversation: ${report.concierge_brief?.red_flags || "Not recorded."}`,
      `- Any green flags: ${report.concierge_brief?.green_flags || "Not recorded."}`,
      "",
      "NEXT ACTION",
      `- ${report.next_action || "Not recorded."}`,
    ].join("\n");

    const existing = notes.find((note) => getGeneratedIntelligenceKey(note) === getGeneratedIntelligenceKey({ client_name: title, tags }));
    const payload = {
      client_name: title,
      note_type: "General",
      priority: "Medium",
      content,
      tags,
    };

    if (existing) {
      await base44.entities.CustomerNote.update(existing.id, payload);
    } else {
      await base44.entities.CustomerNote.create(payload);
    }

    setSaving(false);
    setConfirmOpen(false);
    onSaved?.();
  };

  return (
    <div style={{ ...cardStyle, marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Member Intelligence.</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)", margin: "6px 0 0" }}>Paste full WhatsApp logs to generate a concise, evidence-based member sheet before replying.</p>
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
          disabled={loading || !conversation.trim()}
          style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 20px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Analyzing..." : "Generate Report"}
        </button>
        {report && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
            style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 20px", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save Report"}
          </button>
        )}
      </div>

      {report && (
        <div style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ background: "#1c191a", borderLeft: "4px solid #d29c6c", padding: "24px 24px 24px 20px" }}>
            <p style={{ ...labelStyle, color: "#d29c6c", marginBottom: "10px" }}>Next Action</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "16px", lineHeight: 1.8, color: "#eee3b4", margin: 0 }}>
              {report.next_action || "Not recorded."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={reportSectionStyle}>
                <div>
                  <p style={labelStyle}>Member Snapshot</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div>
                  <p style={fieldLabel}>Name</p>
                  <p style={fieldValue}>{report.member_snapshot?.name || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Contact Number</p>
                  <p style={fieldValue}>{report.member_snapshot?.contact_number || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Location / Area</p>
                  <p style={fieldValue}>{report.member_snapshot?.location_area || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Referred By</p>
                  <p style={fieldValue}>{report.member_snapshot?.referred_by || "Not recorded."}</p>
                </div>
              </div>

              <div style={reportSectionStyle}>
                <div>
                  <p style={labelStyle}>Financial Status</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div>
                  <p style={fieldLabel}>Amount Owed</p>
                  <p style={fieldValue}>{report.financial_status?.amount_owed || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Credit on Account</p>
                  <p style={fieldValue}>{report.financial_status?.credit_on_account || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Payment Method Used or Preferred</p>
                  <p style={fieldValue}>{report.financial_status?.payment_method || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Outstanding Payment Flag</p>
                  <p style={fieldValue}>{report.financial_status?.outstanding_payment_flag || "Not recorded."}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={reportSectionStyle}>
                <div>
                  <p style={labelStyle}>Order Profile</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div>
                  <p style={fieldLabel}>Products Ordered or Discussed</p>
                  <p style={fieldValue}>{report.order_profile?.products_ordered_or_discussed || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Quantities</p>
                  <p style={fieldValue}>{report.order_profile?.quantities || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Preferred Delivery Method</p>
                  <p style={fieldValue}>{report.order_profile?.preferred_delivery_method || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Preferred Delivery Area or Meeting Point</p>
                  <p style={fieldValue}>{report.order_profile?.preferred_delivery_area_or_meeting_point || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Standing Preferences Noted</p>
                  <p style={fieldValue}>{report.order_profile?.standing_preferences || "Not recorded."}</p>
                </div>
              </div>

              <div style={reportSectionStyle}>
                <div>
                  <p style={labelStyle}>Concierge Brief</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div>
                  <p style={fieldLabel}>How This Member Communicates</p>
                  <p style={fieldValue}>{report.concierge_brief?.communication_style || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Response Style Recommended</p>
                  <p style={fieldValue}>{report.concierge_brief?.response_style_recommended || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Red Flags</p>
                  <p style={fieldValue}>{report.concierge_brief?.red_flags || "Not recorded."}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Green Flags</p>
                  <p style={fieldValue}>{report.concierge_brief?.green_flags || "Not recorded."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Existing Intelligence"
        description={`This will update existing intelligence for ${existingGeneratedNotes.length || 0} client${existingGeneratedNotes.length === 1 ? "" : "s"}. Continue?`}
        onConfirm={saveReport}
      />
    </div>
  );
}