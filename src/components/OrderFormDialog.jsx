import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyOrder = { client_name: "", selected_product_id: "", order_details: "", quantity: 1, delivery_address: "", special_instructions: "", priority_level: "Medium", order_value: "", time_slot: "", payment_method: "Cash", payment_status: "PENDING", order_date: "", status: "Pending", planner_status: "Pending" };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#1c191a", border: "1px solid rgba(210,156,108,0.2)", borderRadius: "2px", padding: "10px 14px", color: "#F5F0E8", fontSize: "14px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0" };
const onFocus = e => { e.target.style.borderColor = "#d29c6c"; e.target.style.boxShadow = "0 0 0 2px rgba(210,156,108,0.15)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(210,156,108,0.2)"; e.target.style.boxShadow = "none"; };

export default function OrderFormDialog({ open, onOpenChange, order, onSave }) {
  const [form, setForm] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    base44.entities.Product.list("product_name", 200).then((data) => setProducts(data || []));
  }, []);

  useEffect(() => {
    setForm(order ? {
      client_name: order.client_name || "",
      selected_product_id: order.selected_product_id || "",
      order_details: order.order_details || "",
      quantity: order.quantity || 1,
      delivery_address: order.delivery_address || "",
      special_instructions: order.special_instructions || "",
      priority_level: order.priority_level || "Medium",
      order_value: order.order_value || "",
      time_slot: order.time_slot || "",
      payment_method: order.payment_method || "Cash",
      payment_status: order.payment_status || "PENDING",
      order_date: order.order_date ? order.order_date.slice(0, 16) : "",
      status: order.status || "Pending",
      planner_status: order.planner_status || "Pending",
      source_report_id: order.source_report_id || ""
    } : emptyOrder);
  }, [order, open]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.selected_product_id) || null,
    [products, form.selected_product_id]
  );

  const handleProductChange = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      setForm({ ...form, selected_product_id: "" });
      return;
    }

    const quantity = Number(form.quantity) || 1;
    setForm({
      ...form,
      selected_product_id: product.id,
      order_details: product.product_description
        ? `${product.product_name} — ${product.product_description}`
        : product.product_name,
      order_value: (Number(product.retail_price || 0) * quantity).toFixed(2)
    });
  };

  const handleQuantityChange = (value) => {
    const quantity = Number(value) || 1;
    setForm((current) => ({
      ...current,
      quantity: value,
      order_value: current.selected_product_id
        ? (Number(selectedProduct?.retail_price || 0) * quantity).toFixed(2)
        : current.order_value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave({ ...form, quantity: Number(form.quantity) || 1, order_value: Number(form.order_value) || 0, order_date: new Date(form.order_date).toISOString() });
    setSaving(false); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1c191a", border: "1px solid rgba(210,156,108,0.3)", borderRadius: "2px", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "460px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px", marginBottom: "4px" }}>
          <DialogTitle style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            {order ? "Edit Order" : "New Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          <div><label style={labelStyle}>Client Name</label><input required value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} style={inputStyle} placeholder="Enter client name" onFocus={onFocus} onBlur={onBlur} /></div>
          <div>
            <label style={labelStyle}>Product Catalogue</label>
            <select value={form.selected_product_id} onChange={e => handleProductChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name} · {product.category} · R{Number(product.retail_price || 0).toFixed(2)} · Stock {Number(product.current_stock || 0)}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(210,156,108,0.08)", border: "1px solid rgba(210,156,108,0.18)", borderRadius: "2px" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--color-gold)" }}>{selectedProduct.product_name}</p>
                {selectedProduct.product_description && <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.72)", lineHeight: 1.6 }}>{selectedProduct.product_description}</p>}
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(210,156,108,0.75)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{selectedProduct.category} · Retail R{Number(selectedProduct.retail_price || 0).toFixed(2)} · Stock {Number(selectedProduct.current_stock || 0)}</p>
              </div>
            )}
          </div>
          <div><label style={labelStyle}>Items Ordered</label><textarea required value={form.order_details} onChange={e => setForm({ ...form, order_details: e.target.value })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="List items ordered..." onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Quantity</label><input type="number" min="1" step="1" value={form.quantity} onChange={e => handleQuantityChange(e.target.value)} style={inputStyle} placeholder="1" onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Priority Level</label>
              <select value={form.priority_level} onChange={e => setForm({ ...form, priority_level: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["Low", "Medium", "High"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Delivery Address</label><textarea required value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Enter full delivery address" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Delivery Date</label><input required type="datetime-local" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Time Slot</label><input value={form.time_slot} onChange={e => setForm({ ...form, time_slot: e.target.value })} style={inputStyle} placeholder="e.g. 3:00 PM – 5:00 PM" onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Special Instructions / Notes</label><textarea value={form.special_instructions} onChange={e => setForm({ ...form, special_instructions: e.target.value })} style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }} placeholder="Add delivery notes, gate codes, or handling details" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Order Value (R)</label><input type="number" min="0" step="0.01" value={form.order_value} onChange={e => setForm({ ...form, order_value: e.target.value })} style={inputStyle} placeholder="0.00" onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["Cash", "Card", "Bank Transfer", "Credit on Account", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Payment Status</label>
              <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["PAID", "CASH", "PENDING"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Workflow Status</label>
              <select value={form.planner_status} onChange={e => setForm({ ...form, planner_status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["Pending", "Processing", "Dispatched", "Complete"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Legacy Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {["Pending", "Confirmed", "Fulfilled", "Cancelled", "Complete"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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