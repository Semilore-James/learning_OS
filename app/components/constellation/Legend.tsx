export function Legend() {
  const rows: [string, string, boolean][] = [
    ["Completed", "var(--accent-2)", true],
    ["Active", "var(--primary)", true],
    ["Needs review", "var(--accent-1)", true],
    ["Available", "var(--accent-3)", false],
    ["Locked", "var(--muted)", false],
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        background: "var(--surface)",
        border: "var(--bd-inner)",
        boxShadow: "var(--shadow-xs)",
        borderRadius: "var(--radius)",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      {rows.map(([label, color, filled]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: filled ? color : "transparent",
              border: filled ? "none" : `1.5px solid ${color}`,
            }}
          />
          <span style={{ font: "400 10px var(--font-mono)", color: "var(--text)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
