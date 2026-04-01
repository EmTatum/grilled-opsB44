import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/PageHeader";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

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
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Track product stock levels">
        <Button
          onClick={() => { setEditProduct(null); setFormOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </PageHeader>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-heading">No products yet</p>
          <p className="text-sm mt-1">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Product</th>
                  <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Category</th>
                  <th className="text-center px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Last Stock</th>
                  <th className="text-center px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">New Arrived</th>
                  <th className="text-center px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Current Stock</th>
                  <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.current_stock < (p.low_stock_threshold || 5);
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-border/50 transition-colors ${
                        isLow ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-secondary/20"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />}
                          <span className="font-medium text-foreground">{p.product_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                      <td className="px-5 py-4 text-center text-muted-foreground">{p.last_stock_count}</td>
                      <td className="px-5 py-4 text-center text-muted-foreground">{p.new_stock_arrived}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`font-heading font-bold text-lg ${isLow ? "text-red-400" : "text-primary"}`}>
                          {p.current_stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditProduct(p); setFormOpen(true); }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-md hover:bg-secondary"
                          >
                            <Trash2 size={14} />
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
          <div className="md:hidden divide-y divide-border">
            {products.map((p) => {
              const isLow = p.current_stock < (p.low_stock_threshold || 5);
              return (
                <div key={p.id} className={`p-4 ${isLow ? "bg-red-500/5" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={14} className="text-red-400" />}
                        <p className="font-medium text-foreground">{p.product_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className={`font-heading font-bold text-xl ${isLow ? "text-red-400" : "text-primary"}`}>
                      {p.current_stock}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span>Last: {p.last_stock_count}</span>
                    <span>New: {p.new_stock_arrived}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditProduct(p); setFormOpen(true); }} className="text-xs text-primary hover:underline">Edit</button>
                    <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Product"
        description="This product will be permanently removed from inventory."
        onConfirm={handleDelete}
      />
    </div>
  );
}