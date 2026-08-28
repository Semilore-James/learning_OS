/* Desktop icon glyphs. Stroke uses currentColor so hover/active states just
   change color. Ported from docs/DA Learning OS.dc.html iconDefs. */
import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const GlyphConstellation = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="6" r="2" /><circle cx="16" cy="6" r="2" /><circle cx="12" cy="14" r="2" />
    <line x1="8" y1="8" x2="12" y2="12" /><line x1="16" y1="8" x2="12" y2="12" />
  </svg>
);
export const GlyphReview = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const GlyphVideo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="5" width="12" height="14" /><path d="M15 10l6-3v10l-6-3z" /></svg>
);
export const GlyphCaseFiles = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 4h6l2 2h8v14H4V4z" /></svg>
);
export const GlyphPmAi = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" /><circle cx="9" cy="10" r="1.5" />
    <circle cx="15" cy="10" r="1.5" /><path d="M9 15h6" />
  </svg>
);
export const GlyphHeatmap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" />
    <rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" />
  </svg>
);
export const GlyphCanvas = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" /><path d="M7 17l4-8 3 5 2-3 4 6" /></svg>
);
export const GlyphGames = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="2" y="6" width="20" height="12" /><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" /></svg>
);
export const GlyphCheatcodes = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 17l6-6-6-6" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
);
export const GlyphDailyLog = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" /><line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" />
  </svg>
);
export const GlyphToolkit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14 7l3-3 3 3-3 3M10 17l-3 3-3-3 3-3" />
    <path d="M14 7L7 14M17 10l-7 7" />
  </svg>
);
export const GlyphSettings = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>
);
