import { useEffect, useState } from "react";
import { PAYMENT_STYLES } from "./member-intelligence-config";
import { formatRand } from "./memberIntelligenceUtils";

const formatDisplayDate = (value) => {
  if (!value) return "Date TBC";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const formatDisplayTime = (value) => {
  if (!value) return "Time TBC";
  const [hours, minutes] = String(value).split(":");
  if (hours === undefined || minutes === undefined) return value;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

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

export default function MemberIntelligenceCard({ order, note, onFulfilled, onCancelled, onViewReport, onSaveEdit, onSaveFollowUp, onConfirmStatus }) {
  const [editing, setEditing] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showConfirmOptions, setShowConfirmOptions] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [draft, setDraft] = useState(order);

  useEffect(() => {
    setDraft(order);
    setEditing(false);
    setShowFollowUp(false);
    setShowConfirmOptions(false);
    setFollowUpNote("");
  }, [order]);

  const paymentStyle = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.PENDING;

  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: `4px solid ${paymentStyle.accent}`, padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#F5F0E8", lineHeight: 1.05 }}>{order.client_name || "Unknown Client"}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {order.order_confirmed && (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.4)", color: "#5eead4", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", height: "fit-content" }}>
              ✓ Confirmed
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", background: paymentStyle.badgeBackground, border: `1px solid ${paymentStyle.badgeBorder}`, color: paymentStyle.badgeColor, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", height: "fit-content" }}>
            {order.payment_status}
          </span>
        </div>
      </div>

      {!editing ? (
        <>
          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>📅 {formatDisplayDate(order.delivery_date)}{order.delivery_time ? ` at ${formatDisplayTime(order.delivery_time)}` : " — Time TBC"}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: order.delivery_address ? "#F5F0E8" : "rgba(245,240,232,0.45)", whiteSpace: "pre-wrap", fontStyle: order.delivery_address ? "normal" : "italic" }}>📍 {order.delivery_address || "Address TBC"}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: order.cell_number ? "#F5F0E8" : "rgba(245,240,232,0.45)" }}>📞 {order.cell_number || "No number"}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>💰 {formatRand(order.order_total)}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.58)", fontStyle: "italic" }}>⚡ {order.next_action || "No next action set"}</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => onFulfilled(order, note)} style={buttonBase}>✓ Fulfilled</button>
            <button onClick={() => onCancelled(order)} style={{ ...buttonBase, border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B" }}>✗ Cancel</button>
            <button onClick={() => onViewReport(note)} style={buttonBase}>📋 Full Report</button>
            <button onClick={() => setEditing(true)} style={buttonBase}>✏️ Edit</button>
            <button onClick={() => { setShowFollowUp((prev) => !prev); setShowConfirmOptions(false); }} style={buttonBase}>📞 Follow Up</button>
            <button onClick={() => { setShowConfirmOptions((prev) => !prev); setShowFollowUp(false); }} style={buttonBase}>✅ Confirm</button>
          </div>

          {showFollowUp && (
            <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.16)" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.68)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Log follow-up note</label>
              <input value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} placeholder="Called, no answer — try again at 5pm" style={inputStyle} />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={async () => { if (!followUpNote.trim()) return; await onSaveFollowUp(order, followUpNote.trim()); setFollowUpNote(""); setShowFollowUp(false); }} style={buttonBase}>Save</button>
                <button onClick={() => { setFollowUpNote(""); setShowFollowUp(false); }} style={{ ...buttonBase, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>Cancel</button>
              </div>
            </div>
          )}

          {showConfirmOptions && (
            <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(20,184,166,0.18)" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(20,184,166,0.8)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Confirm payment status</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={async () => { await onConfirmStatus(order, "PAID"); setShowConfirmOptions(false); }} style={buttonBase}>PAID (EFT received)</button>
                <button onClick={async () => { await onConfirmStatus(order, "CASH"); setShowConfirmOptions(false); }} style={buttonBase}>CASH (on delivery)</button>
                <button onClick={async () => { await onConfirmStatus(order, "PENDING"); setShowConfirmOptions(false); }} style={buttonBase}>Keep as PENDING</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          <input value={draft.delivery_date || ""} onChange={(e) => setDraft({ ...draft, delivery_date: e.target.value })} placeholder="YYYY-MM-DD" style={inputStyle} />
          <input value={draft.delivery_time || ""} onChange={(e) => setDraft({ ...draft, delivery_time: e.target.value })} placeholder="HH:MM" style={inputStyle} />
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