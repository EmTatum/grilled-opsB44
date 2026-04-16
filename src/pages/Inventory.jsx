import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid var(--color-gold)", color: "var(--color-gold)",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.boxShadow = "0 0 20px rgba(201,168,76,0.3)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.boxShadow = "none"; }}
  >{children}</button>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(201,168,76,0.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
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

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Product stock levels and management">
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={12} /> Add Product</GoldBtn>
      </PageHeader>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(201,168,76,0.15)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "rgba(201,168,76,0.4)", letterSpacing: "0.15em" }}>No Products Yet</p>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.25)", marginTop: "8px" }}>Add your first product to get started.</p>
        </div>
      ) : (
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 0, overflow: "hidden" }}>
          {/* Decorative header bar */}
          <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,168,76,0.25)", padding: "14px 20px" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "0.25em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase" }}>Inventory</span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d0d0d", borderBottom: "1px solid rgba(201,168,76,0.3)" }}>
                  {["Product", "Category", "Catalogue Details", "Last Stock Take", "New Stock Take", "Current Stock", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "14px 16px", textAlign: i >= 3 && i < 6 ? "center" : i === 7 ? "right" : "left", fontFamily: "'Raleway', sans-serif", fontSize: "10px", fontWeight: 600, color: "rgba(201,168,76,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.current_stock < (p.low_stock_threshold || 5);
                  return (
                    <tr key={p.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", background: isLow ? "rgba(194,24,91,0.03)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = isLow ? "rgba(194,24,91,0.06)" : "rgba(201,168,76,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = isLow ? "rgba(194,24,91,0.03)" : "transparent"}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isLow && <AlertTriangle size={12} strokeWidth={1.5} style={{ color: "#C2185B", flexShrink: 0 }} />}
                          <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "#F5F0E8", fontWeight: 500 }}>{p.product_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>{p.category}</td>
                      <td style={{ padding: "14px 16px", minWidth: "280px" }}>
                        <div style={{ display: "grid", gap: "6px" }}>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C" }}>Unit R{Number(p.unit_price || 0).toFixed(2)}</span>
                            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "rgba(245,240,232,0.72)" }}>Wholesale R{Number(p.wholesale_price || 0).toFixed(2)}</span>
                          </div>
                          {p.product_description && <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.68)", lineHeight: 1.6 }}>{p.product_description}</p>}
                          {p.notes && <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(201,168,76,0.6)", lineHeight: 1.5 }}>Notes: {p.notes}</p>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{p.last_stock_count}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center", fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.45)" }}>{p.new_stock_arrived}</td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "24px", fontWeight: 600, color: isLow ? "#C2185B" : "#C9A84C", lineHeight: 1 }}>{p.current_stock}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", border: isLow ? "1px solid rgba(194,24,91,0.5)" : "1px solid rgba(201,168,76,0.35)", background: isLow ? "rgba(194,24,91,0.08)" : "rgba(201,168,76,0.07)", color: isLow ? "#C2185B" : "#C9A84C" }}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontFamily: "'Raleway', sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", border: isLow ? "1px solid rgba(194,24,91,0.5)" : "1px solid rgba(201,168,76,0.35)", background: isLow ? "rgba(194,24,91,0.08)" : "rgba(201,168,76,0.07)", color: isLow ? "#C2185B" : "#C9A84C" }}>
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                          <button onClick={() => { setEditProduct(p); setFormOpen(true); }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}>
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.28)", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C2185B"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.28)"}>
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

          {/* Mobile */}
          <div className="md:hidden">
            {products.map((p, idx) => {
              const isLow = p.current_stock < (p.low_stock_threshold || 5);
              return (
                <div key={p.id} style={{ padding: "18px 20px", borderBottom: idx < products.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isLow ? "rgba(194,24,91,0.03)" : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isLow && <AlertTriangle size={12} style={{ color: "#C2185B" }} />}
                      <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "14px", color: "#F5F0E8", fontWeight: 500 }}>{p.product_name}</p>
                    </div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "26px", fontWeight: 600, color: isLow ? "#C2185B" : "#C9A84C", lineHeight: 1 }}>{p.current_stock}</span>
                  </div>
                  <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.35)", marginBottom: "8px" }}>{p.category}</p>
                  <div style={{ display: "grid", gap: "6px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "#C9A84C" }}>Unit R{Number(p.unit_price || 0).toFixed(2)}</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "14px", color: "rgba(245,240,232,0.72)" }}>Wholesale R{Number(p.wholesale_price || 0).toFixed(2)}</span>
                    </div>
                    {p.product_description && <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.68)", lineHeight: 1.6 }}>{p.product_description}</p>}
                    {p.notes && <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "rgba(201,168,76,0.6)", lineHeight: 1.5 }}>Notes: {p.notes}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.35)" }}>Last: {p.last_stock_count}</span>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.35)" }}>New: {p.new_stock_arrived}</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button onClick={() => { setEditProduct(p); setFormOpen(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", padding: 0 }}>Edit</button>
                    <button onClick={() => setDeleteId(p.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#C2185B", letterSpacing: "0.15em", textTransform: "uppercase", padding: 0 }}>Delete</button>
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