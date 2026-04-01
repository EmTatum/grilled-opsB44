import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];
const priorities = ["Low", "Medium", "High"];
const emptyNote = { client_name: "", note_type: "General", content: "", priority: "Medium" };

const inputStyle = {
  width: "100%",
  background: "#111111",
  border: "1px solid hsl(40 20% 18%)",
  borderRadius: "2px",
  padding: "9px 12px",
  color: "hsl(36 40% 88%)",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  outline: "none",
  marginTop: "6px",
};

const labelStyle = {
  display: "block",
  fontSize: "9px",
  color: "hsl(36 10% 42%)",
  fontFamily: "Inter, sans-serif",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  fontWeight: 500,
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
      <DialogContent style={{ background: "#161616", border: "1px solid hsl(40 20% 18%)", borderRadius: "2px", maxWidth: "460px" }}>
        <DialogHeader>
          <DialogTitle className="font-heading" style={{ fontSize: "24px", color: "hsl(36 40% 90%)" }}>
            {note ? "Edit Note" : "New Note"}
          </DialogTitle>
          <div className="h-px mt-1 mb-1" style={{ background: "linear-gradient(90deg, hsl(40 57% 54% / 0.4), transparent)" }} />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div>
            <label style={labelStyle}>Client Name</label>
            <input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              style={inputStyle} placeholder="Enter client name"
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Note Type</label>
              <select value={form.note_type} onChange={(e) => setForm({ ...form, note_type: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {noteTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Note Content</label>
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Write your note..."
              onFocus={(e) => e.target.style.borderColor = "hsl(40 57% 54% / 0.5)"}
              onBlur={(e) => e.target.style.borderColor = "hsl(40 20% 18%)"} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)}
              style={{ padding: "9px 20px", background: "transparent", border: "1px solid hsl(40 20% 20%)", borderRadius: "2px", color: "hsl(36 30% 70%)", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "9px 24px", background: "linear-gradient(135deg, hsl(40 57% 54%), hsl(40 40% 40%))", border: "none", borderRadius: "2px", color: "#0a0a0a", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : note ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}