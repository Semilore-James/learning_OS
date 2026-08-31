# Sampling and sampling bias

## The one-sentence version

You almost never have all the data, only a sample, and whether that sample tells the truth about the whole depends entirely on how it was selected, not how big it is.

## What it is

- **Population** — everyone or everything you want to make a claim about. All customers, all sessions, all transactions this year.
- **Sample** — the subset you actually have or measure.
- **Sampling bias** — a systematic difference between the sample and the population, caused by the selection process, that pushes your estimates in a consistent wrong direction.

Bias is not randomness. Random error shrinks as the sample grows. Bias does not; a biased sample of a million is still biased.

## Why it exists

Full data is rare and often not even meaningful (the "population" of future customers does not exist yet). So you work with samples: survey respondents, a date range, users who hit a logging endpoint, the accounts a colleague exported. Every one of those was selected by some process, and if that process is correlated with the thing you are measuring, your answer is wrong in a way no amount of careful math will fix.

## How it works

**The kinds of bias, with where each one bites an analyst:**

- **Selection bias** — the sample is drawn in a way that favours certain units. You analyse "customers" but your export only includes customers with a completed profile, who are more engaged than average.
- **Survivorship bias** — you only see the ones that made it. Analysing "successful campaigns" tells you nothing without the failed ones. Studying current customers to understand churn misses everyone who already left.
- **Non-response bias** — people who answer a survey differ from people who ignore it. Satisfaction surveys are answered disproportionately by the very happy and the very angry.
- **Coverage bias** — your sampling frame misses part of the population. A phone survey misses people without phones. A web analytics tool misses users who block it.
- **Time-window bias** — a sample from December does not represent the year. A sample from the week of a big launch does not represent normal traffic.
- **Convenience sampling** — you used whatever data was easy to get. Almost always biased, and almost always what actually happens.

**Random sampling is the defence.** If every unit in the population has an equal, independent chance of being in the sample, the sample is unbiased in expectation and the standard tools (confidence intervals, tests) apply. Variants like stratified sampling (sample within each segment to guarantee representation) are refinements of the same idea.

**Sample size fixes noise, not bias.** A bigger random sample gives a tighter, more confident estimate of the truth. A bigger biased sample gives a tighter, more confident estimate of the wrong number. This is the single most important sentence in the chapter.

## When you use it

Before you trust any number computed from data you did not collect yourself, and before you generalise any finding beyond the exact rows you have. The question is always: how did these particular rows come to be in front of me, and is that process related to what I am trying to measure?

## A worked example

A product team reports "our users love the new dashboard, 4.6 out of 5". The rating comes from an in-app prompt that appears after a user opens the dashboard five times in a week.

The sample is users who opened the dashboard five times in a week. Those are the users for whom it already works. Everyone who tried it once, found it confusing, and never came back is not in the sample. The 4.6 is real, and it describes the power users, and it is silent about whether the dashboard is driving anyone away.

The fix: survey a random sample of all users who were shown the dashboard, not just the ones who kept using it. Or look at a behavioural metric (did dashboard-exposed users retain better than a holdout) that does not depend on anyone choosing to respond.

> **Try This**
> For a case dataset, write two or three sentences on how the data was likely collected and one specific way that process could bias a conclusion the case is steering you toward. Then check whether the case's own framing is quietly relying on a survivor-only view.
