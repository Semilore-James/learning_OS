# Scatter plots and correlation

## The one-sentence version

A scatter plot shows the relationship between two numeric variables, one dot per record, and it is the fastest way to see whether they move together, how tightly, and which records break the pattern.

## What it is

Two numeric axes, one point per row, positioned by its values on each. What you read off it:

- **Direction** — do the points slope up (positive relationship), down (negative), or form a cloud (none).
- **Strength** — are the points a tight band around a line, or a loose scatter. This is what the correlation coefficient **r** measures numerically.
- **Shape** — is the relationship straight, or does it curve, plateau, or fan out.
- **Outliers** — points far from the main cloud. Often the most interesting rows.
- **Clusters** — separate blobs, meaning subgroups with different behaviour.

## Why it exists

"Does A relate to B" is a question about two columns at once, and no other chart shows it as directly. A correlation number alone is not enough: r = 0.0 can mean "no relationship" or "a strong U-shaped relationship the linear measure cannot see", and only the scatter tells you which. Anscombe's quartet is four datasets with identical means, variances, and correlations that look completely different plotted.

## How it works

**Building it:**

- Put the variable you think of as the cause, or the input, on the x-axis; the outcome on the y-axis. It is a convention, not a rule, but it helps the reader.
- One dot per record. If you have thousands and the dots overlap into a blob (overplotting), make the dots small and semi-transparent, or use a 2D histogram / hexbin so density is visible.
- Do not connect the dots. A scatter has no order; lines between points are meaningless and imply a path.

**Adding a trend line:** a fitted line (linear, or a smoother like LOESS for curved relationships) helps the eye see the central tendency. Show the line, but keep the dots visible; the scatter around the line is information (it is the unexplained variation). Add r or R-squared as a small annotation if the audience wants a number.

**Reading strength:**

- r near +1 or -1: tight linear relationship.
- r near 0: no *linear* relationship. Check the plot for a curve before concluding "no relationship".
- The square of r (R-squared) is the share of variance in y explained by x. r = 0.5 sounds moderate but means only 25% of the variation is explained; the other 75% is something else.

**The trap:** a scatter shows correlation, and correlation is not causation. A tight upward slope between "marketing emails opened" and "revenue" does not mean emails drive revenue; engaged customers do both. The scatter is the start of the investigation, not the conclusion. (Full treatment in the Statistics book.)

**Extra dimensions, carefully:** you can encode a third variable as dot color (categorical) or size (numeric), turning a scatter into a 3-variable view. One extra dimension is usually fine; two (color and size) is often too much.

## When you use it

Whenever a stakeholder asks whether two things are related, or whenever you suspect a driver of an outcome and want to check before modelling it. Also as an exploration tool: scatter your outcome against every candidate variable to see which ones have any signal at all.

## A worked example

A team believes larger accounts churn less, and wants to visualise it. Scatter: account size (seats) on x, months retained on y, one dot per churned account.

The plot shows a weak positive slope (r = 0.3, so about 9% of retention variance explained by size) and, more usefully, a distinct cluster: a group of large accounts (200+ seats) that all churned in under 3 months, sitting well below the trend.

The weak overall correlation would have been reported as "size helps a little". The scatter reveals the real story: there is a segment of big accounts churning fast, and they are dragging the average. That cluster is the finding, and it is invisible in the correlation number.

> **Try This**
> Pick an outcome and a suspected driver in a case dataset. Make the scatter. Note the direction, estimate the strength, and circle any points or clusters that do not fit the pattern. Then check: does r alone tell the same story as the plot, or is the plot showing you something r hides?
