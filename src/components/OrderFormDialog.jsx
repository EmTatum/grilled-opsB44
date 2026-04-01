import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyOrder = { client_name: "", order_details: "", order_date: "", status: "Pending" };

const inputStyle = {
  width: "100%",
  background: "#111111",
  border: "1px solid hsl(40 20% 18%)",
  borderRadius: "2px",
  padding: "9px 12px",
  color: "hsl(36 40% 88%)",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  outline: "none",
  marginTop: "6px",
};

const labelStyle = {
  display: "block",
  fontSize: "9px",
  color: "hsl(36 10% 42%)",
  fontFamily: "Inter, sans-serif",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  fontWeight: 500,
};

export default function OrderFormDialog({ open, onOpenChange, order, onSave }) {
  const [form, setForm] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        client_name: order.client_name || "",
        order_details: order.order_details || "",
        order_date: order.order_date ? order.order_date.slice(0, 16) : "",
        status: order.status || "Pending",
      });
    } else {
      setForm(emptyOrder);
    }
  }, [order, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, order_date: new Date(form.order_date).toISOString() });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#161616", border: "1px solid hsl(40 20% 18%)", borderRadius: "2px", maxWidth: "460px" }}>
        <DialogHeader>
          <DialogTitle className="font-heading" style={{ fontSize: "24px", color: "hsl(36 40% 90%)" }}>
            {order ? "Edit Order" : "New Order"}
          </DialogTitle>
          <div className="h-px mt-1 mb-1" style={{ background: "linear-gradient(90deg, hsl(40 57% 54% / 0.4), transparent)" }} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <label style={labelStyle}>Client Name</label>
            <input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              style={inputStyle} placeholder="Enter client name"
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div>
            <label style={labelStyle}>Order Details</label>
            <textarea required value={form.order_details} onChange={(e) => setForm({ ...form, order_details: e.target.value })}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Describe the order..."
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div>
            <label style={labelStyle}>Date & Time</label>
            <input required type="datetime-local" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}>
              {["Pending", "Confirmed", "Fulfilled", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              style={{ padding: "9px 20px", background: "transparent", border: "1px solid hsl(40 20% 20%)", borderRadius: "2px", color: "hsl(36 30% 70%)", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))", border: "none", borderRadius: "2px", color: "#0a0a0a", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : order ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}