import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

function ProcurementStatus({ latestStockCount, threshold }) {
  const latest = Number(latestStockCount || 0);
  const limit = Number(threshold || 0);

  let label = "Sufficient.";
  let color = "#eee3b4";

  if (latest <= 0 || (limit > 0 && latest <= limit * 0.5)) {
    label = "Critical. Order immediately.";
    color = "#8d201c";
  } else if (latest <= limit) {
    label = "Order required.";
    color = "#8d201c";
  } else if (latest <= limit * 1.3) {
    label = "Running low. Monitor.";
    color = "#d29c6c";
  }

  return <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color, whiteSpace: "nowrap" }}>{label}</span>;
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
  const [draftCounts, setDraftCounts] = useState({});

  const load = async () => {
    setProducts(await base44.entities.Product.list("-updated_date", 200));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const nextDrafts = {};
    products.forEach((product) => {
      nextDrafts[product.id] = String(product.current_stock ?? product.last_stock_count ?? 0);
    });
    setDraftCounts(nextDrafts);
  }, [products]);

  const handleSave = async (data) => {
    const latestCount = Number(data.latest_stock_count ?? data.current_stock ?? data.last_stock_count ?? 0);
    const previousLatest = Number(editProduct?.latest_stock_count ?? editProduct?.current_stock ?? editProduct?.last_stock_count ?? 0);
    const hasLatestChanged = editProduct && latestCount !== previousLatest;

    const payload = {
      ...data,
      last_stock_count: hasLatestChanged ? previousLatest : Number(data.last_stock_count ?? editProduct?.last_stock_count ?? 0),
      latest_stock_count: latestCount,
      current_stock: latestCount,
      new_stock_arrived: 0,
      low_stock_threshold: Number(data.low_stock_threshold ?? 0)
    };

    if (editProduct) await base44.entities.Product.update(editProduct.id, payload);
    else await base44.entities.Product.create(payload);

    setEditProduct(null);
    load();
  };

  const handleInlineLatestCountChange = (productId, value) => {
    setDraftCounts((current) => ({ ...current, [productId]: value }));
  };

  const handleInlineLatestCountSave = async (product) => {
    const rawValue = draftCounts[product.id];
    const latestCount = Number(rawValue);
    if (Number.isNaN(latestCount)) return;

    const previousLatest = Number(product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0);
    const payload = {
      last_stock_count: previousLatest,
      latest_stock_count: latestCount,
      current_stock: latestCount,
      new_stock_arrived: 0
    };

    await base44.entities.Product.update(product.id, payload);
    load();
  };

  const handleInlineThresholdSave = async (product, value) => {
    const threshold = Number(value);
    if (Number.isNaN(threshold)) return;
    await base44.entities.Product.update(product.id, { low_stock_threshold: threshold });
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

      const getLevel = (product) => {
        const latest = Number(product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0);
        const limit = Number(product.low_stock_threshold || 0);
        if (latest <= 0 || (limit > 0 && latest <= limit * 0.5)) return 0;
        if (latest <= limit) return 1;
        if (latest <= limit * 1.3) return 2;
        return 3;
      };

      return getLevel(a) - getLevel(b) || (a.product_name || "").localeCompare(b.product_name || "");
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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1320px" }}>
              <thead>
                <tr style={{ background: "#0b0e11", borderBottom: "1px solid rgba(210,156,108,0.28)" }}>
                  {["Product Name", "Last Stock Count", "Latest Stock Count", "Procurement Status", "Low Stock Threshold", "Category", "Status", "Last Updated", ""].map((header, index) => (
                    <th key={header} style={{ padding: "14px 16px", textAlign: index === 8 ? "right" : "left", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const latestCount = Number(product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0);
                  return (
                    <tr key={product.id} style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8", fontWeight: 700, whiteSpace: "nowrap" }}>{product.product_name}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.72)" }}>{Number(product.last_stock_count || 0)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="number"
                          min="0"
                          value={draftCounts[product.id] ?? latestCount}
                          onChange={(e) => handleInlineLatestCountChange(product.id, e.target.value)}
                          onBlur={() => handleInlineLatestCountSave(product)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                          style={{ width: "88px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", padding: "8px 10px", fontFamily: "var(--font-body)", fontSize: "13px", borderRadius: "2px", outline: "none" }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px" }}><ProcurementStatus latestStockCount={latestCount} threshold={product.low_stock_threshold} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="number"
                          min="0"
                          defaultValue={Number(product.low_stock_threshold || 0)}
                          onBlur={(e) => handleInlineThresholdSave(product, e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                          style={{ width: "88px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", color: "#F5F0E8", padding: "8px 10px", fontFamily: "var(--font-body)", fontSize: "13px", borderRadius: "2px", outline: "none" }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.78)", whiteSpace: "nowrap" }}>{product.category}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={product.product_status} /></td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(240,237,232,0.65)", whiteSpace: "nowrap" }}>{product.updated_date ? new Date(product.updated_date).toLocaleString() : "—"}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button onClick={() => { setEditProduct(product); setFormOpen(true); }} style={{ background: "transparent", border: "1px solid rgba(210,156,108,0.2)", color: "#d29c6c", width: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={13} /></button>
                          <button onClick={() => setDeleteId(product.id)} style={{ background: "transparent", border: "1px solid rgba(141,32,28,0.35)", color: "#8d201c", width: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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