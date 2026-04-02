import { useState } from "react";

const CORRECT_PASSWORD = "Grilled2026";
const STORAGE_KEY = "grilled_auth";

export function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authed) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        position: "relative",
        background: "#141414",
        border: "1px solid rgba(201,168,76,0.3)",
        padding: "48px 40px",
        maxWidth: "400px",
        width: "100%",
        borderRadius: 0,
      }}>
        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "20px", height: "20px", borderTop: "1px solid #C9A84C", borderLeft: "1px solid #C9A84C" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderBottom: "1px solid #C9A84C", borderRight: "1px solid #C9A84C" }} />

        {/* Top gold line */}
        <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginBottom: "24px" }} />

        {/* Title */}
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "20px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.25em", textTransform: "uppercase", textAlign: "center", margin: 0 }}>
          GRILLED OPS
        </p>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "9px", letterSpacing: "0.3em", color: "rgba(201,168,76,0.4)", textAlign: "center", marginTop: "8px", marginBottom: "32px", textTransform: "uppercase" }}>
          — PRIVATE ACCESS —
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter access code"
            style={{
              width: "100%",
              background: "#0f0f0f",
              border: `1px solid ${error ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.25)"}`,
              borderRadius: 0,
              color: "#F5F0E8",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "13px",
              padding: "12px 16px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#C9A84C"; }}
            onBlur={(e) => { e.target.style.borderColor = error ? "rgba(194,24,91,0.6)" : "rgba(201,168,76,0.25)"; }}
          />
          {error && (
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "11px", color: "#C2185B", letterSpacing: "0.1em", marginTop: "8px", marginBottom: 0 }}>
              Access denied.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "16px",
              background: "transparent",
              border: "1px solid #C9A84C",
              color: "#C9A84C",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "12px",
              borderRadius: 0,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0a0a0a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C9A84C"; }}
          >
            ACCESS GRANTED →
          </button>
        </form>

        {/* Bottom gold line */}
        <div style={{ height: "1px", width: "100%", background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", marginTop: "24px" }} />

        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "8px", letterSpacing: "0.18em", color: "rgba(201,168,76,0.25)", textAlign: "center", marginTop: "16px", marginBottom: 0, textTransform: "uppercase" }}>
          GRILLED.INC © 2026
        </p>
      </div>
    </div>
  );
}