export default function ClientNotesDrawer({ open, clientName, notes, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "min(420px, 100vw)", height: "100vh", background: "#111111", borderLeft: "1px solid rgba(201,168,76,0.25)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s ease", zIndex: 120, boxShadow: "-20px 0 50px rgba(0,0,0,0.5)" }}>
      <div style={{ padding: "22px 20px", borderBottom: "1px solid rgba(201,168,76,0.18)", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "18px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A84C" }}>Client Notes</p>
          <p style={{ margin: "4px 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "12px", color: "rgba(245,240,232,0.45)" }}>{clientName || "No client selected"}</p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C", padding: "8px 10px", cursor: "pointer" }}>Close</button>
      </div>
      <div style={{ padding: "18px 20px", overflowY: "auto", height: "calc(100vh - 88px)" }}>
        {notes.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "'Raleway', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.35)" }}>No notes found for this client.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {notes.map((note) => (
              <div key={note.id} style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.15)", padding: "14px" }}>
                <p style={{ margin: "0 0 6px", fontFamily: "'Raleway', sans-serif", fontSize: "10px", color: "rgba(201,168,76,0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{note.note_type}</p>
                <p style={{ margin: "0 0 8px", fontFamily: "'Raleway', sans-serif", fontSize: "13px", lineHeight: 1.7, color: "rgba(245,240,232,0.72)" }}>{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}