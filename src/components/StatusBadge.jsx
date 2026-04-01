const statusStyles = {
  Pending: { bg: "hsl(40 57% 54% / 0.1)", color: "hsl(40 57% 60%)", border: "hsl(40 57% 54% / 0.3)" },
  Confirmed: { bg: "hsl(210 70% 50% / 0.1)", color: "hsl(210 70% 65%)", border: "hsl(210 70% 50% / 0.3)" },
  Fulfilled: { bg: "hsl(145 55% 35% / 0.12)", color: "hsl(145 55% 55%)", border: "hsl(145 55% 35% / 0.3)" },
  Cancelled: { bg: "hsl(0 65% 48% / 0.1)", color: "hsl(0 65% 60%)", border: "hsl(0 65% 48% / 0.3)" },
  Low: { bg: "hsl(0 0% 20%)", color: "hsl(36 10% 55%)", border: "hsl(0 0% 28%)" },
  Medium: { bg: "hsl(40 57% 54% / 0.1)", color: "hsl(40 57% 60%)", border: "hsl(40 57% 54% / 0.3)" },
  High: { bg: "hsl(333 72% 43% / 0.12)", color: "hsl(333 72% 65%)", border: "hsl(333 72% 43% / 0.35)" },
};

export default function StatusBadge({ status }) {
  const s = statusStyles[status];
  if (!s) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs uppercase tracking-wide border"
      style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", letterSpacing: "0.15em" }}>
      {status}
    </span>
  );
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-sm uppercase"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: "9px",
        letterSpacing: "0.15em",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}