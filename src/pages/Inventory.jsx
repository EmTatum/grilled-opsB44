import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const categoryOptions = ["all", "Cannabis — Standard", "Cannabis — Premium", "In-Store Goods", "Concierge Items"];
const statusOptions = ["all", "Active", "Inactive", "Seasonal", "Coming Soon"];
const categoryOrder = ["Cannabis — Standard", "Cannabis — Premium", "In-Store Goods", "Concierge Items"];

const GoldBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid var(--color-gold)", color: "var(--color-gold)",
    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500,
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 24px",
    borderRadius: "2px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease"
  }}>{children}</button>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ width: "24px", height: "24px", border: "1px solid rgba(210,156,108,0.2)", borderTopColor: "#d29c6c", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ minWidth: "220px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</label>
      <select value={value} onChange={onChange} style={{ width: "100%", background: "#1c191a", border: "1px solid rgba(210,156,108,0.25)", color: "#f0ede8", padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: "13px", borderRadius: "2px", outline: "none" }}>
        {options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label}` : option}</option>)}
      </select>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: { border: "1px solid rgba(210,156,108,0.45)", color: "#d29c6c", background: "rgba(210,156,108,0.08)" },
    Inactive: { border: "1px solid rgba(240,237,232,0.18)", color: "rgba(240,237,232,0.72)", background: "rgba(240,237,232,0.05)" },
    Seasonal: { border: "1px solid rgba(10,38,39,0.7)", color: "#eee3b4", background: "rgba(10,38,39,0.45)" },
    "Coming Soon": { border: "1px solid rgba(21,67,74,0.75)", color: "#eee3b4", background: "rgba(21,67,74,0.4)" }
  };
  const style = styles[status] || styles.Active;

  return <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "4px 10px", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: "2px" }}>{status}</span>;
}

function CategoryBadge({ category }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", border: "1px solid rgba(210,156,108,0.22)", color: "#eee3b4", background: "rgba(210,156,108,0.06)", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: "2px" }}>{category}</span>;
}

function ProductCard({ product, expanded, onToggle, onEdit, onDelete }) {
  const isLow = Number(product.current_stock || 0) <= Number(product.low_stock_threshold || 0);

  return (
    <div style={{ background: "#1c191a", border: isLow ? "1px solid rgba(141,32,28,0.65)" : "1px solid rgba(210,156,108,0.22)", boxShadow: "inset 0 0 0 1px rgba(210,156,108,0.08)", position: "relative" }}>
      <div style={{ position: "absolute", top: "10px", left: "10px", width: "16px", height: "16px", borderTop: "1px solid rgba(210,156,108,0.5)", borderLeft: "1px solid rgba(210,156,108,0.5)" }} />
      <div style={{ position: "absolute", bottom: "10px", right: "10px", width: "16px", height: "16px", borderBottom: "1px solid rgba(210,156,108,0.5)", borderRight: "1px solid rgba(210,156,108,0.5)" }} />

      <button onClick={onToggle} style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", color: "inherit", padding: "24px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#d29c6c", letterSpacing: "0.04em", lineHeight: 1.1 }}>{product.product_name}</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              <CategoryBadge category={product.category} />
              <StatusBadge status={product.product_status} />
            </div>
          </div>
          <div style={{ color: "#eee3b4" }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }} className="max-sm:!grid-cols-1">
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Retail Price</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: "24px", color: "#f0ede8" }}>R{Number(product.retail_price || 0).toFixed(2)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Stock / Threshold</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: "24px", color: isLow ? "#8d201c" : "#f0ede8" }}>{product.current_stock || 0} / {product.low_stock_threshold || 0}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Unit</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "14px", color: "#f0ede8" }}>{product.unit_of_measure}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(210,156,108,0.16)" }}>
          <div style={{ display: "grid", gap: "14px", paddingTop: "18px" }}>
            {product.product_description && (
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Description</p>
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.7, color: "#f0ede8" }}>{product.product_description}</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }} className="max-sm:!grid-cols-1">
              <div><p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Wholesale Price</p><p style={{ margin: "6px 0 0", fontFamily: "var(--font-heading)", fontSize: "20px", color: "#d29c6c" }}>R{Number(product.wholesale_price || 0).toFixed(2)}</p></div>
              <div><p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Source</p><p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8" }}>{product.supplier || "—"}</p></div>
              <div><p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Stock Ledger</p><p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8" }}>Last {product.last_stock_count || 0} · New {product.new_stock_arrived || 0}</p></div>
            </div>
            {product.internal_notes && (
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>Internal Notes</p>
                <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.7, color: "rgba(240,237,232,0.78)" }}>{product.internal_notes}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "6px" }}>
              <button onClick={onEdit} style={{ background: "#1c191a", border: "1px solid #d29c6c", color: "#d29c6c", padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}><Pencil size={12} /> Edit</button>
              <button onClick={onDelete} style={{ background: "#8d201c", border: "1px solid #8d201c", color: "#f0ede8", padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}><Trash2 size={12} /> Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setProducts(await base44.entities.Product.list("product_name", 200));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editProduct) await base44.entities.Product.update(editProduct.id, data);
    else await base44.entities.Product.create(data);
    setEditProduct(null);
    load();
  };

  const handleDelete = async () => {
    await base44.entities.Product.delete(deleteId);
    setDeleteId(null);
    load();
  };

  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = categoryFilter === "all" || product.category === categoryFilter;
    const statusMatch = statusFilter === "all" || product.product_status === statusFilter;
    return categoryMatch && statusMatch;
  }), [products, categoryFilter, statusFilter]);

  const groupedProducts = useMemo(() => categoryOrder.map((category) => ({
    category,
    items: filteredProducts.filter((product) => product.category === category)
  })).filter((group) => group.items.length > 0), [filteredProducts]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="The Catalogue" subtitle="Product reference, stock position, and access-ready pricing.">
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={12} /> Add Product</GoldBtn>
      </PageHeader>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "28px", padding: "20px", background: "#0b0e11", border: "1px solid rgba(210,156,108,0.18)" }}>
        <FilterSelect label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} />
        <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
      </div>

      {groupedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(210,156,108,0.15)" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "26px", color: "#d29c6c", letterSpacing: "0.08em", margin: 0 }}>No Products</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.45)", marginTop: "10px" }}>Adjust the filters or add a new product entry.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "34px" }}>
          {groupedProducts.map((group) => (
            <section key={group.category}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase" }}>{group.category}</p>
                <div style={{ flex: 1, height: "1px", background: "rgba(210,156,108,0.18)" }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase" }}>{group.items.length} items</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
                {group.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    expanded={expandedId === product.id}
                    onToggle={() => setExpandedId(expandedId === product.id ? null : product.id)}
                    onEdit={() => { setEditProduct(product); setFormOpen(true); }}
                    onDelete={() => setDeleteId(product.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Product" description="This product will be removed from the catalogue." onConfirm={handleDelete} />
    </div>
  );
}