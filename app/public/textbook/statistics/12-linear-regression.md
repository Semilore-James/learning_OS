# Regression basics (linear)

## The one-sentence version

Linear regression fits the best straight line through your data and hands you a slope you can read as "one more unit of X is associated with this much more Y", holding the other variables fixed.

## What it is

A model of the form:

```
Y = b0 + b1*X1 + b2*X2 + ... + error
```

- **Y** — the outcome you want to explain or predict (a number). Revenue, churn probability, delivery time.
- **X1, X2, ...** — the predictors (also called features or independent variables).
- **b1, b2, ...** — the **coefficients**. Each one is the expected change in Y for a one-unit increase in that X, with all other X's held constant.
- **b0** — the intercept, the predicted Y when every X is zero (often not meaningful on its own).
- **error** — everything the model does not capture.

Regression finds the coefficients that make the model's predictions as close as possible to the actual Y values (least squares).

## Why it exists

Two things at once. First, **explanation**: which factors are associated with the outcome, in what direction, and how strongly, controlling for the others. "After accounting for plan tier and tenure, each extra support ticket is associated with 0.8 percentage points more churn." Second, **prediction**: plug in a new row's X values and get an estimated Y. Most analyst use is the first kind.

## How it works

**Reading the output:**

- **Coefficient** — the effect. Sign is direction, magnitude is size. Always interpret in the units of that X ("per additional dollar", "per extra day").
- **p-value for each coefficient** — is this predictor's effect distinguishable from zero, given the others in the model.
- **R-squared** — the share of the variance in Y the model explains, 0 to 1. 0.7 means the model accounts for 70% of the variation. High R-squared is good for prediction; for explanation, a low R-squared with a clear, significant coefficient can still be a real finding.
- **Confidence interval on each coefficient** — the range of plausible effect sizes. Report this, not just the point estimate.

**"Holding other variables constant" is the whole point.** A simple correlation between X and Y ignores confounders. Putting the confounder in the regression as another X lets you read b1 as the effect of X1 *after* removing the part explained by the confounder. This is how regression is used to control for things when you cannot run an experiment.

**Assumptions worth knowing:**

- **Linearity** — the relationship is roughly a straight line. Plot Y against each X. If it curves, transform the X (log, square) or the relationship is not linear.
- **No extreme multicollinearity** — predictors that are near-duplicates of each other make the individual coefficients unstable and hard to interpret. Check correlations among the X's.
- **Roughly constant error spread** and **roughly normal errors** — matters most for the p-values and intervals. Check a residual plot.
- **Influential points** — one weird row can swing the line. Check.

**It is still not causation.** A regression coefficient is "association, controlling for the variables I included". Omit a confounder you did not think of and the coefficient is biased. Regression narrows the gap to causation; it does not close it.

## When you use it

When you need to quantify the relationship between an outcome and several factors at once, or to control for confounders you cannot randomise away, or to produce a simple, explainable prediction. For a yes/no outcome, the equivalent is logistic regression, which follows the same logic with the coefficients on a log-odds scale.

## A worked example

Predicting monthly revenue per account from three predictors. Regression output:

| Predictor | Coefficient | 95% CI | p |
|---|---|---|---|
| seats | 42.0 | 38 to 46 | <0.001 |
| tenure_months | 3.5 | 1.2 to 5.8 | 0.004 |
| support_tickets | -8.0 | -14 to -2 | 0.01 |
| (intercept) | 60.0 | | |

R-squared = 0.64.

Read it: each additional seat is worth about 42 more per month (tight interval, very significant). Each month of tenure adds about 3.5, controlling for size. And each support ticket is associated with 8 *less* revenue, controlling for seats and tenure, which is the interesting one: it might mean struggling accounts spend less, or that heavy support load precedes downgrades. The model explains 64% of the variation, decent for account-level revenue.

The report leads with the ticket finding, flags it as association not proof, and recommends checking whether ticket volume predicts downgrades in the next quarter.

> **Try This**
> In a case with a numeric outcome and a few plausible drivers, run a linear regression (or reason about what the coefficients would be). Pick the coefficient whose sign is surprising and write two sentences: what it literally says, and why it might not mean what it seems to.
