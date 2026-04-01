import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
    transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
  >{children}</button>
);

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => { setProducts(await base44.entities.Product.list("-created_date", 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editProduct) await base44.entities.Product.update(editProduct.id, data);
    else await base44.entities.Product.create(data);
    setEditProduct(null); load();
  };
  const handleDelete = async () => { await base44.entities.Product.delete(deleteId); setDeleteId(null); load(); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Product stock levels and management">
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={13} /> Add Product</GoldBtn>
      </PageHeader>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.2)", borderRadius: "2px" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "22px", color: "rgba(201,168,76,0.5)" }}>No products yet</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.3)", marginTop: "8px" }}>Add your first product to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block" style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                  {["Product", "Category", "Last Stock", "New Arrived", "Current Stock", ""].map((h, i) => (
                    <th key={i} style={{ padding: "14px 20px", textAlign: i >= 2 && i < 5 ? "center" : i === 5 ? "right" : "left", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, color: "rgba(201,168,76,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.current_stock < (p.low_stock_threshold || 5);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s ease", background: isLow ? "rgba(194,24,91,0.03)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = isLow ? "rgba(194,24,91,0.06)" : "rgba(201,168,76,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = isLow ? "rgba(194,24,91,0.03)" : "transparent"}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isLow && <AlertTriangle size={13} strokeWidth={1.5} style={{ color: "#C2185B", flexShrink: 0 }} />}
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{p.product_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.6)" }}>{p.category}</td>
                      <td style={{ padding: "16px 20px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.55)" }}>{p.last_stock_count}</td>
                      <td style={{ padding: "16px 20px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.55)" }}>{p.new_stock_arrived}</td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 600, color: isLow ? "#C2185B" : "#C9A84C", lineHeight: 1 }}>{p.current_stock}</span>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                          <button onClick={() => { setEditProduct(p); setFormOpen(true); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.35)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.35)"}>
                            <Pencil size={14} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.35)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.35)"}>
                            <Trash2 size={14} strokeWidth={1.5} />
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
          <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {products.map(p => {
              const isLow = p.current_stock < (p.low_stock_threshold || 5);
              return (
                <div key={p.id} style={{ background: "#1a1a1a", border: `1px solid ${isLow ? "rgba(194,24,91,0.3)" : "rgba(201,168,76,0.2)"}`, borderRadius: "2px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isLow && <AlertTriangle size={13} style={{ color: "#C2185B" }} />}
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#F5F0E8", fontWeight: 500 }}>{p.product_name}</p>
                    </div>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 600, color: isLow ? "#C2185B" : "#C9A84C", lineHeight: 1 }}>{p.current_stock}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.4)", marginBottom: "10px" }}>{p.category}</p>
                  <div style={{ display: "flex", gap: "20px", marginBottom: "14px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.4)" }}>Last: {p.last_stock_count}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.4)" }}>New: {p.new_stock_arrived}</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button onClick={() => { setEditProduct(p); setFormOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px", color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0 }}>Edit</button>
                    <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px", color: "#C2185B", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0 }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Product" description="This product will be permanently removed from inventory." onConfirm={handleDelete} />
    </div>
  );
}