export default function ThemeToneSwitch({ mode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: "transparent",
        border: "1px solid rgba(201,168,76,0.3)",
        color: "#C9A84C",
        fontFamily: "'Raleway', sans-serif",
        fontSize: "10px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        padding: "10px 14px",
        cursor: "pointer",
      }}
    >
      Tone: {mode === "noir" ? "Noir" : "Soft Noir"}
    </button>
  );
}