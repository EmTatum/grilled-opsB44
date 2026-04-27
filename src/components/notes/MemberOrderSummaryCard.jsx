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

export default function MemberOrderSummaryCard({ order, onInlineSave, onConfirmPayment, onFollowUp, onFulfilled, onCancelled, confirmedPayments, setConfirmedPayments, pendingSelection, setPendingSelection, cardStatus, followUpFlags, onSelectReport }) {
  const paymentStyle = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.PENDING;
  const confirmedValue = confirmedPayments[order.id] || null;
  const confirmChip = confirmChipConfig[confirmedValue || order.payment_status] || confirmChipConfig.PENDING;

  const displayOrderList = useMemo(() => consolidateOrderList(order.order_list || ""), [order.order_list]);
  const record = order;
  const cardBorderColor = confirmedPayments[record.id] === 'PAID'
    ? '#166534'
    : confirmedPayments[record.id] === 'CASH'
      ? '#991b1b'
      : confirmedPayments[record.id] === 'PENDING'
        ? '#374151'
        : 'rgba(201,168,76,0.22)';

  return (
    <div style={{ ...cardStyle, border: `1px solid ${cardBorderColor}` }}>
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
        {confirmedPayments[record.id] ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '13px',
            backgroundColor: confirmedPayments[record.id] === 'PAID' ? '#166534' : confirmedPayments[record.id] === 'CASH' ? '#7c2d12' : '#374151',
            color: '#ffffff',
            cursor: 'default'
          }}>
            {confirmedPayments[record.id] === 'PAID' ? '✓ PAID CONFIRMED' : confirmedPayments[record.id] === 'CASH' ? '💵 CASH CONFIRMED' : '⏳ PENDING'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={pendingSelection[record.id] || ''}
              onChange={(e) => setPendingSelection(prev => ({ ...prev, [record.id]: e.target.value }))}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: '#fff' }}
            >
              <option value="" disabled>Select status</option>
              <option value="PAID">PAID</option>
              <option value="CASH">CASH</option>
              <option value="PENDING">PENDING</option>
            </select>
            <button
              onClick={async () => {
                const selected = pendingSelection[record.id];
                if (!selected) return;
                try {
                  await onConfirmPayment(record);
                  setConfirmedPayments(prev => ({ ...prev, [record.id]: selected }));
                } catch (e) {
                  alert('Update failed — please try again');
                }
              }}
              disabled={!pendingSelection[record.id]}
              style={{ padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', background: '#b45309', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              CONFIRM
            </button>
          </div>
        )}
        <button type="button" onClick={() => onFollowUp(order)} style={buttonStyle}>Follow Up</button>
        <button
          onClick={async () => {
            try {
              await onFulfilled(record);
            } catch (e) {
              alert('Update failed');
            }
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontWeight: 'bold',
            background: cardStatus[record.id] === 'Fulfilled' ? '#166534' : '#14532d',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: cardStatus[record.id] === 'Cancelled' ? 0.4 : 1
          }}
        >
          {cardStatus[record.id] === 'Fulfilled' ? '✓ Fulfilled' : 'Fulfilled'}
        </button>
        <button
          onClick={async () => {
            try {
              await onCancelled(record);
            } catch (e) {
              alert('Update failed');
            }
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontWeight: 'bold',
            background: cardStatus[record.id] === 'Cancelled' ? '#991b1b' : '#7f1d1d',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: cardStatus[record.id] === 'Fulfilled' ? 0.4 : 1
          }}
        >
          {cardStatus[record.id] === 'Cancelled' ? '✗ Cancelled' : 'Cancelled'}
        </button>
        <button type="button" onClick={() => onSelectReport(order)} style={buttonStyle}>Full Report</button>
      </div>
    </div>
  );
}