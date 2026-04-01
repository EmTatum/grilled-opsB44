import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct = { product_name: "", category: "", last_stock_count: 0, new_stock_arrived: 0, low_stock_threshold: 5 };

const F = { fontFamily: "var(--font-body)" };
const inputStyle = { ...F, width: "100%", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", padding: "10px 14px", color: "#F5F0E8", fontSize: "14px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 2px rgba(201,168,76,0.15)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function ProductFormDialog({ open, onOpenChange, product, onSave }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? { product_name: product.product_name || "", category: product.category || "", last_stock_count: product.last_stock_count || 0, new_stock_arrived: product.new_stock_arrived || 0, low_stock_threshold: product.low_stock_threshold ?? 5 } : emptyProduct);
  }, [product, open]);

  const currentStock = Number(form.last_stock_count || 0) + Number(form.new_stock_arrived || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave({ ...form, last_stock_count: Number(form.last_stock_count), new_stock_arrived: Number(form.new_stock_arrived), current_stock: currentStock, low_stock_threshold: Number(form.low_stock_threshold) });
    setSaving(false); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "460px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", fontWeight: 600 }}>
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
          <div style={{ height: "1px", background: "rgba(201,168,76,0.2)", marginTop: "8px" }} />
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
          <div>
            <label style={labelStyle}>Product Name</label>
            <input required value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })}
              style={inputStyle} placeholder="Product name" onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={inputStyle} placeholder="e.g. Flower, Edibles, Concentrates" onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Last Stock Count</label>
              <input required type="number" min="0" value={form.last_stock_count} onChange={e => setForm({ ...form, last_stock_count: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>New Stock Arrived</label>
              <input required type="number" min="0" value={form.new_stock_arrived} onChange={e => setForm({ ...form, new_stock_arrived: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Current Stock</label>
              <div style={{ ...inputStyle, display: "flex", alignItems: "center", background: "#111111", color: "#C9A84C", fontWeight: 600, cursor: "default" }}>{currentStock} units</div>
            </div>
            <div>
              <label style={labelStyle}>Low Stock Threshold</label>
              <input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...F, padding: "10px 24px", background: "transparent", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "2px", color: "rgba(245,240,232,0.6)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...F, padding: "10px 24px", background: "transparent", border: "1px solid #C9A84C", borderRadius: "2px", color: "#C9A84C", fontSize: "12px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}>
              {saving ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}