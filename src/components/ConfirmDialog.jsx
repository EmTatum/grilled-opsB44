import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const F = { fontFamily: "'Raleway', sans-serif" };
const btnBase = { ...F, fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", padding: "10px 28px", borderRadius: "0", cursor: "pointer", transition: "all 0.2s ease" };

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{
        background: "#141414",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "0",
        boxShadow: "0 40px 80px rgba(0,0,0,0.9)",
      }}>
        <AlertDialogHeader style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", paddingBottom: "16px" }}>
          <AlertDialogTitle style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {title || "Confirm"}
          </AlertDialogTitle>
          <AlertDialogDescription style={{ ...F, fontSize: "13px", color: "rgba(245,240,232,0.45)", marginTop: "8px" }}>
            {description || "Are you sure? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter style={{ borderTop: "1px solid rgba(201,168,76,0.15)", paddingTop: "16px" }}>
          <AlertDialogCancel style={{ ...btnBase, background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "rgba(245,240,232,0.55)" }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{ ...btnBase, background: "transparent", border: "1px solid rgba(194,24,91,0.5)", color: "#C2185B" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#C2185B"; e.currentTarget.style.color = "#F5F0E8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C2185B"; }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}