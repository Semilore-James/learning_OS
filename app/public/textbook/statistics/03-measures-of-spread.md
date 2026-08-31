# Measures of spread

## The one-sentence version

The average tells you where the data sits; the spread tells you how much you can trust that average to describe any individual, and without it a mean is half a sentence.

## What it is

Numbers that describe how far the data ranges around its centre:

- **Range** — max minus min. Simple, and completely at the mercy of one outlier.
- **Variance** — the average of the squared distances from the mean. In squared units, so it is hard to interpret directly, but it is the building block for a lot of statistics.
- **Standard deviation (SD)** — the square root of the variance. Back in the original units. Roughly "the typical distance a value sits from the mean".
- **Interquartile range (IQR)** — the 75th percentile minus the 25th percentile. The range of the middle half of the data. Ignores the extremes entirely.

## Why it exists

"Average delivery time is 3 days" could mean every order arrives in 3 days give or take a few hours, or it could mean half arrive next-day and half take a week. Same mean, completely different customer experience, completely different operational problem. The spread is what distinguishes them. A mean without a spread is a claim you cannot check.

## How it works

**Standard deviation** works best on roughly symmetric data. For a normal distribution there is a clean interpretation: about 68% of values fall within 1 SD of the mean, about 95% within 2 SD, about 99.7% within 3. So "mean 100, SD 15" tells you most values are between 70 and 130, and a value of 160 is unusual.

Because SD is built from the mean, it inherits the mean's weakness: one extreme value inflates it. If your data is skewed, a large SD might just be telling you about the skew, not about typical variation.

**IQR** is the robust alternative, and it pairs with the median. "Median 49, IQR 30 to 120" says the middle half of customers pay between 30 and 120, and it says nothing about the whales at the top, which is often exactly what you want.

**Sample vs population:** when you compute variance from a sample and want to estimate the population, you divide by `n - 1` instead of `n` (Bessel's correction). Every tool has both; pandas `.std()` defaults to sample (`n - 1`), NumPy `.std()` defaults to population (`n`). Know which your tool gives you.

**Coefficient of variation** (`SD / mean`) lets you compare spread across columns on different scales. An SD of 5 is huge for a column with mean 10 and tiny for a column with mean 10,000.

## When you use it

Right after you report any mean or median. The pattern is: centre, then spread, then shape. "Typical value is X, values usually fall within Y of that, and the distribution is [symmetric / right-skewed / bimodal]." That is a complete description in one sentence.

## A worked example

Two support teams, both with a mean handle time of 12 minutes:

```
Team A:  mean 12,  SD 2,   IQR 10.5 to 13.5
Team B:  mean 12,  SD 9,   IQR 4 to 22
```

Same average. Team A is consistent: nearly every ticket takes 10 to 14 minutes, so staffing and SLAs are predictable. Team B is all over the place: some tickets are closed in 4 minutes, some drag to 22, and the mean of 12 describes very few actual tickets.

The recommendation is different for each. Team A: fine, leave it. Team B: the variance is the problem. Find out whether it is ticket difficulty, agent skill, or a queue that batches hard tickets together, and fix that before touching the average.

> **Try This**
> Take a duration or amount column from a case. Report it as centre plus spread: mean and SD if it looks symmetric, median and IQR if it looks skewed. Then run Data Detective and notice how the "show ranges" view is doing exactly this to help you spot the rows that do not fit.
