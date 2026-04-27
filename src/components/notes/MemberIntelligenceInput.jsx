import React from "react";

const panelStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.22)",
  padding: "24px",
  display: "grid",
  gap: "16px"
};

const textareaStyle = {
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
  cursor: "pointer"
};

export default function MemberIntelligenceInput({ conversation, onConversationChange, onImportFile, importMessage, onGenerate, generating }) {
  return (
    <section style={panelStyle}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>WhatsApp Import & Input</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Paste chat text manually or import a .txt WhatsApp export, then generate the intelligence report.</p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <label htmlFor="member-intelligence-import" style={{ ...buttonStyle, display: "inline-flex", alignItems: "center" }}>
          Import WhatsApp Chat
        </label>
        <input id="member-intelligence-import" type="file" accept=".txt,text/plain" onChange={onImportFile} style={{ display: "none" }} />
        {importMessage && <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.78)" }}>{importMessage}</span>}
      </div>

      <textarea
        value={conversation}
        onChange={(e) => onConversationChange(e.target.value)}
        style={textareaStyle}
        placeholder="Paste the full WhatsApp conversation here..."
      />

      <button onClick={onGenerate} disabled={!conversation.trim() || generating} style={{ ...buttonStyle, opacity: !conversation.trim() || generating ? 0.6 : 1, cursor: !conversation.trim() || generating ? "default" : "pointer", justifySelf: "start" }}>
        {generating ? "Generating..." : "Generate Report"}
      </button>
    </section>
  );
}