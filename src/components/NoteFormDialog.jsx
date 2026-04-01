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

const noteTypes = [
  "Credit on Account",
  "Debt on Account",
  "Needs Attention",
  "Client Retention",
  "General",
];

const priorities = ["Low", "Medium", "High"];

const emptyNote = {
  client_name: "",
  note_type: "General",
  content: "",
  priority: "Medium",
};

export default function NoteFormDialog({ open, onOpenChange, note, onSave }) {
  const [form, setForm] = useState(emptyNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setForm({
        client_name: note.client_name || "",
        note_type: note.note_type || "General",
        content: note.content || "",
        priority: note.priority || "Medium",
      });
    } else {
      setForm(emptyNote);
    }
  }, [note, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            {note ? "Edit Note" : "New Note"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Note Type</Label>
              <Select value={form.note_type} onValueChange={(v) => setForm({ ...form, note_type: v })}>
                <SelectTrigger className="bg-secondary border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {noteTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="bg-secondary border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Note Content</Label>
            <Textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-secondary border-border text-foreground mt-1 min-h-[100px]"
              placeholder="Write your note..."
            />
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
              {saving ? "Saving..." : note ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}