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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyOrder = {
  client_name: "",
  order_details: "",
  order_date: "",
  status: "Pending",
};

export default function OrderFormDialog({ open, onOpenChange, order, onSave }) {
  const [form, setForm] = useState(emptyOrder);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        client_name: order.client_name || "",
        order_details: order.order_details || "",
        order_date: order.order_date ? order.order_date.slice(0, 16) : "",
        status: order.status || "Pending",
      });
    } else {
      setForm(emptyOrder);
    }
  }, [order, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, order_date: new Date(form.order_date).toISOString() });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            {order ? "Edit Order" : "New Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-muted-foreground text-xs">Client Name</Label>
            <Input
              required
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Order Details</Label>
            <Textarea
              required
              value={form.order_details}
              onChange={(e) => setForm({ ...form, order_details: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1 min-h-[80px]"
              placeholder="Describe the order..."
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Date & Time</Label>
            <Input
              required
              type="datetime-local"
              value={form.order_date}
              onChange={(e) => setForm({ ...form, order_date: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-secondary border-border text-foreground mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Pending", "Confirmed", "Fulfilled", "Cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {saving ? "Saving..." : order ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}