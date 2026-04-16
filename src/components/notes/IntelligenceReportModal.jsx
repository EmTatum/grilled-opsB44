import { X, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const labelStyle = {
  fontFamily: "var(--font-body)",
  fontSize: "10px",
  fontWeight: 500,
  color: "rgba(201,168,76,0.6)",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const fieldLabel = {
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  color: "#d29c6c",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: 0,
};

const fieldValue = {
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "#F5F0E8",
  lineHeight: 1.7,
  margin: "4px 0 0",
};

const sectionStyle = {
  background: "#141414",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

export default function IntelligenceReportModal({ open, onOpenChange, report, onDelete }) {
  if (!report) return null;

  const meta = [report.client_number, report.client_address].filter((value) => value && value !== "Not recorded.").join(" · ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.28)", maxWidth: "min(1100px, calc(100vw - 32px))", width: "100%", height: "calc(100vh - 32px)", padding: 0 }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.18)" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase" }}>Member Intelligence File</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={() => onDelete(report.id)} style={{ background: "transparent", border: "1px solid rgba(194,24,91,0.6)", color: "#C2185B", padding: "10px 16px", fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Trash2 size={14} /> Delete Record
              </button>
              <button onClick={() => onOpenChange(false)} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", width: "40px", height: "40px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c", margin: 0 }}>
                {report.client_name || "Client File"}
              </p>
              {meta && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "0.04em", color: "#eee3b4", margin: 0 }}>
                  {meta}
                </p>
              )}
              <div style={{ height: "1px", width: "100%", background: "#d29c6c" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", alignItems: "start" }}>
              <div style={sectionStyle}>
                <div>
                  <p style={labelStyle}>Client Information</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div><p style={fieldLabel}>Client Name</p><p style={fieldValue}>{report.client_name || "Not recorded."}</p></div>
                <div><p style={fieldLabel}>Client Number</p><p style={fieldValue}>{report.client_number || "Not recorded."}</p></div>
                <div><p style={fieldLabel}>Client Address / Drop-off Location</p><p style={fieldValue}>{report.client_address || "Not recorded."}</p></div>
              </div>

              <div style={sectionStyle}>
                <div>
                  <p style={labelStyle}>Order Details</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                <div><p style={fieldLabel}>Full Order Description</p><p style={{ ...fieldValue, whiteSpace: "pre-line" }}>{report.full_order_description || "Not recorded."}</p></div>
                <div><p style={fieldLabel}>Payment Method</p><p style={fieldValue}>{report.payment_method || "Not recorded."}</p></div>
                <div><p style={fieldLabel}>Total Amount in ZAR</p><p style={fieldValue}>{report.total_amount_zar || "Not confirmed."}</p></div>
                <div><p style={fieldLabel}>Payment Status</p><p style={fieldValue}>{report.payment_status || "To Be Paid"}</p></div>
              </div>
            </div>

            <div style={sectionStyle}>
              <div>
                <p style={labelStyle}>Client Notes</p>
                <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
              </div>
              <div><p style={fieldLabel}>Behavioral Insights</p><p style={fieldValue}>{report.behavioral_insights || "Not recorded."}</p></div>
              <div><p style={fieldLabel}>Red Flags</p><p style={fieldValue}>{report.red_flags || "None recorded."}</p></div>
              <div><p style={fieldLabel}>Green Flags</p><p style={fieldValue}>{report.green_flags || "None recorded."}</p></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}