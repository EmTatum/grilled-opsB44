import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyOrder = { client_name: "", order_details: "", order_value: "", time_slot: "", payment_method: "Cash", order_date: "", status: "Pending" };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", padding: "10px 14px", color: "#F5F0E8", fontSize: "13px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function OrderFormDialog({ open, onOpenChange, order, onSave }) {
  const [form, setForm] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(order ? { client_name: order.client_name || "", order_details: order.order_details || "", order_value: order.order_value || "", time_slot: order.time_slot || "", payment_method: order.payment_method || "Cash", order_date: order.order_date ? order.order_date.slice(0, 16) : "", status: order.status || "Pending" } : emptyOrder);
  }, [order, open]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave({ ...form, order_value: Number(form.order_value) || 0, order_date: new Date(form.order_date).toISOString() });
    setSaving(false); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "460px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px", marginBottom: "4px" }}>
          <DialogTitle style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            {order ? "Edit Order" : "New Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          <div><label style={labelStyle}>Client Name</label><input required value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} style={inputStyle} placeholder="Enter client name" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={labelStyle}>Items Summary</label><textarea required value={form.order_details} onChange={e => setForm({ ...form, order_details: e.target.value })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="List items ordered..." onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Order Value (R)</label><input type="number" min="0" step="0.01" value={form.order_value} onChange={e => setForm({ ...form, order_value: e.target.value })} style={inputStyle} placeholder="0.00" onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Time Slot</label><input value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} style={inputStyle} placeholder="e.g. 3:00 PM – 5:00 PM" onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["Cash", "Card", "Bank Transfer", "Credit on Account", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Date & Time</label><input required type="datetime-local" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
              {["Pending", "Confirmed", "Fulfilled", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "0", color: "rgba(245,240,232,0.5)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid #C9A84C", borderRadius: "0", color: "#C9A84C", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.2s" }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}>
              {saving ? "Saving..." : order ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}