import { useState } from "react";
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

export default function ConversationIntelligencePanel() {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const analyzeConversation = async () => {
    if (!conversation.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a sales intelligence assistant for a luxury retail operations team. Analyze this pasted WhatsApp conversation and return a concise structured report. Focus only on business-relevant insights.\n\nConversation:\n${conversation}`,
      response_json_schema: {
        type: "object",
        properties: {
          sentiment: { type: "string" },
          buying_intent: { type: "string" },
          summary: { type: "string" },
          key_signals: { type: "array", items: { type: "string" } },
          recommended_next_actions: { type: "array", items: { type: "string" } }
        }
      }
    });
    setReport(result);
    setLoading(false);
  };

  return (
    <div style={{ ...cardStyle, marginBottom: "28px" }}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Sales Intelligence</p>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.45)", margin: "6px 0 0" }}>Paste a WhatsApp conversation to detect sentiment, buying intent, and next steps.</p>
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

      <button
        onClick={analyzeConversation}
        disabled={loading || !conversation.trim()}
        style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "'Raleway', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 20px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Analyzing..." : "Generate Report"}
      </button>

      {report && (
        <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <div style={{ ...cardStyle, padding: "16px" }}>
            <p style={labelStyle}>Sentiment</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#C9A84C", margin: 0 }}>{report.sentiment}</p>
          </div>
          <div style={{ ...cardStyle, padding: "16px" }}>
            <p style={labelStyle}>Buying Intent</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", color: "#C9A84C", margin: 0 }}>{report.buying_intent}</p>
          </div>
          <div style={{ ...cardStyle, padding: "16px", gridColumn: "1 / -1" }}>
            <p style={labelStyle}>Summary</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.72)", lineHeight: 1.7, margin: 0 }}>{report.summary}</p>
          </div>
          <div style={{ ...cardStyle, padding: "16px" }}>
            <p style={labelStyle}>Key Signals</p>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "rgba(245,240,232,0.72)" }}>
              {(report.key_signals || []).map((item, index) => (
                <li key={index} style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", marginBottom: "8px" }}>{item}</li>
              ))}
            </ul>
          </div>
          <div style={{ ...cardStyle, padding: "16px" }}>
            <p style={labelStyle}>Recommended Next Actions</p>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "rgba(245,240,232,0.72)" }}>
              {(report.recommended_next_actions || []).map((item, index) => (
                <li key={index} style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", marginBottom: "8px" }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}