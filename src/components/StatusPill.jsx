export const PAYMENT_BADGE_STYLES = {
  PAID: { background: "rgba(22,163,74,0.14)", border: "1px solid rgba(22,163,74,0.5)", color: "#16a34a" },
  CASH: { background: "rgba(210,156,108,0.14)", border: "1px solid rgba(210,156,108,0.5)", color: "#d29c6c" },
  PENDING: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(245,240,232,0.7)" },
};

export const FULFILMENT_BADGE_STYLES = {
  Active: { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C" },
  Fulfilled: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(245,240,232,0.75)" },
  Cancelled: { background: "rgba(194,24,91,0.08)", border: "1px solid rgba(194,24,91,0.4)", color: "#C2185B" },
};

export default function StatusPill({ value, styleMap = PAYMENT_BADGE_STYLES, fallbackKey = "PENDING" }) {
  const style = styleMap[value] || styleMap[fallbackKey] || {};
  return (
    <span style={{
      ...style,
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      fontFamily: "var(--font-body)",
      fontSize: "10px",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      borderRadius: "2px",
    }}>
      {value || fallbackKey}
    </span>
  );
}
