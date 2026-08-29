# Tracks & Portfolio — design (Council blueprint + refinements)

Status: **not built yet.** This is the agreed plan. DA content must be genuinely
complete before the other three tracks get real content.

## 1. Four tracks

From roadmap.sh roadmaps (saved in `docs/tracks/`):

| id | label | status |
|---|---|---|
| `data-analyst` | Data Analyst | live (in build) |
| `product-manager` | Product Manager | soon |
| `technical-writer` | Technical Writer | soon |
| `ml-engineer` | Machine Learning Engineer | soon |

### Track selection screen

Shown after auth (account or guest) while `profile.track` is null.

- Four floating track cards. Hover → a track-specific sprite floats, the
  background swaps (one wallpaper per track).
- `soon` tracks open a "coming soon / join the waitlist" panel, not the track.
- Picking `data-analyst` → track onboarding questions → `setTrack('data-analyst')`
  → desktop.

### Track lock (Council verdict: SOFT lock, not IP lock)

The hard IP lock was **eliminated** by the Council: nobody could name what it
prevents, and it breaks for mobile users, campus-then-home wifi, and rotating
residential IPs. Instead:

- `profile.track` binds the account to one active track.
- The "confirm three times" ceremony the user wanted becomes **UX weight on the
  switch flow**, not network enforcement: step 1 "your <track> progress pauses,
  not deletes" → step 2 "you can't switch back for 14 days" → step 3 type the
  track name.
- Switching lives in Settings, gated by `track_switched_at` + a 14-day cooldown.
- Per-track history is preserved on switch.
- **No IP column in the identity model.** An IP is a transient network fact.

### Track isolation (user, firm)

When a track is active, **the whole environment filters to it** — not just the
curriculum. Desktop icons, the constellation map, case files, games, textbook
books, cheatcodes, toolkit entries: only what belongs to the active track is
present. Tracks are self-isolated. Implementation: every content registry keys on
track; `appRegistry` filters apps by `track`; nothing cross-track renders.

### Onboarding questions

Set the **starting point** on the track's constellation (pre-complete nodes the
learner already knows) — same mechanism as today's `DiagnosticScreen`. They do
**not** gate access.

## 2. Portfolio / Commendation generator

Hidden until the learner completes their **first case file**.

### It's a commendation, grounded in evidence (user refinement)

Every accomplishment is stated as "went above and beyond" **and** translated into
business value. Not just:

> "She found the region-attribution bug in Case 04 by cross-checking city against
> region, a step the brief didn't ask for."

But:

> "She found the region-attribution bug in Case 04 by cross-checking city against
> region — a step the brief didn't ask for. **In a company this is the difference
> between a regional budget decision made on real numbers and one made on a
> broken import. She sifts for the detail that changes the answer.**"

Every evidence point gets a `businessValue` string. The tone is commendation
("went above and beyond", "sifting through critical details"); the substance is a
specific logged action + what it protects or enables for a business.

### The grade bar (Council verdict)

The auto-commendation-for-everyone version was **eliminated** — a hiring manager
reads unqualified praise as a negative signal. So:

- First case complete unlocks the **ability** to generate.
- The full page only generates above a quality bar (composite grade band ≥
  "Solid"). Below it: "clear two more ANALYST cases and this unlocks."
- The page can say "not yet" / name a development area. It is allowed to be
  honest.

### Grade computation

Per-skill 0–100 from:
- case outcomes: PM-AI review `accepted` = full, `revised` = partial,
  `overridden` = flagged
- games: accuracy × level reached, per skill area
- chapters read per book
- streak consistency

Normalised per skill area so the page says "strong SQL, developing viz", not a
single number.

### Layouts (Council verdict: 3, not 15)

15 layouts was **eliminated** (15–25 build-days + permanent maintenance for a
once-per-user feature). Ship:

1. **Clean CV** — what you attach to an application.
2. **Case-study writeup** — what you link on a portfolio site.
3. **Star map** — on-brand, clearly the secondary "fun" option.

One `PortfolioDoc` JSON; each layout is a template function. More layouts are
pure additions later, zero migration.

`PortfolioDoc` shape:
```
{
  headline,
  skillScores: Record<skill, number>,
  band: "Developing" | "Solid" | "Strong",
  strengths: string[],
  thinkingExamples: { evidence, businessValue }[],
  cases: { id, title, outcome, oneLineFinding }[],
  communication: string,       // from case submission writing quality
  careerPaths: { role, why }[],
  stats: { casesComplete, chaptersRead, activeDays, longestStreak, coins },
}
```

### Career recommendation (honest, not flattering)

Rule-based match from skill-profile **shape** to role clusters:
- SQL-heavy → analytics engineer, BI developer
- viz + comms heavy → data storyteller, product analyst
- stats heavy → data science track

Names a weakness. Silent under 3 completed cases ("complete a few more for a
career read").

### Export

Single self-contained `.html` (all CSS inlined, no external requests) + a
"Print → Save as PDF" button. 3–4 backlinks to the live site. That HTML goes on
LinkedIn.

## 3. Build order (from the Council step plan)

1. Migration `0007_tracks.sql` — `profiles.track`, `profiles.track_switched_at`; backfill existing to `data-analyst`.
2. `content/curriculum/<track>.ts` + a `TRACKS` registry; content resolves by `profile.track`.
3. `TrackSelect` screen in `App.tsx` Shell when `profile.track` is null.
4. Track isolation pass: every content registry + `appRegistry` filters by track.
5. Generalise `DiagnosticScreen` to take a track's question set.
6. Settings "Switch track" — 3-step confirm + 14-day cooldown.
7. `lib/portfolio/grade.ts` — per-skill scores + band.
8. `lib/portfolio/profile.ts` — assemble `PortfolioDoc`, incl. `businessValue` per evidence point.
9. `/api/portfolio/narrative` — PM-AI writes the prose grounded in the doc, must name a development area; 503-safe fallback.
10. `lib/portfolio/careers.ts` — rule table, confidence floor.
11. 3 templates in `components/portfolio/templates/`.
12. `PortfolioWindow` behind a flag, hidden until `casesComplete >= 1`.
13. Export to inlined-CSS HTML + print-to-PDF.
14. Verify: strong Case 01 → CV template with a real strength, a real gap, 2 career roles; guessed Case 01 → "not yet" state.
