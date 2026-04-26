import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { PAYMENT_STYLES } from "./member-intelligence-config";
import { formatRand } from "./memberIntelligenceUtils";
import { extractQuantity, splitManifestItems } from "@/utils/dispatchReconciliation";

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

function getDeliveryTimeDisplay(order) {
  const explicit = String(order?.delivery_time || "").trim();
  if (explicit) return explicit.slice(0, 5);

  const rawDate = String(order?.delivery_date || "").trim();
  if (!rawDate.includes("T")) return "Time TBC";

  const [, timePart = ""] = rawDate.split("T");
  return timePart ? timePart.slice(0, 5) : "Time TBC";
}

const confirmedChipConfig = {
  PAID: {
    icon: "✓",
    text: "PAID CONFIRMED",
    background: "rgba(57,255,20,0.14)",
    border: "1px solid rgba(57,255,20,0.65)",
    color: "#39ff14",
    accent: "#39ff14"
  },
  CASH: {
    icon: "💵",
    text: "CASH CONFIRMED",
    background: "rgba(57,255,20,0.14)",
    border: "1px solid rgba(57,255,20,0.65)",
    color: "#39ff14",
    accent: "#39ff14"
  },
  PENDING: {
    icon: "⏳",
    text: "PENDING",
    background: "rgba(201,168,76,0.1)",
    border: "1px solid rgba(201,168,76,0.45)",
    color: "#C9A84C",
    accent: "#C9A84C"
  }
};

export default function MemberIntelligenceCard({ order, note, confirmedPayment, setConfirmedPayments, onFulfilled, onCancelled, onViewReport, onSaveEdit, onSaveFollowUp, onConfirmStatus }) {
  const [editing, setEditing] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showConfirmOptions, setShowConfirmOptions] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [cardOrder, setCardOrder] = useState(order);
  const [draft, setDraft] = useState(order);

  useEffect(() => {
    setCardOrder(order);
    setDraft(order);
    setEditing(false);
    setShowFollowUp(false);
    setShowConfirmOptions(false);
    setFollowUpNote("");
  }, [order]);

  const lockedPaymentStatus = confirmedPayment || null;
  const checklistItems = useMemo(() => splitManifestItems(cardOrder.order_list).map((item) => ({
    label: item,
    quantity: extractQuantity(item)
  })), [cardOrder.order_list]);
  const paymentStyle = lockedPaymentStatus ? {
    accent: confirmedChipConfig[lockedPaymentStatus].accent,
    badgeBackground: confirmedChipConfig[lockedPaymentStatus].background,
    badgeBorder: confirmedChipConfig[lockedPaymentStatus].accent,
    badgeColor: confirmedChipConfig[lockedPaymentStatus].color
  } : (PAYMENT_STYLES[cardOrder.payment_status] || PAYMENT_STYLES.PENDING);
  const confirmedChip = confirmedChipConfig[lockedPaymentStatus || cardOrder.payment_status] || confirmedChipConfig.PENDING;

  return (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.18)", borderLeft: `4px solid ${paymentStyle.accent}`, padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#F5F0E8", lineHeight: 1.05 }}>{cardOrder.client_name || "Unknown Client"}</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {lockedPaymentStatus && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: confirmedChip.background, border: confirmedChip.border, color: confirmedChip.color, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", height: "fit-content" }}>
              <span>{confirmedChip.icon}</span>
              <span>{confirmedChip.text}</span>
            </div>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", background: paymentStyle.badgeBackground, border: `1px solid ${paymentStyle.badgeBorder}`, color: paymentStyle.badgeColor, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", height: "fit-content" }}>
            {cardOrder.payment_status}
          </span>
        </div>
      </div>

      {!editing ? (
        <>
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Name</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{cardOrder.client_name || "Unknown Client"}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Delivery Time</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8" }}>{getDeliveryTimeDisplay(cardOrder)}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Delivery Address</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: cardOrder.delivery_address ? "#F5F0E8" : "rgba(245,240,232,0.45)", whiteSpace: "pre-wrap", fontStyle: cardOrder.delivery_address ? "normal" : "italic" }}>{cardOrder.delivery_address || "Address TBC"}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cell</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: cardOrder.cell_number ? "#F5F0E8" : "rgba(245,240,232,0.45)" }}>{cardOrder.cell_number || "No number"}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Order Total</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#d29c6c" }}>{formatRand(cardOrder.order_total)}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Next Action</p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.58)", fontStyle: "italic" }}>{cardOrder.next_action || "No next action set"}</p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.16)" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.68)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Full Drop Checklist</p>
            {checklistItems.length ? checklistItems.map((item, index) => (
              <div key={`${item.label}-${index}`} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600 }}>{item.quantity}×</span>
                <span style={{ color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.5 }}>{item.label}</span>
              </div>
            )) : (
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>No order listed</p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={async () => { await onFulfilled(cardOrder); }} style={buttonBase}>✓ Fulfilled</button>
            <button onClick={async () => { await onCancelled(cardOrder); }} style={{ ...buttonBase, border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B" }}>✗ Cancel</button>
            <button onClick={() => onViewReport(cardOrder)} style={buttonBase}>📋 Full Report</button>
            <button onClick={() => setEditing(true)} style={buttonBase}>✏️ Edit</button>
            <button onClick={() => { setShowFollowUp((prev) => !prev); setShowConfirmOptions(false); }} style={buttonBase}>📞 Follow Up</button>
            {!lockedPaymentStatus ? (
              <button onClick={() => { setShowConfirmOptions((prev) => !prev); setShowFollowUp(false); }} style={buttonBase}>✅ Confirm</button>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 14px", background: confirmedChip.background, border: confirmedChip.border, color: confirmedChip.color, fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "default" }}>
                <span>{confirmedChip.icon}</span>
                <span>{confirmedChip.text}</span>
              </div>
            )}
          </div>

          {showFollowUp && (
            <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.16)" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.68)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Log follow-up note</label>
              <input value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} placeholder="Called, no answer — try again at 5pm" style={inputStyle} />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={async () => { if (!followUpNote.trim()) return; const updatedOrder = await onSaveFollowUp(cardOrder, followUpNote.trim()); if (updatedOrder) setCardOrder(updatedOrder); setFollowUpNote(""); setShowFollowUp(false); }} style={buttonBase}>Save</button>
                <button onClick={() => { setFollowUpNote(""); setShowFollowUp(false); }} style={{ ...buttonBase, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>Cancel</button>
              </div>
            </div>
          )}

          {showConfirmOptions && (
            <div style={{ display: "grid", gap: "10px", padding: "14px", background: "#111111", border: "1px solid rgba(201,168,76,0.16)" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(201,168,76,0.68)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Confirm payment status</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={async () => { const selectedValue = "PAID"; const updatedOrder = await onConfirmStatus(cardOrder, selectedValue); if (updatedOrder) setCardOrder(updatedOrder); setConfirmedPayments((prev) => ({ ...prev, [order.id]: selectedValue })); setShowConfirmOptions(false); }} style={buttonBase}>PAID</button>
                <button onClick={async () => { const selectedValue = "CASH"; const updatedOrder = await onConfirmStatus(cardOrder, selectedValue); if (updatedOrder) setCardOrder(updatedOrder); setConfirmedPayments((prev) => ({ ...prev, [order.id]: selectedValue })); setShowConfirmOptions(false); }} style={buttonBase}>CASH</button>
                <button onClick={async () => { const selectedValue = "PENDING"; const updatedOrder = await onConfirmStatus(cardOrder, selectedValue); if (updatedOrder) setCardOrder(updatedOrder); setConfirmedPayments((prev) => ({ ...prev, [order.id]: selectedValue })); setShowConfirmOptions(false); }} style={buttonBase}>PENDING</button>
                <button onClick={() => setShowConfirmOptions(false)} style={{ ...buttonBase, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)", display: "inline-flex", alignItems: "center", gap: "6px" }}><X size={14} /> Close</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          <input value={draft.delivery_date || ""} onChange={(e) => setDraft({ ...draft, delivery_date: e.target.value })} placeholder="YYYY-MM-DD or YYYY-MM-DDTHH:MM" style={inputStyle} />
          <textarea value={draft.delivery_address || ""} onChange={(e) => setDraft({ ...draft, delivery_address: e.target.value })} placeholder="Delivery address" style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} />
          <input value={draft.cell_number || ""} onChange={(e) => setDraft({ ...draft, cell_number: e.target.value })} placeholder="Cell number" style={inputStyle} />
          <select value={draft.payment_status || "PENDING"} onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="PAID">PAID</option>
            <option value="CASH">CASH</option>
            <option value="PENDING">PENDING</option>
          </select>
          <input value={draft.order_total ?? 0} onChange={(e) => setDraft({ ...draft, order_total: Number(e.target.value || 0) })} type="number" placeholder="Order total" style={inputStyle} />
          <textarea value={draft.next_action || ""} onChange={(e) => setDraft({ ...draft, next_action: e.target.value })} placeholder="Next action" style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={async () => { const updatedOrder = await onSaveEdit(draft); if (updatedOrder) setCardOrder(updatedOrder); setEditing(false); }} style={buttonBase}>Save</button>
            <button onClick={() => { setDraft(order); setEditing(false); }} style={{ ...buttonBase, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}