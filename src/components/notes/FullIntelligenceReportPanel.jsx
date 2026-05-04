import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const panelStyle = {
  background: "var(--color-bg-secondary)",
  border: "1px solid var(--color-border-gold)",
  padding: "24px",
  display: "grid",
  gap: "14px",
  borderRadius: "6px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.06)"
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

export default function FullIntelligenceReportPanel({ selectedOrder, onUpdateReport, updating, editRequestKey }) {
  const [draft, setDraft] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraft(selectedOrder?.intelligence_report || "");
    setIsDirty(false);
    setIsEditing(false);
  }, [selectedOrder?.id, selectedOrder?.intelligence_report]);

  useEffect(() => {
    if (!selectedOrder || !editRequestKey) return;
    setIsEditing(true);
    window.requestAnimationFrame(() => {
      document.getElementById("full-intelligence-report-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [editRequestKey, selectedOrder]);

  if (!selectedOrder) {
    return (
      <section style={panelStyle}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Full Intelligence Report</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Select a live MemberOrder card to review and edit its full prose report.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="full-intelligence-report-panel" style={panelStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Full Intelligence Report</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>{selectedOrder.client_name || "Selected client"}</p>
        </div>
        <button type="button" onClick={() => setIsEditing(true)} style={buttonStyle}>
          Edit
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setIsEditing(false)} style={{ ...buttonStyle, opacity: isEditing ? 0.7 : 1 }}>
          Preview
        </button>
        <button type="button" onClick={() => setIsEditing(true)} style={{ ...buttonStyle, opacity: isEditing ? 1 : 0.7 }}>
          Edit Report
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setIsDirty(e.target.value !== (selectedOrder.intelligence_report || ""));
          }}
          style={{ width: "100%", minHeight: "260px", background: "#111111", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", padding: "14px", fontFamily: "var(--font-body)", fontSize: "14px", resize: "vertical", outline: "none" }}
        />
      ) : (
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "16px" }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: "0 0 12px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", lineHeight: 1.7 }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#F5F0E8" }}>{children}</strong>
            }}
          >
            {draft || "No report content found."}
          </ReactMarkdown>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "20px" }}>
          {isDirty && (
            <>
              <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#C9A84C", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>Unsaved changes</span>
            </>
          )}
        </div>
        <button type="button" disabled={!isDirty || updating} onClick={async () => {
          const ok = await onUpdateReport(selectedOrder, draft);
          if (ok) {
            setIsDirty(false);
            setIsEditing(false);
          }
        }} style={{ ...buttonStyle, opacity: !isDirty || updating ? 0.6 : 1, cursor: !isDirty || updating ? "default" : "pointer" }}>
          {updating ? "Updating..." : "Update Report"}
        </button>
      </div>
    </section>
  );
}