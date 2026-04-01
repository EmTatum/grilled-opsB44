import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const GoldButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
    style={{
      background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))",
      color: "#0a0a0a",
      fontFamily: "Inter, sans-serif",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      padding: "10px 22px",
      border: "none",
      borderRadius: "2px",
    }}
  >
    {children}
  </button>
);

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadProducts = async () => {
    const data = await base44.entities.Product.list("-created_date", 100);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSave = async (data) => {
    if (editProduct) {
      await base44.entities.Product.update(editProduct.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    setEditProduct(null);
    loadProducts();
  };

  const handleDelete = async () => {
    await base44.entities.Product.delete(deleteId);
    setDeleteId(null);
    loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: "hsl(40 57% 54% / 0.2)", borderTopColor: "hsl(40 57% 54%)" }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Product stock levels and management">
        <GoldButton onClick={() => { setEditProduct(null); setFormOpen(true); }}>
          <Plus size={12} strokeWidth={2} /> Add Product
        </GoldButton>
      </PageHeader>

      {products.length === 0 ? (
        <div className="text-center py-20 rounded-sm" style={{ border: "1px dashed hsl(40 20% 18%)" }}>
          <p className="font-heading" style={{ fontSize: "22px", color: "hsl(36 40% 60%)" }}>No products yet</p>
          <p style={{ fontSize: "12px", color: "hsl(36 10% 40%)", marginTop: "8px", fontFamily: "Inter, sans-serif" }}>Add your first product to get started.</p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{ border: "1px solid hsl(40 20% 15%)" }}>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#111111", borderBottom: "1px solid hsl(40 20% 14%)" }}>
                  {["Product", "Category", "Last Stock", "New Arrived", "Current Stock", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 ${i >= 2 && i < 5 ? "text-center" : i === 5 ? "text-right" : "text-left"}`}
                      style={{ fontSize: "9px", color: "hsl(36 10% 42%)", fontFamily: "Inter, sans-serif", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "#141414" }}>
                {products.map((p, idx) => {
                  const isLow = p.current_stock < (p.low_stock_threshold || 5);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: idx < products.length - 1 ? "1px solid hsl(40 20% 11%)" : "none",
                        background: isLow ? "hsl(333 72% 43% / 0.04)" : "transparent",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = isLow ? "hsl(333 72% 43% / 0.08)" : "hsl(40 57% 54% / 0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = isLow ? "hsl(333 72% 43% / 0.04)" : "transparent"}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle size={13} strokeWidth={1.5} style={{ color: "hsl(333 72% 60%)", flexShrink: 0 }} />}
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "hsl(36 40% 88%)", fontWeight: 500 }}>{p.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "hsl(36 10% 50%)" }}>{p.category}</td>
                      <td className="px-6 py-4 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "hsl(36 10% 52%)" }}>{p.last_stock_count}</td>
                      <td className="px-6 py-4 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "hsl(36 10% 52%)" }}>{p.new_stock_arrived}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="font-heading font-semibold"
                          style={{ fontSize: "22px", color: isLow ? "hsl(333 72% 62%)" : "hsl(40 57% 58%)", lineHeight: 1 }}
                        >
                          {p.current_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditProduct(p); setFormOpen(true); }}
                            className="p-2 rounded-sm transition-all"
                            style={{ color: "hsl(36 10% 45%)" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "hsl(40 57% 54%)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                          >
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 rounded-sm transition-all"
                            style={{ color: "hsl(36 10% 45%)" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "hsl(0 65% 55%)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "hsl(36 10% 45%)"}
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden" style={{ background: "#141414" }}>
            {products.map((p, idx) => {
              const isLow = p.current_stock < (p.low_stock_threshold || 5);
              return (
                <div
                  key={p.id}
                  className="p-5"
                  style={{
                    borderBottom: idx < products.length - 1 ? "1px solid hsl(40 20% 11%)" : "none",
                    background: isLow ? "hsl(333 72% 43% / 0.05)" : "transparent",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={13} style={{ color: "hsl(333 72% 60%)" }} />}
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "hsl(36 40% 88%)", fontWeight: 500 }}>{p.product_name}</p>
                      </div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "hsl(36 10% 45%)", marginTop: "2px" }}>{p.category}</p>
                    </div>
                    <span className="font-heading font-semibold" style={{ fontSize: "28px", color: isLow ? "hsl(333 72% 60%)" : "hsl(40 57% 58%)", lineHeight: 1 }}>
                      {p.current_stock}
                    </span>
                  </div>
                  <div className="flex gap-5 mb-3">
                    <span style={{ fontSize: "11px", color: "hsl(36 10% 42%)", fontFamily: "Inter, sans-serif" }}>Last: {p.last_stock_count}</span>
                    <span style={{ fontSize: "11px", color: "hsl(36 10% 42%)", fontFamily: "Inter, sans-serif" }}>New: {p.new_stock_arrived}</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { setEditProduct(p); setFormOpen(true); }}
                      style={{ fontSize: "11px", color: "hsl(40 57% 54%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>EDIT</button>
                    <button onClick={() => setDeleteId(p.id)}
                      style={{ fontSize: "11px", color: "hsl(0 65% 55%)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>DELETE</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Product" description="This product will be permanently removed from inventory." onConfirm={handleDelete} />
    </div>
  );
}