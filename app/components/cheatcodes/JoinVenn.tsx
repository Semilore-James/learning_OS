/** The four JOIN types as two-circle Venn diagrams (PRD 11.1 / Frame 7). */
const TYPES = [
  { name: "INNER JOIN", left: false, mid: true, right: false },
  { name: "LEFT JOIN", left: true, mid: true, right: false },
  { name: "RIGHT JOIN", left: false, mid: true, right: true },
  { name: "FULL OUTER JOIN", left: true, mid: true, right: true },
];

export function JoinVenn() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TYPES.map((t) => (
        <div key={t.name} className="chrome-flat flex flex-col items-center gap-2 bg-surface-raised p-3">
          <svg width="88" height="56" viewBox="0 0 88 56" aria-hidden>
            <defs>
              <clipPath id={`l-${t.name}`}>
                <circle cx="34" cy="28" r="22" />
              </clipPath>
              <clipPath id={`r-${t.name}`}>
                <circle cx="54" cy="28" r="22" />
              </clipPath>
            </defs>
            {/* fills */}
            {t.left && <circle cx="34" cy="28" r="22" fill="var(--primary)" opacity="0.35" />}
            {t.right && <circle cx="54" cy="28" r="22" fill="var(--accent-3)" opacity="0.35" />}
            {t.mid && (
              <g clipPath={`url(#l-${t.name})`}>
                <circle cx="54" cy="28" r="22" fill="var(--accent-2)" opacity="0.55" />
              </g>
            )}
            {/* outlines */}
            <circle cx="34" cy="28" r="22" fill="none" stroke="var(--primary)" strokeWidth="1.4" />
            <circle cx="54" cy="28" r="22" fill="none" stroke="var(--accent-3)" strokeWidth="1.4" />
          </svg>
          <span className="text-center font-mono text-[10px] text-foreground">{t.name}</span>
        </div>
      ))}
    </div>
  );
}
