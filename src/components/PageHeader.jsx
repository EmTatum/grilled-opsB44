export default function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "36px",
            fontWeight: 600,
            color: "#C9A84C",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
            lineHeight: 1.1,
          }}>
            {title}
          </h1>
          <div style={{ width: "60px", height: "2px", background: "#C9A84C", marginTop: "10px" }} />
          {subtitle && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 300,
              color: "rgba(245,240,232,0.5)",
              marginTop: "10px",
              letterSpacing: "0.05em",
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {children && <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>{children}</div>}
      </div>
      {/* Gold separator */}
      <div style={{ marginTop: "24px", height: "1px", background: "rgba(201,168,76,0.25)", width: "100%" }} />
    </div>
  );
}