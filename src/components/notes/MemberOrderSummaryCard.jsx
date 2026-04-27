import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { PAYMENT_STYLES } from "./member-intelligence-config";
import { consolidateOrderList, formatCurrency, formatDeliveryDate } from "./memberIntelligenceUtils";

const cardStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.22)",
  padding: "20px",
  display: "grid",
  gap: "16px"
};

const fieldGridStyle = {
  display: "grid",
  gap: "10px"
};

const inlineInputStyle = {
  width: "100%",
  background: "#111111",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#F5F0E8",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  outline: "none"
};

const buttonStyle = {
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

const confirmChipConfig = {
  PAID: { text: "✓ PAID CONFIRMED", background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.45)", color: "#86efac" },
  CASH: { text: "💵 CASH CONFIRMED", background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.45)", color: "#fbbf24" },
  PENDING: { text: "⏳ PENDING", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(245,240,232,0.7)" }
};

function EditableField({ label, value, field, type = "text", displayValue, options, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "12px", alignItems: "start" }}>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "rgba(201,168,76,0.65)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</p>
      <div>
        {!editing ? (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{displayValue}</p>
            <button type="button" onClick={() => { setDraft(value || ""); setEditing(true); }} style={{ background: "transparent", border: "none", padding: 0, color: "rgba(201,168,76,0.72)", cursor: "pointer", display: "inline-flex" }}>
              <Pencil size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {type === "textarea" ? (
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={{ ...inlineInputStyle, minHeight: "92px", resize: "vertical" }} />
            ) : type === "select" ? (
              <select value={draft} onChange={(e) => setDraft(e.target.value)} style={{ ...inlineInputStyle, cursor: "pointer" }}>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input value={draft} onChange={(e) => setDraft(e.target.value)} type={type} style={inlineInputStyle} />
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" onClick={async () => { await onSave(field, draft); setEditing(false); }} style={buttonStyle}>Save</button>
              <button type="button" onClick={() => { setDraft(value || ""); setEditing(false); }} style={{ ...buttonStyle, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberOrderSummaryCard({ order, onInlineSave, onConfirmPayment, onFollowUp, onFulfilled, onCancelled, confirmedPayment, followUpFlags, onSelectReport }) {
  const paymentStyle = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.PENDING;
  const confirmedValue = confirmedPayment || null;
  const confirmChip = confirmChipConfig[confirmedValue || order.payment_status] || confirmChipConfig.PENDING;
  const [showConfirmOptions, setShowConfirmOptions] = useState(false);

  const displayOrderList = useMemo(() => consolidateOrderList(order.order_list || ""), [order.order_list]);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "26px", color: "#F5F0E8" }}>{order.client_name || "Unknown Client"}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {followUpFlags[order.id] && <span style={{ padding: "6px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Follow Up</span>}
          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", background: paymentStyle.badgeBackground, border: `1px solid ${paymentStyle.badgeBorder}`, color: paymentStyle.badgeColor, fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {order.payment_status}
          </span>
        </div>
      </div>

      <div style={fieldGridStyle}>
        <EditableField label="Client Name" field="client_name" value={order.client_name || ""} displayValue={order.client_name || "—"} onSave={onInlineSave} />
        <EditableField label="Cell Number" field="cell_number" value={order.cell_number || ""} displayValue={order.cell_number || "—"} onSave={onInlineSave} />
        <EditableField label="Delivery Date" field="delivery_date" value={order.delivery_date || ""} displayValue={formatDeliveryDate(order.delivery_date)} onSave={onInlineSave} />
        <EditableField label="Delivery Address" field="delivery_address" value={order.delivery_address || ""} displayValue={order.delivery_address || "—"} type="textarea" onSave={onInlineSave} />
        <EditableField label="Order List" field="order_list" value={order.order_list || ""} displayValue={displayOrderList || "—"} type="textarea" onSave={onInlineSave} />
        <EditableField label="Order Total" field="order_total" value={String(order.order_total ?? 0)} displayValue={formatCurrency(order.order_total || 0)} type="number" onSave={onInlineSave} />
        <EditableField label="Payment Status" field="payment_status" value={order.payment_status || "PENDING"} displayValue={order.payment_status || "PENDING"} type="select" options={["PAID", "CASH", "PENDING"]} onSave={onInlineSave} />
        <EditableField label="Next Action" field="next_action" value={order.next_action || ""} displayValue={order.next_action || "—"} type="textarea" onSave={onInlineSave} />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!confirmedValue ? (
          <div style={{ position: "relative" }}>
            <button type="button" onClick={() => setShowConfirmOptions((prev) => !prev)} style={buttonStyle}>Confirm</button>
            {showConfirmOptions && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#111111", border: "1px solid rgba(201,168,76,0.22)", padding: "8px", display: "grid", gap: "6px", zIndex: 5 }}>
                {["PAID", "CASH", "PENDING"].map((status) => (
                  <button key={status} type="button" onClick={async () => { await onConfirmPayment(order, status); setShowConfirmOptions(false); }} style={buttonStyle}>{status}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", padding: "10px 14px", background: confirmChip.background, border: confirmChip.border, color: confirmChip.color, fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {confirmChip.text}
          </div>
        )}
        <button type="button" onClick={() => onFollowUp(order)} style={buttonStyle}>Follow Up</button>
        <button type="button" onClick={() => onFulfilled(order)} style={buttonStyle}>Fulfilled</button>
        <button type="button" onClick={() => onCancelled(order)} style={{ ...buttonStyle, border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B" }}>Cancelled</button>
        <button type="button" onClick={() => onSelectReport(order)} style={buttonStyle}>Full Report</button>
      </div>
    </div>
  );
}