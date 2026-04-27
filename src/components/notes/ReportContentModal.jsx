import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function ReportContentModal({ open, onOpenChange, note, onUpdateReport }) {
  const [draftContent, setDraftContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setDraftContent(note?.content || "");
    setIsDirty(false);
    setIsUpdating(false);
  }, [note?.id, note?.content, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "min(860px, calc(100vw - 32px))", width: "100%" }}>
        <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Intelligence Report</DialogTitle>
        <DialogDescription style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>{note?.client_name || "Client report"}</DialogDescription>
        <div style={{ display: "grid", gap: "12px" }}>
          <textarea
            value={draftContent}
            onChange={(e) => {
              setDraftContent(e.target.value);
              setIsDirty(e.target.value !== (note?.content || ""));
            }}
            style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "16px", maxHeight: "60vh", minHeight: "360px", overflow: "auto", resize: "vertical", color: "#F5F0E8", fontFamily: "var(--font-body)", fontSize: "13px", lineHeight: 1.7, outline: "none" }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "20px" }}>
              {isDirty && (
                <>
                  <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#C9A84C", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(245,240,232,0.58)" }}>Unsaved changes</span>
                </>
              )}
            </div>
            <button
              type="button"
              disabled={!isDirty || isUpdating}
              onClick={async () => {
                if (!note?.memberOrderId || !onUpdateReport || !isDirty) return;
                setIsUpdating(true);
                const updated = await onUpdateReport(note.memberOrderId, draftContent);
                if (updated) {
                  setDraftContent(updated.content || draftContent);
                  setIsDirty(false);
                }
                setIsUpdating(false);
              }}
              style={{ background: "transparent", border: "1px solid #C9A84C", color: "#C9A84C", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 14px", cursor: !isDirty || isUpdating ? "default" : "pointer", opacity: !isDirty || isUpdating ? 0.6 : 1 }}
            >
              {isUpdating ? "Updating..." : "Update Report"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}