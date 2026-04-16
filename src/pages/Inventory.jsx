import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil } from "lucide-react";
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

const PRODUCT_RULES = {
  "Changa": { warn: 5, critical: 3 },
  "Cola": { warn: 20, critical: 10 },
  "Dougies": { warn: 4, critical: 2 },
  "MD": { warn: 6, critical: 2 },
  "Bud": { warn: 10, critical: 6 },
  "Mushrooms": { warn: 20, critical: 10 },
  "Ketamine": { warn: 3, critical: 2 },
  "Ecstasy": { warn: 10, critical: 8 },
  "Zolpidiem": { warn: 4, critical: 2 },
  "Acid": { warn: 40, critical: 10 },
  "Xannie Pots": { warn: 4, critical: 2 }
};

const PRODUCT_NAME_MAP = {
  "Changaland": "Changa",
  "Changa": "Changa",
  "Cola": "Cola",
  "Dougies": "Dougies",
  "Love MD": "MD",
  "MD": "MD",
  "Mary Jane": "Bud",
  "Bud": "Bud",
  "Mushie Nuggets": "Mushrooms",
  "Mushrooms": "Mushrooms",
  "Special k": "Ketamine",
  "Ketamine": "Ketamine",
  "Sweets": "Ecstasy",
  "Ecstasy": "Ecstasy",
  "Zol-Pies": "Zolpidiem",
  "Zolpidiem": "Zolpidiem",
  "Acid": "Acid",
  "Xannie pots": "Xannie Pots",
  "Xannie Pots": "Xannie Pots"
};

function normalizeProductName(name) {
  return PRODUCT_NAME_MAP[name] || name;
}

function ProcurementStatus({ productName, latestStockCount }) {
  const normalizedName = normalizeProductName(productName);
  const latest = Number(latestStockCount || 0);
  const rule = PRODUCT_RULES[normalizedName];

  let label = "Sufficient";
  let color = "#2E8B57";
  let background = "rgba(46,139,87,0.18)";

  if (rule && latest < rule.critical) {
    label = "NB ORDER";
    color = "#F5F0E8";
    background = "#8d201c";
  } else if (rule && latest < rule.warn) {
    label = "Need to Order";
    color = "#0a0a0a";
    background = "#d29c6c";
  }

  return <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", color, background, fontWeight: 600, borderRadius: "2px" }}>{label}</span>;
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
    return [...products]
      .map((product) => ({ ...product, display_name: normalizeProductName(product.product_name || "") }))
      .filter((product) => Object.keys(PRODUCT_RULES).includes(product.display_name))
      .sort((a, b) => (a.display_name || "").localeCompare(b.display_name || ""));
  }, [products]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <GoldBtn onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus size={12} /> Add Product</GoldBtn>
      </div>

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
                  {["Product Name", "Last Stock Count", "Latest Stock Count", "Status"].map((header) => (
                    <th key={header} style={{ padding: "14px 16px", textAlign: "left", fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "#eee3b4", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const latestCount = Number(product.latest_stock_count ?? product.current_stock ?? product.last_stock_count ?? 0);
                  return (
                    <tr key={product.id} style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.04)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#f0ede8", fontWeight: 700, whiteSpace: "nowrap" }}>{product.display_name}</td>
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
                      <td style={{ padding: "12px 16px" }}><ProcurementStatus productName={product.display_name} latestStockCount={latestCount} /></td>
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