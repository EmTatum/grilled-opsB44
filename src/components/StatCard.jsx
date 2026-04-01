export default function StatCard({ icon: Icon, label, value, accent = "#C9A84C", glowColor }) {
  const glow = glowColor || accent;
  return (
    <div
      className="art-card"
      style={{
        background: "#141414",
        border: `1px solid ${accent}44`,
        borderRadius: 0,
        padding: "28px 24px",
        transition: "all 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 0 30px ${glow}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accent}44`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <Icon size={18} strokeWidth={1} style={{ color: `${accent}66` }} />
      </div>
      <p style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: "10px", fontWeight: 500,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: `${accent}80`,
        marginBottom: "12px",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "40px", fontWeight: 600,
        color: accent,
        lineHeight: 1, margin: 0,
      }}>
        {value}
      </p>
    </div>
  );
}