import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";


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

function ProcurementStatus({ latestStockCount, threshold }) {
  const latest = Number(latestStockCount || 0);
  const limit = Number(threshold || 0);

  let label = "Sufficient.";
  let color = "#eee3b4";
  let fontWeight = 400;

  if (latest <= limit) {
    label = "Order immediately.";
    color = "#8d201c";
    fontWeight = 700;
  } else if (latest <= limit * 1.3) {
    label = "Order soon.";
    color = "#d29c6c";
  }

  return <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color, whiteSpace: "nowrap", fontWeight }}>{label}</span>;
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
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

  const filteredProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.product_name || "").localeCompare(b.product_name || ""));
  }, [products]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="The Catalogue" subtitle="Internal reference. Private operations only.">
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={12} /> Add Product</GoldBtn>
      </PageHeader>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(210,156,108,0.15)" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "26px", color: "#d29c6c", letterSpacing: "0.08em", margin: 0 }}>No Products</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(240,237,232,0.45)", marginTop: "10px" }}>Adjust the filters or add a new product entry.</p>
        </div>
      ) : (
        <div style={{ background: "#111111", border: "1px solid rgba(210,156,108,0.22)", overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "860px" }}>
              <thead>
                <tr style={{ background: "#0b0e11", borderBottom: "1px solid rgba(210,156,108,0.28)" }}>
                  {["Product Name", "Last Stock Count", "Latest Stock Count", "Procurement Status"].map((header) => (
                    <th key={header} style={{ padding: "14px 16px", textAlign: "left", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="number"
                            min="0"
                            value={draftCounts[product.id] ?? latestCount}
                            onChange={(e) => handleInlineLatestCountChange(product.id, e.target.value)}
                            onBlur={() => handleInlineLatestCountSave(product)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                            style={{ width: "96px", background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.14)", color: "#F5F0E8", padding: "8px 10px", fontFamily: "var(--font-body)", fontSize: "13px", borderRadius: "2px", outline: "none" }}
                          />
                          <button onClick={() => { setEditProduct(product); setFormOpen(true); }} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.16)", color: "rgba(240,237,232,0.52)", width: "34px", height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={13} /></button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}><ProcurementStatus latestStockCount={latestCount} threshold={product.low_stock_threshold} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSave={handleSave} />
    </div>
  );
}