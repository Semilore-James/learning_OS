# Is the answer real?

## The one-sentence version

Before you send a number to anyone, run it through a short set of checks, because the fastest way to lose credibility is to be confidently wrong once.

## The checks

**Order of magnitude.** Is the number the right size? If you expected revenue in the millions and got a result of 4,000, something is wrong: a filter too tight, a join that dropped rows, a unit mistake. Before you trust a number, have a rough expectation and see if it lands near it.

**Reconcile against a known figure.** If finance says last month's revenue was 4.2M and your query says 3.1M, do not present the 3.1M. Find the gap. Usually it is a definition (they include a channel you excluded) or a cleaning step (you removed refunds they count). Either way, you need to know before someone else asks.

**Re-slice it.** Compute the same thing a second way. Total should equal the sum of the parts. A rate computed overall should be consistent with the rates by segment (weighted). If a different slice gives a different answer, one of them is wrong or there is a Simpson's-paradox mix shift worth understanding.

**Check the sample.** How many rows is this based on? A 40% conversion rate from 5 users is noise. A 3-point difference between two groups of 30 each is within chance. Small n means the answer might be an artifact of who happened to be in the data.

**Look for the one outlier.** Sort by the value. Check the top and bottom 10 rows. Is the mean being dragged by a single 10,000x order that is really a typo? Is a "trend" actually one anomalous week?

**Test the cleaning decisions.** Add a flag before you filter or impute, not after. Re-run the analysis excluding the rows you touched. If the finding holds either way, good. If it flips, the finding depends on a judgment call and you must say so.

**Ask: would this survive a smart skeptic?** Imagine someone who does not want to believe your result. What is the first hole they poke? Have the answer ready, or go find it.

## When a check fails

Do not hide it and do not panic. A failed check is the process working. Trace the gap, fix the cause, and if the corrected number changes the story, that is the finding now.

## The move

Keep a written checklist and actually run it, every time, before anything leaves your hands. It takes ten minutes. The alternative is presenting a wrong number in a meeting, which costs you a month of people double-checking everything you say afterward.
