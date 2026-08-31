# Distributions: normal, skewed, uniform

## The one-sentence version

The shape of a column decides which summary statistics are honest, which tests are valid, and what "unusual" means, so you look at the shape before you do anything else.

## What it is

A distribution is the pattern of how often each value (or range of values) occurs. You see it as a histogram: values on the x-axis, count on the y-axis. The common shapes:

- **Normal (bell curve)** — symmetric, one peak in the middle, tails that thin out evenly on both sides. Height, measurement error, and the average of many independent things all tend toward this.
- **Right-skewed (positive skew)** — a peak on the left, a long tail stretching right. Income, house prices, session length, order value, time-to-anything, company size. The mean sits to the right of the median.
- **Left-skewed (negative skew)** — the mirror image, long tail to the left. Rarer. Exam scores on an easy test, age at retirement.
- **Uniform** — every value roughly equally likely, a flat rectangle. Lottery numbers, a well-shuffled deck, the last digit of a phone number. In real data, a suspiciously uniform column is often a sign of fabrication or a default fill.
- **Bimodal** — two distinct peaks. Almost always means two populations are mixed together: two customer segments, weekday and weekend traffic, before and after a price change.

## Why it exists

Nearly every statistical shortcut assumes a shape. "Mean plus or minus 2 SD covers 95%" is only true for a normal distribution. A t-test assumes approximate normality (of the sampling distribution, but in practice you check the data). If you report a mean for a heavily right-skewed column, you are describing a value that few of your rows are near. The distribution is the check that tells you whether your instincts are safe here.

## How it works

**Look at the histogram first.** Twenty to fifty bins. You are asking: one peak or more, symmetric or lopsided, where are the tails.

**Skew has a number.** Positive skew value means right-skewed, negative means left, near zero means symmetric. But the histogram tells you more, faster.

**Right-skewed data is the default in business.** Almost anything that is a count, an amount, or a duration is right-skewed, because it is bounded at zero on the left and unbounded on the right. When you meet a right-skewed column your moves are: report the median, consider a log transform if you need to model it, and expect the top few percent of rows to hold a large share of the total.

**A log transform** (`log(x)`) pulls in the long right tail and often makes a right-skewed column look roughly normal. Revenue, population, and word-frequency data are usually analysed on a log scale for this reason. Remember to convert back when you report.

**Bimodal means split.** Do not summarise a bimodal column as one thing. Find the variable that separates the two humps (segment, day type, cohort) and analyse each group on its own.

## When you use it

In the exploration pass, one histogram per numeric column. It takes two minutes and it changes which statistics you are allowed to trust for the rest of the analysis.

## A worked example

Time on site for a content site, in seconds:

```
histogram: sharp peak near 15 seconds, long tail out past 600
mean:   95
median: 32
skew:   +3.1  (heavily right-skewed)
```

The shape says most visitors bounce in under 20 seconds, a smaller group reads for a few minutes, and a handful stay very long (or left a tab open). Reporting "average time on site is 95 seconds" suggests decent engagement. The median of 32 and the shape say otherwise: this is a bounce problem with a small engaged core.

Splitting by traffic source reveals the histogram is actually bimodal: search traffic peaks at 8 seconds, newsletter traffic peaks at 3 minutes. Two populations. Report them separately and the recommendation becomes obvious.

> **Try This**
> Plot a histogram for every numeric column in a case dataset. Tag each one: normal, right-skewed, left-skewed, uniform, bimodal. For any bimodal column, find the categorical variable that splits the two peaks. Then play Data Detective, where spotting the value that breaks the expected shape is the whole game.
