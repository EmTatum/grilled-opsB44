import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct = { product_name: "", category: "", product_description: "", notes: "", unit_price: 0, wholesale_price: 0, last_stock_count: 0, new_stock_arrived: 0, low_stock_threshold: 5 };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "0", padding: "10px 14px", color: "#F5F0E8", fontSize: "13px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function ProductFormDialog({ open, onOpenChange, product, onSave }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? {
      product_name: product.product_name || "",
      category: product.category || "",
      product_description: product.product_description || "",
      notes: product.notes || "",
      unit_price: product.unit_price || 0,
      wholesale_price: product.wholesale_price || 0,
      last_stock_count: product.last_stock_count || 0,
      new_stock_arrived: product.new_stock_arrived || 0,
      low_stock_threshold: product.low_stock_threshold ?? 5
    } : emptyProduct);
  }, [product, open]);

  const currentStock = Number(form.last_stock_count || 0) + Number(form.new_stock_arrived || 0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave({
      ...form,
      unit_price: Number(form.unit_price) || 0,
      wholesale_price: Number(form.wholesale_price) || 0,
      last_stock_count: Number(form.last_stock_count),
      new_stock_arrived: Number(form.new_stock_arrived),
      current_stock: currentStock,
      low_stock_threshold: Number(form.low_stock_threshold)
    });
    setSaving(false); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "0", boxShadow: "0 40px 80px rgba(0,0,0,0.9)", maxWidth: "460px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px", marginBottom: "4px" }}>
          <DialogTitle style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          <div><label style={labelStyle}>Product Name</label><input required value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} style={inputStyle} placeholder="Product name" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={labelStyle}>Category</label><input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} placeholder="e.g. Flower, Edibles, Concentrates" onFocus={onFocus} onBlur={onBlur} /></div>
          <div><label style={labelStyle}>Product Description</label><textarea value={form.product_description} onChange={e => setForm({ ...form, product_description: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Describe the product, flavour, or format" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Unit Price</label><input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Wholesale Price</label><input type="number" min="0" step="0.01" value={form.wholesale_price} onChange={e => setForm({ ...form, wholesale_price: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Last Stock Count</label><input required type="number" min="0" value={form.last_stock_count} onChange={e => setForm({ ...form, last_stock_count: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>New Stock Arrived</label><input required type="number" min="0" value={form.new_stock_arrived} onChange={e => setForm({ ...form, new_stock_arrived: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Current Stock</label>
              <div style={{ ...inputStyle, display: "flex", alignItems: "center", background: "#0a0a0a", color: "#C9A84C", fontWeight: 600, cursor: "default", fontFamily: "'Cinzel', serif", fontSize: "16px" }}>{currentStock}</div>
            </div>
            <div><label style={labelStyle}>Low Stock Threshold</label><input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Internal product notes" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "0", color: "rgba(245,240,232,0.5)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid #C9A84C", borderRadius: "0", color: "#C9A84C", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.2s" }}
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