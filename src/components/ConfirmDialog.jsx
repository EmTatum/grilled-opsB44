import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const btnBase = {
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "10px 24px",
  borderRadius: "2px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{
        background: "#1a1a1a",
        border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "2px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em" }}>
            {title || "Confirm"}
          </AlertDialogTitle>
          <AlertDialogDescription style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(245,240,232,0.55)" }}>
            {description || "Are you sure? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel style={{ ...btnBase, background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "rgba(245,240,232,0.6)" }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{ ...btnBase, background: "transparent", border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B" }}
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