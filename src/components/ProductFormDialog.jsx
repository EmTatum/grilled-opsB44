import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct = { product_name: "", category: "", last_stock_count: 0, new_stock_arrived: 0, low_stock_threshold: 5 };

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

export default function ProductFormDialog({ open, onOpenChange, product, onSave }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        product_name: product.product_name || "",
        category: product.category || "",
        last_stock_count: product.last_stock_count || 0,
        new_stock_arrived: product.new_stock_arrived || 0,
        low_stock_threshold: product.low_stock_threshold ?? 5,
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product, open]);

  const currentStock = Number(form.last_stock_count || 0) + Number(form.new_stock_arrived || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      last_stock_count: Number(form.last_stock_count),
      new_stock_arrived: Number(form.new_stock_arrived),
      current_stock: currentStock,
      low_stock_threshold: Number(form.low_stock_threshold),
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#161616", border: "1px solid hsl(40 20% 18%)", borderRadius: "2px", maxWidth: "460px" }}>
        <DialogHeader>
          <DialogTitle className="font-heading" style={{ fontSize: "24px", color: "hsl(36 40% 90%)" }}>
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
          <div className="h-px mt-1 mb-1" style={{ background: "linear-gradient(90deg, hsl(40 57% 54% / 0.4), transparent)" }} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <label style={labelStyle}>Product Name</label>
            <input required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              style={inputStyle} placeholder="Product name"
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={inputStyle} placeholder="e.g. Flower, Edibles, Concentrates"
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Last Stock Count</label>
              <input required type="number" min="0" value={form.last_stock_count}
                onChange={(e) => setForm({ ...form, last_stock_count: e.target.value })}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
                onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
            </div>
            <div>
              <label style={labelStyle}>New Stock Arrived</label>
              <input required type="number" min="0" value={form.new_stock_arrived}
                onChange={(e) => setForm({ ...form, new_stock_arrived: e.target.value })}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
                onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Current Stock</label>
              <div style={{ ...inputStyle, background: "#0d0d0d", color: "hsl(40 57% 58%)", fontWeight: 600, cursor: "default", display: "flex", alignItems: "center" }}>
                {currentStock} units
              </div>
            </div>
            <div>
              <label style={labelStyle}>Low Stock Threshold</label>
              <input type="number" min="0" value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
                onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              style={{ padding: "9px 20px", background: "transparent", border: "1px solid hsl(40 20% 20%)", borderRadius: "2px", color: "hsl(36 30% 70%)", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))", border: "none", borderRadius: "2px", color: "#0a0a0a", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}