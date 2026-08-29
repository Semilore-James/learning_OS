# Notes from running iris on DA // LEARNING OS

Ran iris across the whole codebase — `check` on all 115 TypeScript/React source
files, plus `secrets` and `security` over the tree. Here's an honest, plain
writeup of how it went.

## What I liked

- **Zero friction to start.** One command, readable output, and a `--format json`
  mode when you want to script it. I had a first result in under a minute with no
  config.
- **The health score is a genuinely useful glance.** Seeing "this file's a 91,
  this one's a 51" told me where the heavy code lived without opening anything.
- **It found the right big files.** The two lowest scores were a ~540-line
  wallpaper module and a ~480-line data adapter — which are exactly the two files
  I'd steer a new contributor away from. It also spotted the repeated code blocks
  inside them, which is a fair call.
- **The secrets / security scans are fast and worth keeping.** Running those over
  the full tree took seconds. That's the kind of thing I'd happily wire into a
  pre-push hook.

## A few things that fired but weren't real problems

None of these are dealbreakers — more like notes for tuning, especially on a
React/TypeScript project:

1. **localStorage key names get read as secrets.** Lines like
   `const KEY = "da-os-canvas"` were flagged as possible hardcoded secrets. The
   pattern seems to be "`const NAME = "string"`" fairly broadly. An allowlist for
   obvious key-ish names, or skipping short low-entropy strings, would cut the
   noise.

2. **Two valid files scored 0 on a parse error.** `PmAiWindow.tsx` and
   `curriculumLayout.ts` both compile cleanly under `tsc` and `next build`, but
   iris reported an unclosed/mismatched delimiter and zeroed the score. Something
   in the parser is tripping on a TS or JSX construct in those two. It might be
   friendlier to report "couldn't fully analyze" and leave the score blank rather
   than score it a 0.

3. **"function too long" fires on most React components.** The 80-line threshold
   is easy to clear once a component has a few hooks and a chunk of JSX, so on
   this codebase it reads more as background noise than signal. A higher default
   for `.tsx`, or weighting a JSX return block differently from logic, would help.

4. **A "hardcoded localhost URL" flag landed on teaching content.** One file
   literally documents how to connect to local databases (DBeaver, SQL Server),
   so each `localhost` mention got flagged. Reasonable rule in general — it just
   happened to hit prose here.

## Bottom line

For a free tool this is a solid smoke alarm. The secrets and security scans plus
the "which files are getting big" signal are the parts I'd actually lean on. The
health-check findings on this codebase were mostly style opinions and a couple of
false positives, so I wouldn't gate a build on the score today — but I'd keep the
secrets scan running in CI, and I'd be curious to see the parser and the
React-tuning get some love in a future version.
