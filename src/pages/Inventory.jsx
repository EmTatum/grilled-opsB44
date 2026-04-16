import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const categoryOptions = ["all", "Cannabis — Standard", "Cannabis — Premium", "In-Store Goods", "Concierge Items"];
const statusOptions = ["all", "Active", "Inactive", "Seasonal", "Coming Soon"];
const sortOptions = ["category", "status", "stock_level"];

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
        {options.map((option) => <option key={option} value={option}>{option === "all" ? `All ${label}` : option.replaceAll("_", " ")}</option>)}
      </select>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: { border: "1px solid rgba(210,156,108,0.45)", color: "#d29c6c", background: "rgba(210,156,108,0.08)" },
    Inactive: { border: "1px solid rgba(240,237,232,0.18)", color: "rgba(240,237,232,0.72)", background: "rgba(240,237,232,0.05)" },
    Seasonal: { border: "1px solid rgba(210,156,108,0.3)", color: "#eee3b4", background: "rgba(10,38,39,0.45)" },
    "Coming Soon": { border: "1px solid rgba(210,156,108,0.3)", color: "#eee3b4", background: "rgba(21,67,74,0.4)" }
  };
  const style = styles[status] || styles.Active;

  return <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "4px 10px", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: "2px" }}>{status}</span>;
}

function StockIndicator({ currentStock, threshold }) {
  const current = Number(currentStock || 0);
  const limit = Number(threshold || 0);
  let color = "#d29c6c";

  if (current <= limit) color = "#8d201c";
  else if (current <= limit * 1.2) color = "#b68a3d";
  else color = "#15434a";

  return <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "999px", background: color, boxShadow: `0 0 0 1px ${color}55` }} />;
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("category");

  const load = async () => {
    setProducts(await base44.entities.Product.list("-updated_date", 200));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    const isStockCheck = editProduct && Number(data.last_stock_count) !== Number(editProduct.last_stock_count);
    const payload = isStockCheck
      ? { ...data, new_stock_arrived: 0, current_stock: Number(data.last_stock_count) }
      : { ...data, current_stock: Number(data.last_stock_count || 0) + Number(data.new_stock_arrived || 0) };

    if (editProduct) await base44.entities.Product.update(editProduct.id, payload);
    else await base44.entities.Product.create(payload);

    setEditProduct(null);
    load();
  };

  const handleDelete = async () => {
    await base44.entities.Product.delete(deleteId);
    setDeleteId(null);
    load();
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatch = categoryFilter === "all" || product.category === categoryFilter;
      const statusMatch = statusFilter === "all" || product.product_status === statusFilter;
      return categoryMatch && statusMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "category") return (a.category || "").localeCompare(b.category || "") || (a.product_name || "").localeCompare(b.product_name || "");
      if (sortBy === "status") return (a.product_status || "").localeCompare(b.product_status || "") || (a.product_name || "").localeCompare(b.product_name || "");

      const aThreshold = Number(a.low_stock_threshold || 0);
      const bThreshold = Number(b.low_stock_threshold || 0);
      const aCurrent = Number(a.current_stock || 0);
      const bCurrent = Number(b.current_stock || 0);
      const aLevel = aCurrent <= aThreshold ? 0 : aCurrent <= aThreshold * 1.2 ? 1 : 2;
      const bLevel = bCurrent <= bThreshold ? 0 : bCurrent <= bThreshold * 1.2 ? 1 : 2;
      return aLevel - bLevel || (a.product_name || "").localeCompare(b.product_name || "");
    });
  }, [products, categoryFilter, statusFilter, sortBy]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="The Catalogue" subtitle="Internal reference. Private operations only.">
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={12} /> Add Product</GoldBtn>
      </PageHeader>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px", padding: "20px", background: "#0b0e11", border: "1px solid rgba(210,156,108,0.18)" }}>
        <FilterSelect label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} />
        <FilterSelect label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
        <FilterSelect label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={sortOptions} />
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(210,156,108,0.15)" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "26px", color: "#d29c6c", letterSpacing: "0.08em", margin: 0 }}>No Products</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.45)", marginTop: "10px" }}>Adjust the filters or add a new product entry.</p>
        </div>
      ) : (
        <div style={{ background: "#111111", border: "1px solid rgba(210,156,108,0.22)", overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1280px" }}>
              <thead>
                <tr style={{ background: "#0b0e11", borderBottom: "1px solid rgba(210,156,108,0.28)" }}>
                  {["Product Name", "Category", "Last Stock Count", "New Stock Arrived", "Current Stock", "Low Stock Threshold", "Status", "Stock Level Indicator", "Last Updated", ""].map((header, index) => (
                    <th key={header} style={{ padding: "14px 16px", textAlign: index === 7 ? "center" : index === 9 ? "right" : "left", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} style={{ background: index % 2 === 0 ? "#0b0e11" : "#1c191a", borderBottom: "1px solid rgba(255,255,255,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(10,38,39,0.55)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 0 ? "#0b0e11" : "#1c191a"; }}>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8", fontWeight: 500 }}>{product.product_name}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.78)" }}>{product.category}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8" }}>{Number(product.last_stock_count || 0)}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8" }}>{Number(product.new_stock_arrived || 0)}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8", fontWeight: 600 }}>{Number(product.current_stock || 0)}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.78)" }}>{Number(product.low_stock_threshold || 0)}</td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={product.product_status} /></td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}><StockIndicator currentStock={product.current_stock} threshold={product.low_stock_threshold} /></td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(240,237,232,0.65)", whiteSpace: "nowrap" }}>{product.updated_date ? new Date(product.updated_date).toLocaleString() : "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button onClick={() => { setEditProduct(product); setFormOpen(true); }} style={{ background: "transparent", border: "1px solid rgba(210,156,108,0.2)", color: "#d29c6c", width: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(product.id)} style={{ background: "transparent", border: "1px solid rgba(141,32,28,0.35)", color: "#8d201c", width: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSave={handleSave} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Product" description="This product will be removed from the catalogue." onConfirm={handleDelete} />
    </div>
  );
}