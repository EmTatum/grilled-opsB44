import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export default function ReportContentModal({ open, onOpenChange, note }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.3)", boxShadow: "0 25px 60px rgba(0,0,0,0.8)", maxWidth: "min(860px, calc(100vw - 32px))", width: "100%" }}>
        <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Intelligence Report</DialogTitle>
        <DialogDescription style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(245,240,232,0.5)" }}>{note?.client_name || "Client report"}</DialogDescription>
        <div style={{ background: "#111111", border: "1px solid rgba(201,168,76,0.16)", padding: "16px", maxHeight: "60vh", overflow: "auto" }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: "0 0 12px", fontFamily: "var(--font-body)", fontSize: "13px", color: "#F5F0E8", lineHeight: 1.7 }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#F5F0E8" }}>{children}</strong>
            }}
          >
            {note?.content || "No report content found."}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}