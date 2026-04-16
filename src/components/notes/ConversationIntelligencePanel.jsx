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
  fontSize: "12px",
  color: "rgba(245,240,232,0.72)",
  lineHeight: 1.7,
  margin: 0,
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
    return notes.filter((note) => getGeneratedIntelligenceKey(note) === getGeneratedIntelligenceKey({ client_name: report?.client_snapshot?.[0] || "", tags: ["sales-intelligence", "whatsapp-analysis"] }));
  }, [notes, report]);

  const analyzeConversation = async () => {
    if (!conversation.trim()) return;
    setLoading(true);
    const sanitizedConversation = maskSensitiveDetails(conversation);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze full customer WhatsApp logs and extract only the details a salesperson or account manager needs before replying. Focus on sentiment, sentiment shifts over time, explicit preferences, inferred preferences, objections, blockers, buying intent, urgency, trust level, communication style, reliability, loyalty indicators, churn or ghosting risk, and next-best action.

Be concise, commercial, structured, and evidence-based. Do not summarize the whole chat unless necessary. Separate facts from inferences and clearly mark uncertainty. Respect chronology and patterns over time. Do not over-interpret one emotional message. Treat silence carefully and do not assume rejection unless supported. Redact or mask sensitive personal details where possible, including phone numbers, addresses, and payment details. Do not infer protected traits or make medical, legal, or criminal conclusions.

Return a scan-friendly client sheet.

Conversation:\n${sanitizedConversation}`,
      response_json_schema: {
        type: "object",
        properties: {
          client_snapshot: { type: "array", items: { type: "string" } },
          salesperson_brief: { type: "array", items: { type: "string" } },
          sentiment_profile: {
            type: "object",
            properties: {
              current: { type: "string" },
              shifts_over_time: { type: "array", items: { type: "string" } },
              trust_level: { type: "string" },
              communication_style: { type: "string" }
            }
          },
          preferences: { type: "array", items: { type: "string" } },
          objections_blockers: { type: "array", items: { type: "string" } },
          buying_signals: {
            type: "object",
            properties: {
              intent_score: { type: "number" },
              urgency_score: { type: "number" },
              trust_score: { type: "number" },
              close_probability: { type: "number" },
              signals: { type: "array", items: { type: "string" } }
            }
          },
          behavior_pattern: { type: "array", items: { type: "string" } },
          recommended_sales_approach: { type: "array", items: { type: "string" } },
          risk_flags: { type: "array", items: { type: "string" } },
          evidence_lines: { type: "array", items: { type: "string" } }
        }
      }
    });
    setReport(result);
    setLoading(false);
  };

  const saveReport = async () => {
    if (!report || saving) return;
    setSaving(true);

    const title = (report.client_snapshot?.[0] || "Client sales intelligence report").replace(/^-\s*/, "").slice(0, 120);
    const tags = ["sales-intelligence", "whatsapp-analysis"];
    const content = [
      "CLIENT SALES INTELLIGENCE REPORT",
      "",
      "Client Snapshot:",
      ...(report.client_snapshot || []).map(item => `- ${item}`),
      "",
      "Salesperson Brief:",
      ...(report.salesperson_brief || []).map(item => `- ${item}`),
      "",
      "Sentiment Profile:",
      `- Current: ${report.sentiment_profile?.current || "—"}`,
      `- Trust: ${report.sentiment_profile?.trust_level || "—"}`,
      `- Style: ${report.sentiment_profile?.communication_style || "—"}`,
      ...(report.sentiment_profile?.shifts_over_time || []).map(item => `- Shift: ${item}`),
      "",
      "Preferences:",
      ...(report.preferences || []).map(item => `- ${item}`),
      "",
      "Objections & Blockers:",
      ...(report.objections_blockers || []).map(item => `- ${item}`),
      "",
      "Buying Signals:",
      `- Intent: ${report.buying_signals?.intent_score ?? "—"}/10`,
      `- Urgency: ${report.buying_signals?.urgency_score ?? "—"}/10`,
      `- Trust: ${report.buying_signals?.trust_score ?? "—"}/10`,
      `- Close Probability: ${report.buying_signals?.close_probability ?? "—"}%`,
      ...(report.buying_signals?.signals || []).map(item => `- Signal: ${item}`),
      "",
      "Behavior Pattern:",
      ...(report.behavior_pattern || []).map(item => `- ${item}`),
      "",
      "Recommended Sales Approach:",
      ...(report.recommended_sales_approach || []).map(item => `- ${item}`),
      "",
      "Risk Flags:",
      ...(report.risk_flags || []).map(item => `- ${item}`),
      "",
      "Evidence Lines:",
      ...(report.evidence_lines || []).map(item => `- ${item}`),
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
        <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
...
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