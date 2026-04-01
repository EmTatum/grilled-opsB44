export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ paddingBottom: "24px", borderBottom: "1px solid rgba(201,168,76,0.15)", marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "28px", fontWeight: 600,
            color: "#C9A84C",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            margin: 0, lineHeight: 1.15,
          }}>
            {title}
          </h1>
          {/* Decorative diamond element */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <div style={{ height: "1px", width: "28px", background: "rgba(201,168,76,0.35)" }} />
            <span style={{ color: "rgba(201,168,76,0.45)", fontSize: "8px" }}>◆</span>
            <div style={{ height: "1px", width: "28px", background: "rgba(201,168,76,0.35)" }} />
          </div>
          {subtitle && (
            <p style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px", fontWeight: 300,
              color: "rgba(245,240,232,0.4)",
              letterSpacing: "0.1em",
              marginTop: "10px",
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {children && <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>{children}</div>}
      </div>
    </div>
  );
}