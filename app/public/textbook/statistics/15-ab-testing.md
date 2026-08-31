# A/B testing fundamentals

## The one-sentence version

An A/B test is a small randomised experiment, and its entire power comes from the randomisation, which is also the part teams are most tempted to compromise.

## What it is

Split your users randomly into two groups. Group A (control) sees the current version. Group B (variant) sees the change. Everything else is held the same. After enough data, compare a pre-chosen metric between the groups. Because assignment was random, any confounder (traffic source, time of day, user type) is balanced across the groups in expectation, so a difference in the metric is attributable to the change.

## Why it exists

It is the one method that gets you from correlation to causation without a mechanism argument or a natural experiment. Observational analysis can tell you engaged users convert better; only an experiment can tell you whether *making* the change causes *more* conversion. For product and marketing decisions, that is the question, and A/B testing is the cleanest answer available.

## How it works

**Before the test:**

1. **One primary metric, chosen in advance.** Conversion rate, revenue per user, retention at day 7. Not "we will see what moves". Pick guardrail metrics too (things that must not get worse).
2. **A hypothesis and an expected effect size.** "We think the new checkout lifts conversion by at least 5% relative."
3. **A power calculation** for the sample size. Given your baseline rate, the minimum effect worth detecting, alpha (0.05), and power (usually 0.80), the calculation gives the number of users per arm. Smaller effects need dramatically more traffic.
4. **A planned run length**, usually at least one full week (often two) to average over weekday and weekend behaviour, and a stop date.

**During the test:**

- **Do not peek and stop early when it looks good.** Every look is another chance for noise to cross the line. If you must monitor, use sequential testing methods designed for it, or just wait for the planned end.
- **Check the split is actually 50/50** and that the groups look similar on known attributes (a sanity check called an A/A comparison or a balance check).
- **Watch for a sample ratio mismatch** (the arms have unexpectedly different sizes). It usually means a bug in assignment or logging, and it invalidates the test.

**After the test:**

- Compare the primary metric with a test appropriate to its type (two-proportion or chi-square for rates, t-test for means).
- **Report the effect size with a confidence interval**, not just significance. "Lift of 4% relative (95% CI: 1% to 7%), p = 0.02."
- Check the guardrails did not move the wrong way.
- If it is inconclusive, say so and say what sample size would settle it.

**Common ways A/B tests lie:**

- **Novelty effect** — the variant does better at first just because it is new; the lift fades. Run long enough to see it settle.
- **Peeking** — covered above, the biggest one.
- **Multiple metrics / segments** — slicing 15 ways and reporting the two that were significant. Pre-declare, or heavily discount post-hoc findings.
- **Contamination** — the same user sees both versions (across devices, or the change leaks), diluting the effect.
- **Winner's curse** — the observed lift of a test that just barely won is biased upward. Expect the real effect to be smaller than the point estimate.

## When you use it

Any reversible, user-facing change where you can randomise assignment and get enough traffic to detect an effect that matters: UI changes, copy, pricing tests, algorithm tweaks, email variants, onboarding flows. Not for changes that cannot be randomised (a company-wide policy), that are too rare to power (enterprise deals), or where the downside of the variant is unacceptable even briefly.

## A worked example

Baseline checkout conversion is 3.0%. The team wants to detect a lift of at least 8% relative (to 3.24%). A power calculation at alpha 0.05, power 0.80 returns roughly 80,000 users per arm. The site gets 40,000 checkout sessions a day, so 50/50 split, about 4 days of traffic, but they run it for 14 to cover two full weekly cycles.

Result: control 3.02%, variant 3.31%, difference +0.29 points (+9.6% relative), 95% CI +2% to +17% relative, p = 0.03. Guardrail metrics (average order value, refund rate) unchanged.

Interpretation: the variant probably helps, likely somewhere between 2% and 17% relative lift, best guess around 10% but expect the true number toward the lower end (winner's curse). Guardrails clean. Ship it, and keep monitoring conversion for a few weeks to confirm the lift holds and was not novelty.

> **Try This**
> Design an A/B test on paper for a change you would make to this app's onboarding: the primary metric, the hypothesis, the minimum effect worth shipping, and roughly how long it would need to run. Then look at how the Shop's `shop-live` PostHog flag is set up to do exactly this, control versus live, with retention as the goal.
