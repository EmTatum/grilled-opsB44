import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categoryOptions = ["Cannabis — Standard", "Cannabis — Premium", "In-Store Goods", "Concierge Items"];
const unitOptions = ["Per Unit", "Per Gram", "Per Bag", "Per Bottle", "Per Pack"];
const statusOptions = ["Active", "Inactive", "Seasonal", "Coming Soon"];

const emptyProduct = { product_name: "", category: "Cannabis — Standard", retail_price: 0, wholesale_price: 0, unit_of_measure: "Per Unit", product_description: "", internal_notes: "", product_status: "Active", supplier: "", last_stock_count: 0, latest_stock_count: 0, low_stock_threshold: 5 };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", padding: "10px 14px", color: "#F5F0E8", fontSize: "13px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function ProductFormDialog({ open, onOpenChange, product, onSave }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? {
      product_name: product.product_name || "",
      category: product.category || "Cannabis — Standard",
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price || 0,
      unit_of_measure: product.unit_of_measure || "Per Unit",
      product_description: product.product_description || "",
      internal_notes: product.internal_notes || "",
      product_status: product.product_status || "Active",
      supplier: product.supplier || "",
      last_stock_count: product.last_stock_count || 0,
      latest_stock_count: product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0,
      low_stock_threshold: product.low_stock_threshold ?? 5
    } : emptyProduct);
  }, [product, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      retail_price: Number(form.retail_price) || 0,
      wholesale_price: Number(form.wholesale_price) || 0,
      last_stock_count: Number(form.last_stock_count) || 0,
      latest_stock_count: Number(form.latest_stock_count) || 0,
      current_stock: Number(form.latest_stock_count) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
      new_stock_arrived: 0
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "520px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px", marginBottom: "4px" }}>
          <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          <div><label style={labelStyle}>Product Name</label><input required value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} style={inputStyle} placeholder="Product name" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>{categoryOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></div>
            <div><label style={labelStyle}>Status</label><select value={form.product_status} onChange={e => setForm({ ...form, product_status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>{statusOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Retail Price (R)</label><input type="number" min="0" step="0.01" value={form.retail_price} onChange={e => setForm({ ...form, retail_price: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Wholesale Price (R)</label><input type="number" min="0" step="0.01" value={form.wholesale_price} onChange={e => setForm({ ...form, wholesale_price: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Unit</label><select value={form.unit_of_measure} onChange={e => setForm({ ...form, unit_of_measure: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>{unitOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></div>
            <div><label style={labelStyle}>Source</label><input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} style={inputStyle} placeholder="Origin reference" onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Description</label><textarea value={form.product_description} onChange={e => setForm({ ...form, product_description: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Short internal description" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Last Stock Count</label><input type="number" min="0" value={form.last_stock_count} onChange={e => setForm({ ...form, last_stock_count: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Latest Stock Count</label><input type="number" min="0" value={form.latest_stock_count} onChange={e => setForm({ ...form, latest_stock_count: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Low Stock Threshold</label><input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Internal Notes</label><textarea value={form.internal_notes} onChange={e => setForm({ ...form, internal_notes: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Handling instructions, member preferences, supplier info" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "2px", color: "rgba(245,240,232,0.5)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid #C9A84C", borderRadius: "2px", color: "#C9A84C", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.2s" }} onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; } }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}>
              {saving ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}