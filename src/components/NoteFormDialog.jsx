import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];
const priorities = ["Low", "Medium", "High"];
const emptyNote = { client_name: "", note_type: "General", content: "", priority: "Medium" };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "0", padding: "10px 14px", color: "#F5F0E8", fontSize: "13px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function NoteFormDialog({ open, onOpenChange, note, onSave }) {
  const [form, setForm] = useState(emptyNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(note ? { client_name: note.client_name || "", note_type: note.note_type || "General", content: note.content || "", priority: note.priority || "Medium" } : emptyNote);
  }, [note, open]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave(form);
    setSaving(false); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "0", boxShadow: "0 40px 80px rgba(0,0,0,0.9)", maxWidth: "460px", padding: "28px" }}>
        <DialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px", marginBottom: "4px" }}>
          <DialogTitle style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            {note ? "Edit Note" : "New Note"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          <div><label style={labelStyle}>Client Name</label><input required value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} style={inputStyle} placeholder="Enter client name" onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Note Type</label>
              <select value={form.note_type} onChange={e => setForm({ ...form, note_type: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Note Content</label><textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Write your note..." onFocus={onFocus} onBlur={onBlur} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
            <button type="button" onClick={() => onOpenChange(false)} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "0", color: "rgba(245,240,232,0.5)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...F, padding: "10px 28px", background: "transparent", border: "1px solid #C9A84C", borderRadius: "0", color: "#C9A84C", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.2s" }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}>
              {saving ? "Saving..." : note ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}