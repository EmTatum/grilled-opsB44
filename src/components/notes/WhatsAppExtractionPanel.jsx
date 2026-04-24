import { useMemo } from "react";
import { EXTRACTION_PROMPT } from "./member-intelligence-config";

const panelStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.22)",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const inputStyle = {
  width: "100%",
  minHeight: "240px",
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#F5F0E8",
  padding: "14px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  resize: "vertical",
  outline: "none"
};

const buttonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 24px",
  cursor: "pointer",
  alignSelf: "flex-start"
};

const previewGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px"
};

const fieldBoxStyle = {
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.16)",
  padding: "14px"
};

export default function WhatsAppExtractionPanel({ conversation, onConversationChange, onGenerate, generating, preview, onSave, saving }) {
  const previewFields = useMemo(() => preview ? [
    ["Client Name", preview.client_name || "—"],
    ["Cell Number", preview.cell_number || "—"],
    ["Delivery Date", preview.delivery_date || "—"],
    ["Delivery Address", preview.delivery_address || "—"],
    ["Payment Status", preview.payment_status || "—"],
    ["Order Total", Number(preview.order_total || 0) > 0 ? `R${Number(preview.order_total).toLocaleString("en-ZA")}` : "TBC"],
    ["Next Action", preview.next_action || "—"],
    ["Sentiment Analysis", preview.sentiment_analysis || "—"],
    ["Red Flags", preview.red_flags || "—"],
    ["Green Flags", preview.green_flags || "—"],
    ["Order List", preview.order_list || "—"]
  ] : [], [preview]);

  return (
    <section style={panelStyle}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>WhatsApp Extraction Panel</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Paste a WhatsApp conversation, extract a clean intelligence report, then review it before saving.</p>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "10px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.68)" }}>
          Paste WhatsApp Conversation
        </label>
        <textarea
          value={conversation}
          onChange={(e) => onConversationChange(e.target.value)}
          style={inputStyle}
          placeholder="Paste the full WhatsApp conversation here..."
        />
      </div>

      <button onClick={onGenerate} disabled={!conversation.trim() || generating || saving} style={{ ...buttonStyle, opacity: !conversation.trim() || generating || saving ? 0.6 : 1, cursor: !conversation.trim() || generating || saving ? "default" : "pointer" }}>
        {generating ? "Generating..." : "Generate Intelligence Report"}
      </button>

      <details style={{ border: "1px solid rgba(201,168,76,0.12)", background: "#111111" }}>
        <summary style={{ cursor: "pointer", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.62)" }}>Extraction prompt in use</summary>
        <pre style={{ margin: 0, padding: "14px", whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.7)" }}>{EXTRACTION_PROMPT}</pre>
      </details>

      {preview && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#C9A84C", letterSpacing: "0.06em", textTransform: "uppercase" }}>Preview Before Saving</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>Review the extracted fields below, then save when ready.</p>
          </div>

          <div style={previewGridStyle}>
            {previewFields.map(([label, value]) => (
              <div key={label} style={fieldBoxStyle}>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>{label}</p>
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{String(value)}</p>
              </div>
            ))}
          </div>

          <button onClick={onSave} disabled={saving} style={{ ...buttonStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}>
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>
      )}
    </section>
  );
}