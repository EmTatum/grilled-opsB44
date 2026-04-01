export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      className="art-card"
      style={{
        background: "#141414",
        border: "1px solid rgba(201,168,76,0.25)",
        borderRadius: 0,
        padding: "28px 24px",
        transition: "all 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.55)";
        e.currentTarget.style.boxShadow = "0 0 30px rgba(201,168,76,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <Icon size={18} strokeWidth={1} style={{ color: "rgba(201,168,76,0.4)" }} />
      </div>
      <p style={{
        fontFamily: "'Raleway', sans-serif",
        fontSize: "10px", fontWeight: 500,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(201,168,76,0.5)",
        marginBottom: "12px",
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "40px", fontWeight: 600,
        color: "#C9A84C",
        lineHeight: 1, margin: 0,
      }}>
        {value}
      </p>
    </div>
  );
}