import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const noteTypes = ["Credit on Account", "Debt on Account", "Needs Attention", "Client Retention", "General"];
const priorities = ["Low", "Medium", "High"];
const emptyNote = { client_name: "", note_type: "General", content: "", priority: "Medium", tags: "", last_order_date: "", total_spend: "" };
const F = { fontFamily: "'Raleway', sans-serif" };
const inputStyle = { ...F, width: "100%", background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "0", padding: "10px 14px", color: "#F5F0E8", fontSize: "13px", outline: "none", marginTop: "8px", transition: "border-color 0.2s, box-shadow 0.2s" };
const labelStyle = { ...F, display: "block", fontSize: "10px", fontWeight: 500, color: "rgba(201,168,76,0.6)", letterSpacing: "0.15em", textTransform: "uppercase" };
const onFocus = e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 1px rgba(201,168,76,0.2)"; };
const onBlur = e => { e.target.style.borderColor = "rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; };

export default function NoteFormDialog({ open, onOpenChange, note, onSave }) {
  const [form, setForm] = useState(emptyNote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(note ? { client_name: note.client_name || "", note_type: note.note_type || "General", content: note.content || "", priority: note.priority || "Medium", tags: (note.tags || []).join(", "), last_order_date: note.last_order_date ? note.last_order_date.slice(0, 10) : "", total_spend: note.total_spend || "" } : emptyNote);
  }, [note, open]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await onSave({ ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [], total_spend: Number(form.total_spend) || 0, last_order_date: form.last_order_date ? new Date(form.last_order_date).toISOString() : null });
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div><label style={labelStyle}>Last Order Date</label><input type="date" value={form.last_order_date} onChange={e => setForm({ ...form, last_order_date: e.target.value })} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} /></div>
            <div><label style={labelStyle}>Total Spend (R)</label><input type="number" min="0" step="0.01" value={form.total_spend} onChange={e => setForm({ ...form, total_spend: e.target.value })} style={inputStyle} placeholder="0.00" onFocus={onFocus} onBlur={onBlur} /></div>
          </div>
          <div><label style={labelStyle}>Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} style={inputStyle} placeholder="e.g. VIP, Regular, Wholesale" onFocus={onFocus} onBlur={onBlur} /></div>
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