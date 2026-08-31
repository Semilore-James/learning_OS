# Measures of central tendency

## The one-sentence version

Mean, median, and mode each answer "what is a typical value?" differently, and picking the wrong one is how a report ends up technically true and completely misleading.

## What it is

Three ways to collapse a column of numbers into one representative value:

- **Mean** — add everything up, divide by the count. The balance point.
- **Median** — sort the values, take the middle one. The 50th percentile. Half the data is below it, half above.
- **Mode** — the value that appears most often. The only one that works for nominal data.

## Why it exists

"What's the average order value?" sounds like one question with one answer. It is not. If nine customers spend around 30 and one spends 5,000, the mean order value is about 527 and the median is 30. One of those numbers describes your typical customer. The other describes nobody. The whole reason to know all three is to notice when they disagree, because the disagreement is the finding.

## How it works

**Mean** is pulled toward extreme values. One huge order, one data-entry error with an extra zero, one billionaire in your sample, and the mean moves a lot while the median barely twitches. The mean uses every value's exact magnitude, which is its strength for symmetric data and its weakness for skewed data.

**Median** ignores magnitude and only cares about order. Change the top value from 5,000 to 50,000 and the median does not move at all. This makes it robust: resistant to outliers and to skew. The cost is that it throws away information about how far the extremes reach.

**Mode** is the most common value. For `payment_method` the mode might be "card". For a continuous column like revenue the mode is often useless (every value is unique) unless the data clumps at round numbers or a default.

**The rule of thumb:**

- Symmetric data, no wild outliers: mean and median agree, use the mean.
- Skewed data (income, house prices, session length, order value, company size): use the median, and say so.
- Categorical data: mode.
- Always compute mean and median both. If they are far apart, the data is skewed and you need to say which one you are reporting and why.

## When you use it

Every summary table. Every "the typical X is..." sentence. The moment a stakeholder asks for "the average", your job is to check whether the mean is the honest choice for that column before you hand it over.

## A worked example

Monthly revenue per customer for a SaaS product, 500 customers:

```
mean:   142
median:  49
mode:    19   (the entry-tier price)
```

The mean is nearly 3x the median. That gap tells the story before any chart does: most customers are on the cheap plan (mode 19, median 49), and a small number of large accounts drag the mean up to 142.

- Reporting "average revenue per customer is 142" implies a healthy mid-market base. False.
- Reporting "half of customers pay 49 or less, and revenue is concentrated in the top accounts" is what is actually happening, and it is a different strategic conversation.

The follow-up analysis writes itself: what fraction of revenue comes from the top 10% of customers, and what happens if one of them leaves.

> **Try This**
> For a case dataset, pick a money or duration column and compute mean, median, and mode. If mean and median differ by more than about 20%, the column is skewed. Write the one sentence you would put in the report, and make sure it names which measure you used.
