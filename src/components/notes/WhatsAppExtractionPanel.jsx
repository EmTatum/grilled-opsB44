import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
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
  padding: "14px",
  cursor: "pointer"
};

const inlineInputStyle = {
  width: "100%",
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.28)",
  color: "#F5F0E8",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  outline: "none"
};

export default function WhatsAppExtractionPanel({ conversation, onConversationChange, onGenerate, generating, preview, onPreviewChange, saving, saveMessage }) {
  const [editingField, setEditingField] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      onConversationChange(text);
      const lineCount = text ? text.split(/\r?\n/).length : 0;
      setImportMessage(`Chat imported — ${lineCount} lines loaded`);
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  const previewFields = useMemo(() => preview ? [
    { key: "client_name", label: "Client Name", value: preview.client_name || "", type: "text" },
    { key: "cell_number", label: "Cell Number", value: preview.cell_number || "", type: "text" },
    { key: "delivery_date", label: "Delivery Date", value: preview.delivery_date || "", type: "text" },
    { key: "delivery_address", label: "Delivery Address", value: preview.delivery_address || "", type: "text" },
    { key: "payment_status", label: "Payment Status", value: preview.payment_status || "PENDING", type: "select" },
    { key: "order_total", label: "Order Total", value: preview.order_total ?? 0, type: "number" },
    { key: "order_list", label: "Order List", value: preview.order_list || "", type: "textarea" },
    { key: "next_action", label: "Next Action", value: preview.next_action || "", type: "text" },
    { key: "latest_order_status", label: "Latest Order Status", value: preview.latest_order_status || "", type: "text" },
    { key: "red_flags", label: "Red Flags", value: preview.red_flags || "", type: "text" },
    { key: "green_flags", label: "Green Flags", value: preview.green_flags || "", type: "text" },
  ] : [], [preview]);

  const updatePreviewField = (key, value) => {
    onPreviewChange((current) => ({ ...current, [key]: key === "order_total" ? Number(value || 0) : value }));
  };

  return (
    <section style={panelStyle}>
      <div>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>WhatsApp Extraction Panel</p>
        <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>Paste a WhatsApp conversation, extract a clean intelligence report, and save it immediately.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <label htmlFor="whatsapp-import" style={{ ...buttonStyle, alignSelf: "unset", display: "inline-flex", alignItems: "center" }}>
            📎 Import WhatsApp Export
          </label>
          <input id="whatsapp-import" type="file" accept=".txt,text/plain" onChange={handleImportFile} style={{ display: "none" }} />
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.45)" }}>Accepts WhatsApp .txt export files</p>
        </div>

        {importMessage && (
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.78)" }}>{importMessage}</p>
        )}

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
      </div>

      <button onClick={onGenerate} disabled={!conversation.trim() || generating || saving} style={{ ...buttonStyle, opacity: !conversation.trim() || generating || saving ? 0.6 : 1, cursor: !conversation.trim() || generating || saving ? "default" : "pointer" }}>
        {generating ? "Generating..." : "GENERATE INTELLIGENCE REPORT"}
      </button>

      <details style={{ border: "1px solid rgba(201,168,76,0.12)", background: "#111111" }}>
        <summary style={{ cursor: "pointer", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.62)" }}>Extraction prompt in use</summary>
        <pre style={{ margin: 0, padding: "14px", whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.7)" }}>{EXTRACTION_PROMPT}</pre>
      </details>

      {preview && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {saveMessage && (
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#86efac" }}>{saveMessage}</p>
          )}
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "22px", color: "#C9A84C", letterSpacing: "0.06em", textTransform: "uppercase" }}>Saved Intelligence Preview</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>The extracted data has been saved. Use the pencil icons to correct any field immediately.</p>
          </div>

          <div style={previewGridStyle}>
            {previewFields.map((field) => {
              const isEditing = editingField === field.key;
              const displayValue = field.type === "number"
                ? Number(field.value || 0) > 0 ? `R${Number(field.value).toLocaleString("en-ZA")}` : "0"
                : (field.value || "—");

              return (
                <div key={field.key} style={fieldBoxStyle} onClick={() => setEditingField(field.key)}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)" }}>{field.label}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingField(field.key); }} style={{ background: "transparent", border: "none", padding: 0, color: "rgba(201,168,76,0.72)", cursor: "pointer", display: "inline-flex" }}>
                      <Pencil size={14} />
                    </button>
                  </div>

                  <div style={{ marginTop: "8px" }} onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      field.type === "textarea" ? (
                        <textarea
                          autoFocus
                          value={field.value}
                          onChange={(e) => updatePreviewField(field.key, e.target.value)}
                          onBlur={() => setEditingField(null)}
                          style={{ ...inlineInputStyle, minHeight: "92px", resize: "vertical" }}
                        />
                      ) : field.type === "select" ? (
                        <select
                          autoFocus
                          value={field.value}
                          onChange={(e) => updatePreviewField(field.key, e.target.value)}
                          onBlur={() => setEditingField(null)}
                          style={{ ...inlineInputStyle, cursor: "pointer" }}
                        >
                          <option value="PAID">PAID</option>
                          <option value="CASH">CASH</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      ) : (
                        <input
                          autoFocus
                          type={field.type}
                          value={field.value}
                          onChange={(e) => updatePreviewField(field.key, e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && field.type !== "date" && field.type !== "number") {
                              setEditingField(null);
                            }
                          }}
                          style={inlineInputStyle}
                        />
                      )
                    ) : (
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{String(displayValue)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </section>
  );
}