import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { normalizePaymentStatus } from "../../utils/customerNotes";

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

const inputStyle = {
  width: "100%",
  background: "#1c191a",
  border: "1px solid rgba(201,168,76,0.2)",
  color: "#F5F0E8",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none",
};

const sectionStyle = {
  background: "#141414",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const actionButtonStyle = {
  background: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  padding: "10px 16px",
  fontFamily: "var(--font-body)",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export default function IntelligenceReportModal({ open, onOpenChange, report, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(report);

  useEffect(() => {
    setDraft(report);
    setIsEditing(false);
  }, [report, open]);

  if (!report || !draft) return null;

  const meta = [draft.cell_number, draft.delivery_date, draft.delivery_address].filter((value) => value && value !== "Not recorded.").join(" · ");

  const renderField = (label, key, multiline = false) => {
    if (!isEditing) {
      return (
        <div>
          <p style={fieldLabel}>{label}</p>
          <p style={{ ...fieldValue, whiteSpace: multiline ? "pre-line" : "normal" }}>{draft[key] || "Not recorded."}</p>
        </div>
      );
    }

    if (key === "payment_status") {
      const currentValue = normalizePaymentStatus(draft.payment_status, draft.payment_method);
      return (
        <div>
          <p style={fieldLabel}>{label}</p>
          <select value={currentValue} onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })} style={{ ...inputStyle, marginTop: "6px", cursor: "pointer" }}>
            <option value="PAID">PAID</option>
            <option value="CASH">CASH</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      );
    }

    if (multiline) {
      return (
        <div>
          <p style={fieldLabel}>{label}</p>
          <textarea value={draft[key] || ""} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} style={{ ...inputStyle, minHeight: "110px", resize: "vertical", marginTop: "6px" }} />
        </div>
      );
    }

    return (
      <div>
        <p style={fieldLabel}>{label}</p>
        <input value={draft[key] || ""} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} style={{ ...inputStyle, marginTop: "6px" }} />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.28)", maxWidth: "min(1100px, calc(100vw - 32px))", width: "100%", height: "calc(100vh - 32px)", padding: 0 }}>
        <DialogTitle style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>Member Intelligence File</DialogTitle>
        <DialogDescription style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>View and edit member intelligence details, order information, and client notes.</DialogDescription>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px 24px", borderBottom: "1px solid rgba(201,168,76,0.18)", flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "28px", color: "#d29c6c", letterSpacing: "0.08em", textTransform: "uppercase" }}>Member Intelligence File</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={actionButtonStyle}>Edit</button>}
              {isEditing && <button onClick={() => onSave(draft)} style={actionButtonStyle}>Save Changes</button>}
              <button onClick={() => onOpenChange(false)} style={{ ...actionButtonStyle, border: "1px solid rgba(201,168,76,0.25)" }}>Close</button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {isEditing ? (
                <input value={draft.client_name || ""} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} style={{ ...inputStyle, fontFamily: "var(--font-heading)", fontSize: "32px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c", padding: 0, background: "transparent", border: "none" }} />
              ) : (
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d29c6c", margin: 0 }}>
                  {draft.client_name || "Client File"}
                </p>
              )}
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
                {renderField("Client Name", "client_name")}
                {renderField("Cell Number", "cell_number")}
                {renderField("Payment Method", "payment_method")}
                {renderField("Payment Status", "payment_status")}
              </div>

              <div style={sectionStyle}>
                <div>
                  <p style={labelStyle}>Order Details</p>
                  <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
                </div>
                {renderField("Delivery Date", "delivery_date")}
                {renderField("Delivery Address", "delivery_address", true)}
                {renderField("Order List", "order_list", true)}
                {renderField("Order Total", "order_total")}
              </div>
            </div>

            <div style={sectionStyle}>
              <div>
                <p style={labelStyle}>Client Notes</p>
                <div style={{ height: "1px", width: "60px", background: "#d29c6c", marginTop: "10px" }} />
              </div>
              {renderField("Sentiment Analysis", "sentiment_analysis", true)}
              {renderField("Red Flags", "red_flags", true)}
              {renderField("Green Flags", "green_flags", true)}
              {renderField("Next Action", "next_action", true)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}