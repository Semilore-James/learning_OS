# Interpreting p-values

## The one-sentence version

A p-value is the probability of seeing data this extreme if nothing were going on, and almost every common phrasing of what it "means" is wrong in a way that matters.

## What it is

Given a null hypothesis (H0: no effect), the p-value is:

> the probability, assuming H0 is true, of getting a result at least as extreme as the one you observed.

Small p means "this data would be surprising if H0 were true", which is evidence against H0. That is the entire definition. Everything else is interpretation, and interpretation is where it goes wrong.

## Why it exists

The p-value is the number that gets a decision made. "p = 0.03, ship it." Because it carries that weight, misreading it leads directly to bad calls: shipping noise, killing real effects, and reporting false certainty to people who will repeat it. An analyst who can state precisely what a p-value does and does not say is worth more than one who can run ten tests.

## How it works

**What p is NOT:**

- **Not the probability that H0 is true.** p = 0.03 does not mean "3% chance there is no effect". That probability depends on how likely an effect was before the test (the prior), which the p-value never sees. Rare effects with low p-values are often still false.
- **Not the probability your result was due to chance.** Close, but the p-value assumes chance (H0) and asks how weird the data is under that assumption. It cannot tell you the chance that assumption holds.
- **Not a measure of effect size.** p = 0.001 does not mean "big effect". It can mean a tiny effect measured with a huge sample. A large effect in a small sample can have p = 0.2.
- **Not "significant means important".** Statistical significance is about detectability, not magnitude or business value.
- **Not "p = 0.049 is a result and p = 0.051 is not".** The 0.05 line is a convention. Treat 0.05 and 0.051 as basically the same amount of evidence, which is: weak.

**What p IS useful for:** a rough, one-directional signal. Very small p (say under 0.01) with a pre-registered hypothesis and a sensible sample is decent evidence something real is there. p around 0.05 is a hint. p above 0.1 is "not enough evidence", which is not the same as "no effect".

**p-hacking, the thing to never do:** if you test many outcomes, many subgroups, or keep peeking and stopping when p dips below 0.05, you will find "significant" results that are pure noise. Every extra test you run inflates your false-positive rate. Defences: decide the outcome and the analysis before you look, correct for multiple comparisons (Bonferroni, or just be sceptical of the 4th subgroup that "worked"), and report everything you tested, not just the winner.

**Always pair p with an effect size and a confidence interval.** "Variant lifted conversion by 0.4 points (95% CI 0.1 to 0.7), p = 0.01" is a complete, honest result. "p = 0.01" alone is not.

## When you use it

Any time a test spits out a p-value and you are about to put it in a sentence. The check: could a smart, sceptical colleague poke a hole in how I phrased this? Rephrase until they cannot.

## A worked example

A team runs 20 A/B tests in a quarter. None of the tested changes actually does anything (suppose you knew this). How many come back "significant" at p < 0.05?

On average, one. `20 x 0.05 = 1`. That test will get written up, celebrated, and rolled out, and it will do nothing, and nobody will know because the other 19 nulls are forgotten.

Now the same team runs one test, on one pre-declared metric, and it comes back p = 0.002 with a 6% lift and a CI of 3% to 9%. That is a genuinely different situation: one shot, small p, real effect size, tight interval. Ship it.

Same p-value threshold, completely different trustworthiness, and the difference is the process around the test, not the number itself.

> **Try This**
> Take any "significant" claim (from a case, an article, a slide). Rewrite it in the precise form: "assuming there is no effect, data this extreme happens X% of the time". Then note what is still missing: the effect size, the interval, and how many other things were tested.
