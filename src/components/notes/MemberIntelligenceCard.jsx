import { useEffect, useState } from "react";
import { PAYMENT_STYLES } from "./member-intelligence-config";
import { formatRand } from "./memberIntelligenceUtils";

const inputStyle = {
  width: "100%",
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#F5F0E8",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none"
};

const buttonBase = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 14px",
  cursor: "pointer"
};

export default function MemberIntelligenceCard({ order, note, onFulfilled, onCancelled, onViewReport, onSaveEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(order);

  useEffect(() => {
    setDraft(order);
    setEditing(false);
  }, [order]);

  const paymentStyle = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.PENDING;

  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: `4px solid ${paymentStyle.accent}`, padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#F5F0E8", lineHeight: 1.05 }}>{order.client_name || "Unknown Client"}</p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{order.cell_number || "No cell number"}</p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", background: paymentStyle.badgeBackground, border: `1px solid ${paymentStyle.badgeBorder}`, color: paymentStyle.badgeColor, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", height: "fit-content" }}>
          {order.payment_status}
        </span>
      </div>

      {!editing ? (
        <>
          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}><span style={{ color: "rgba(201,168,76,0.68)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px" }}>Delivery Date</span><br />{order.delivery_date || <em style={{ color: "rgba(245,240,232,0.45)" }}>No date set</em>}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", whiteSpace: "pre-wrap" }}><span style={{ color: "rgba(201,168,76,0.68)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px" }}>Delivery Address</span><br />{order.delivery_address || "Address TBC"}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}><span style={{ color: "rgba(201,168,76,0.68)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "10px" }}>Order Total</span><br />{formatRand(order.order_total)}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.58)", fontStyle: "italic" }}>{order.next_action || "No next action set"}</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => onFulfilled(order, note)} style={buttonBase}>✓ Fulfilled</button>
            <button onClick={() => onCancelled(order)} style={{ ...buttonBase, border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B" }}>✗ Cancel</button>
            <button onClick={() => onViewReport(note)} style={buttonBase}>📋 View Report</button>
            <button onClick={() => setEditing(true)} style={buttonBase}>✏️ Edit</button>
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          <input value={draft.delivery_date || ""} onChange={(e) => setDraft({ ...draft, delivery_date: e.target.value })} placeholder="YYYY-MM-DD" style={inputStyle} />
          <textarea value={draft.delivery_address || ""} onChange={(e) => setDraft({ ...draft, delivery_address: e.target.value })} placeholder="Delivery address" style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} />
          <select value={draft.payment_status || "PENDING"} onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="PAID">PAID</option>
            <option value="CASH">CASH</option>
            <option value="PENDING">PENDING</option>
          </select>
          <input value={draft.order_total ?? 0} onChange={(e) => setDraft({ ...draft, order_total: Number(e.target.value || 0) })} type="number" placeholder="Order total" style={inputStyle} />
          <textarea value={draft.next_action || ""} onChange={(e) => setDraft({ ...draft, next_action: e.target.value })} placeholder="Next action" style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={async () => { await onSaveEdit(draft); setEditing(false); }} style={buttonBase}>Save</button>
            <button onClick={() => { setDraft(order); setEditing(false); }} style={{ ...buttonBase, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}