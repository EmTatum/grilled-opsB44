import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyProduct = {
  product_name: "",
  category: "",
  last_stock_count: 0,
  new_stock_arrived: 0,
  low_stock_threshold: 5,
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
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-muted-foreground text-xs">Product Name</Label>
            <Input
              required
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1"
              placeholder="Product name"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Category</Label>
            <Input
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1"
              placeholder="e.g. Flower, Edibles, Concentrates"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Last Stock Count</Label>
              <Input
                required
                type="number"
                min="0"
                value={form.last_stock_count}
                onChange={(e) => setForm({ ...form, last_stock_count: e.target.value })}
                className="bg-secondary border-border text-foreground mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">New Stock Arrived</Label>
              <Input
                required
                type="number"
                min="0"
                value={form.new_stock_arrived}
                onChange={(e) => setForm({ ...form, new_stock_arrived: e.target.value })}
                className="bg-secondary border-border text-foreground mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Current Stock</Label>
              <div className="mt-1 px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground text-sm font-medium">
                {currentStock} units
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Low Stock Threshold</Label>
              <Input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                className="bg-secondary border-border text-foreground mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}