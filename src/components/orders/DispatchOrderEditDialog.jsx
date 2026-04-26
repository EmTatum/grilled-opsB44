import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const inputStyle = {
  width: "100%",
  background: "#1a1a1a",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: "2px",
  color: "#F5F0E8",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  fontWeight: 500,
  color: "rgba(201,168,76,0.65)",
  letterSpacing: "0.14em",
  textTransform: "uppercase"
};

const buttonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 18px",
  borderRadius: "2px",
  cursor: "pointer"
};

export default function DispatchOrderEditDialog({ open, onOpenChange, order, onSave }) {
  const [form, setForm] = useState({ delivery_time: "", delivery_address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    const derivedTime = String(order.delivery_time || "").trim() || (String(order.delivery_date || "").includes("T")
      ? String(order.delivery_date).split("T")[1]?.slice(0, 5) || ""
      : "");

    setForm({
      delivery_time: derivedTime,
      delivery_address: order.delivery_address || ""
    });
  }, [order, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order || saving) return;
    setSaving(true);
    await onSave({
      ...order,
      delivery_time: form.delivery_time,
      delivery_address: form.delivery_address
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "460px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.18)", paddingBottom: "14px", marginBottom: "8px" }}>
          <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Edit Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Delivery Time</label>
            <input
              type="time"
              value={form.delivery_time}
              onChange={(e) => setForm((current) => ({ ...current, delivery_time: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Delivery Address</label>
            <textarea
              value={form.delivery_address}
              onChange={(e) => setForm((current) => ({ ...current, delivery_address: e.target.value }))}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Update delivery address"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "10px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...buttonStyle, border: "1px solid rgba(245,240,232,0.18)", color: "rgba(245,240,232,0.7)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ ...buttonStyle, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}