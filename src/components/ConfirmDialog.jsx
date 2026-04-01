import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={{
          background: "#1a1a1a",
          border: "1px solid hsl(40 20% 20%)",
          borderRadius: "2px",
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className="font-heading"
            style={{ color: "hsl(36 40% 94%)", fontSize: "22px" }}
          >
            {title || "Confirm"}
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "hsl(36 10% 50%)", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
            {description || "Are you sure? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            style={{
              background: "transparent",
              border: "1px solid hsl(40 20% 22%)",
              color: "hsl(36 30% 75%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.08em",
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{
              background: "hsl(0 65% 45%)",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.08em",
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}