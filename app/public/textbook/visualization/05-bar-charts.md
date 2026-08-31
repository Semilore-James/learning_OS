# Bar charts done right

## The one-sentence version

The bar chart is the workhorse for comparing a value across categories, and doing it right is mostly about starting at zero, sorting by value, and resisting the urge to add a second dimension.

## What it is

Rectangles whose length encodes a value, one per category. Variants:

- **Vertical bars (columns)** — the default. Good for up to about 10 categories, or for time periods you want treated as discrete.
- **Horizontal bars** — better when category labels are long, or when there are many categories. The labels read left to right without rotating.
- **Grouped bars** — two categorical dimensions. Bars for each subcategory clustered within each main category. Readable up to about 3 subcategories.
- **Stacked bars** — parts of a whole, per category. The total is comparable across categories; the internal segments are hard to compare except the bottom one.
- **100% stacked bars** — composition (percent of each category), when the total does not matter and the mix does.

## Why it exists

Length is one of the two things human perception judges most accurately (position is the other). Put two bars side by side and anyone can tell you which is bigger and roughly by how much. That reliability is why the bar chart wins almost every "compare X across categories" job over pies, bubbles, and gauges.

## How it works

**Non-negotiable:**

- **Start the value axis at zero.** Bars encode length. A bar from a baseline of 90 is not 90% shorter than a bar to 100; it is a lie about the ratio.
- **Sort by value, descending**, unless the categories have their own order (days of the week, size bands, a time sequence). Sorting turns the chart into a ranking, which is usually the point.

**Strong defaults:**

- **One color, or grey plus one accent.** Do not give every bar its own color; the categories are on the axis already, the color adds nothing and costs clarity.
- **Direct value labels** at the end of each bar if exact numbers matter, and then drop the axis and gridlines entirely. Or keep a light axis and skip the labels. Not both.
- **Thin gaps between bars**, roughly half a bar width. Bars touching read as a histogram (continuous); bars far apart waste space.
- **Horizontal when you have more than ~8 categories or long labels.** Rotated 45-degree labels are a sign you should have gone horizontal.

**Grouped vs stacked:**

- Use **grouped** when the reader needs to compare the subcategories to each other ("in every region, is online bigger than retail?").
- Use **stacked** when the reader needs the total and only a rough sense of the mix. Order the segments consistently and put the most important one at the bottom (the baseline), because only the bottom segment is easy to compare across bars.
- If you find yourself wanting both, you probably need small multiples: one small bar chart per subcategory.

**What not to do:** 3D bars (perspective distorts), bars with a gradient fill or a shadow (visual noise), a bar chart where the bars are all nearly the same height (use a dot plot and let the axis breathe), more than about 12 bars (switch to a different view or aggregate the tail into "Other").

## When you use it

Any "which category has the most / least" or "how do these groups compare" question. For a value over time where you want the trend, use a line instead; use bars for time only when the periods are few and you want to compare them as discrete blocks.

## A worked example

Revenue by sales rep, 15 reps, and you want to show the spread and who the top performers are.

**Weak:** 15 vertical bars in rep-name order, rainbow colored, y-axis 0 to max, rotated labels.

**Strong:** horizontal bars, sorted descending by revenue, all one grey. The top 3 bars get the accent color and a direct label with the number. A faint vertical line at the team median with a label. Title: "Top 3 reps generate 40% of revenue". The chart now answers the question in the title at a glance, and the long tail of smaller bars provides the context that makes "40%" land.

> **Try This**
> Take a category comparison from a case. Build the bar chart correctly: zero baseline, sorted by value, one accent color on the bars that matter, direct labels or a light axis but not both, horizontal if labels are long. Write the title as the finding.
