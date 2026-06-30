import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SYSTEM_PROMPT = `You are an intelligence extraction engine for Grilled.inc, a luxury private members-only retail operation.

Extract STRICTLY from the provided WhatsApp conversation and return ONLY valid JSON matching this exact shape — no markdown, no commentary, no extra keys:

{
  "client": {
    "name": "string — cleaned name, no emojis, no honorifics",
    "cell_number": "string — E164 or local format if present, else empty string",
    "delivery_address": "string — if mentioned in chat, else empty string"
  },
  "last_order": {
    "found": true or false,
    "items": [{"name": "string", "qty": number, "spec": "string"}],
    "order_total": number,
    "payment_method": "Cash" or "EFT" or "Unclear",
    "delivery_date": "YYYY-MM-DD" or null,
    "delivery_time_slot": "string" or null
  },
  "intelligence": {
    "relationship_vibe": "concise label + parenthetical e.g. Stable / High Latency (Average reply time: 6 hours)",
    "payment_rail": "e.g. Proactive EFT (Sends PoP screenshots immediately)",
    "usual_order": "e.g. [Product Tier/Spec] | Prefers [Material/Color/Finish]",
    "communication_rule": "imperative tone e.g. 90% Voice Notes. Do not place direct phone calls.",
    "red_flags": "string — risks, behaviours to watch. If none, write None.",
    "extracted_intel": "string — assistant names, hard preferences, things they detest"
  }
}

Rules:
- last_order.found = true only if there is a clear, recent product order in the conversation.
- last_order.items must list every item from the FINAL exchange about the active order only.
- last_order.order_total must be a plain number (e.g. 1250, not "R1,250").
- delivery_date must be YYYY-MM-DD format resolved from today's date if relative terms like "tomorrow" or "Friday" are used.
- Never use the words pickup or pick up — replace with delivery everywhere.
- If a field cannot be determined, use empty string or null as appropriate.
`;

const cardStyle = {
  background: "#0f0f0f",
  border: "2px solid rgba(201,168,76,0.35)",
  padding: "24px",
  borderRadius: "2px",
};

const labelStyle = {
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  fontWeight: 500,
  color: "rgba(201,168,76,0.6)",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  margin: 0,
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      padding: "14px 22px",
      background: toast.type === "error" ? "#1a0505" : "#0f0f0f",
      border: `1px solid ${toast.type === "error" ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.5)"}`,
      color: toast.type === "error" ? "#C2185B" : "#C9A84C",
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      letterSpacing: "0.06em",
      zIndex: 9999,
      borderRadius: "2px",
      maxWidth: "480px",
      lineHeight: 1.6,
    }}>
      {toast.msg}
    </div>
  );
};

const mapPaymentMethod = (pm) => {
  if (pm === "EFT") return "Bank Transfer";
  if (pm === "Cash") return "Cash";
  return "Other";
};

const mapPaymentStatus = (pm) => {
  if (pm === "EFT") return "PAID";
  if (pm === "Cash") return "CASH";
  return "PENDING";
};

const buildOrderListMarkdown = (items) =>
  (items || []).map(item => `- [ ] ${item.qty}× ${item.name}${item.spec ? ` ${item.spec}` : ""}`).join("\n");

const buildNoteContent = (extracted, intelligenceId) => {
  const { client, last_order } = extracted;
  const ts = new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
  const lines = [
    `**Generated from WhatsApp import — ${ts}**`,
    "",
    `**Contact:** ${client.cell_number || "—"}`,
    `**Delivery:** ${client.delivery_address || "—"}`,
    "",
  ];
  if (last_order.found) {
    lines.push("**Last Order:**");
    (last_order.items || []).forEach(item => {
      lines.push(`- [ ] ${item.qty}× ${item.name}${item.spec ? ` ${item.spec}` : ""}`);
    });
    lines.push("");
    lines.push(`**Total:** R${(last_order.order_total || 0).toLocaleString("en-ZA")}`);
    lines.push(`**Payment:** ${last_order.payment_method}`);
    lines.push(`**Delivery date/time:** ${last_order.delivery_date || "—"} ${last_order.delivery_time_slot || ""}`.trim());
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  lines.push(`**Intelligence:** See [Member Intelligence](/member-intelligence?id=${intelligenceId}) for the full report.`);
  return lines.join("\n");
};

export default function WhatsAppIntelligencePanel({ onSaved }) {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg, type = "success", duration = 6000) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  };

  const handleGenerate = async () => {
    if (!conversation.trim() || loading) return;
    setLoading(true);
    setToast(null);

    let extracted;
    try {
      const raw = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}`,
        response_json_schema: {
          type: "object",
          properties: {
            client: {
              type: "object",
              properties: {
                name: { type: "string" },
                cell_number: { type: "string" },
                delivery_address: { type: "string" },
              },
              required: ["name", "cell_number", "delivery_address"],
            },
            last_order: {
              type: "object",
              properties: {
                found: { type: "boolean" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      qty: { type: "number" },
                      spec: { type: "string" },
                    },
                    required: ["name", "qty", "spec"],
                  },
                },
                order_total: { type: "number" },
                payment_method: { type: "string", enum: ["Cash", "EFT", "Unclear"] },
                delivery_date: { type: ["string", "null"] },
                delivery_time_slot: { type: ["string", "null"] },
              },
              required: ["found", "items", "order_total", "payment_method", "delivery_date", "delivery_time_slot"],
            },
            intelligence: {
              type: "object",
              properties: {
                relationship_vibe: { type: "string" },
                payment_rail: { type: "string" },
                usual_order: { type: "string" },
                communication_rule: { type: "string" },
                red_flags: { type: "string" },
                extracted_intel: { type: "string" },
              },
              required: ["relationship_vibe", "payment_rail", "usual_order", "communication_rule", "red_flags", "extracted_intel"],
            },
          },
          required: ["client", "last_order", "intelligence"],
        },
      });

      // Validate shape
      if (!raw?.client?.name || !raw?.last_order || !raw?.intelligence) {
        throw new Error("Invalid shape");
      }
      extracted = raw;
    } catch (error) {
      console.error('WhatsApp intelligence extraction failed:', error);
      setLoading(false);
      showToast("Extraction failed — paste a longer chat or try again.", "error");
      return;
    }

    const { client, last_order, intelligence } = extracted;
    const clientName = (client.name || "").trim();

    // Step 2: Upsert MemberIntelligence
    let intelligenceId;
    let intelAction = "created";
    try {
      const existing = await base44.entities.MemberIntelligence.filter({}, "-updated_date", 500);
      const match = existing.find(r =>
        (r.client_name || "").toLowerCase() === clientName.toLowerCase()
      );
      // tiebreak by cell_number if multiple
      const intelPayload = {
        client_name: clientName,
        cell_number: client.cell_number || "",
        relationship_vibe: intelligence.relationship_vibe,
        payment_rail: intelligence.payment_rail,
        usual_order: intelligence.usual_order,
        communication_rule: intelligence.communication_rule,
        red_flags: intelligence.red_flags,
        extracted_intel: intelligence.extracted_intel,
        last_updated: new Date().toISOString(),
      };
      if (match) {
        const updated = await base44.entities.MemberIntelligence.update(match.id, intelPayload);
        intelligenceId = updated.id;
        intelAction = "updated";
      } else {
        const created = await base44.entities.MemberIntelligence.create(intelPayload);
        intelligenceId = created.id;
      }
    } catch (e) {
      setLoading(false);
      showToast(`Intelligence write failed: ${e.message}. No records saved.`, "error");
      return;
    }

    // Step 3: Create CustomerNote
    let noteResult = "created";
    let noteError = null;
    try {
      const noteContent = buildNoteContent(extracted, intelligenceId);
      await base44.entities.CustomerNote.create({
        client_name: clientName,
        note_type: "General",
        priority: "Medium",
        content: noteContent,
        last_order_date: last_order.delivery_date ? new Date(last_order.delivery_date).toISOString() : new Date().toISOString(),
        total_spend: last_order.order_total || 0,
      });
    } catch (e) {
      noteResult = "failed";
      noteError = e.message;
    }

    // Step 4: Create Order (only if last_order.found)
    let orderResult = "skipped — no order in chat";
    let orderError = null;
    if (last_order.found) {
      try {
        const orderList = buildOrderListMarkdown(last_order.items);
        await base44.entities.Order.create({
          client_name: clientName,
          cell_number: client.cell_number || "",
          delivery_address: client.delivery_address || "",
          delivery_date: last_order.delivery_date || undefined,
          time_slot: last_order.delivery_time_slot || "",
          order_list: orderList,
          order_details: orderList,
          order_total: last_order.order_total || 0,
          order_value: last_order.order_total || 0,
          payment_method: mapPaymentMethod(last_order.payment_method),
          payment_status: mapPaymentStatus(last_order.payment_method),
          fulfilment_status: "Active",
          status: "Pending",
          order_date: new Date().toISOString(),
          intelligence_report_id: intelligenceId,
        });
        orderResult = "created";
      } catch (e) {
        orderResult = "failed";
        orderError = e.message;
      }
    }

    setLoading(false);

    // Compose toast
    const noteLabel = noteResult === "failed" ? `Note FAILED (${noteError})` : "CustomerNote created";
    const intelLabel = `Intelligence ${intelAction}`;
    const orderLabel = `Order ${orderResult}${orderError ? ` (${orderError})` : ""}`;
    const hasError = noteResult === "failed" || orderResult === "failed";

    showToast(
      `Intelligence updated for ${clientName}. ${noteLabel} · ${intelLabel} · ${orderLabel}.`,
      hasError ? "error" : "success",
      hasError ? 10000 : 6000
    );

    if (!hasError) {
      setConversation("");
      onSaved?.({ client_name: clientName, intelligence_id: intelligenceId });
    }
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>
            WhatsApp Import
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.4)", margin: 0, letterSpacing: "0.04em" }}>
            Paste a WhatsApp conversation to generate a structured intelligence report and auto-save records.
          </p>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>WhatsApp Conversation</label>
          <textarea
            value={conversation}
            onChange={e => setConversation(e.target.value)}
            placeholder="Paste the full conversation here..."
            rows={8}
            style={{
              width: "100%",
              background: "#0a0a0a",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#F5F0E8",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              padding: "12px 14px",
              resize: "vertical",
              outline: "none",
              borderRadius: "2px",
              lineHeight: 1.6,
            }}
            onFocus={e => { e.target.style.borderColor = "#C9A84C"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleGenerate}
            disabled={loading || !conversation.trim()}
            style={{
              background: "transparent",
              border: "1px solid #C9A84C",
              color: "#C9A84C",
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: "2px",
              cursor: loading || !conversation.trim() ? "default" : "pointer",
              opacity: loading || !conversation.trim() ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { if (!loading && conversation.trim()) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
          {loading && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(201,168,76,0.6)", letterSpacing: "0.08em" }}>
              Processing conversation...
            </span>
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}