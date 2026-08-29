# Plotting: Matplotlib, Seaborn, Plotly

## The one-sentence version

Matplotlib is the engine and the fallback, Seaborn makes statistical charts in one line, and Plotly makes interactive charts for the web, and pandas' own `.plot()` covers most quick looks.

## What it is

Three libraries, one job: turn a DataFrame into a picture.

- **Matplotlib** (`import matplotlib.pyplot as plt`): low-level, verbose, total control. Everything else is built on it.
- **Seaborn** (`import seaborn as sns`): high-level, DataFrame-aware, sensible defaults, great for distributions and comparisons.
- **Plotly** (`import plotly.express as px`): interactive (hover, zoom, pan), renders in a browser or notebook, good for dashboards and sharing.

## Why it exists

A summary table makes the reader do the comparison. A chart does it for them. During analysis you plot constantly to *see* the data, outliers, skew, a relationship, a trend, and then you make one clean chart for the finding. The three libraries trade off speed of writing against control and interactivity.

## How it works

**Quick look, pandas built-in:**

```python
df["revenue"].hist(bins=30)                       # distribution
df.groupby("store")["revenue"].sum().plot.bar()   # bar of a summary
df.set_index("date")["revenue"].plot()            # line over time
df.plot.scatter(x="ad_spend", y="revenue")        # relationship
plt.show()
```

`.plot()` on a DataFrame or Series is the fastest path and enough for exploration.

**Seaborn, for the statistical views:**

```python
import seaborn as sns
sns.histplot(df, x="revenue", bins=30)
sns.boxplot(df, x="store", y="revenue")           # spread and outliers per store
sns.scatterplot(df, x="ad_spend", y="revenue", hue="region")
sns.lineplot(df, x="month", y="revenue", hue="store")
sns.heatmap(df.corr(numeric_only=True), annot=True)   # correlation matrix
```

Seaborn takes the DataFrame and column names directly and handles grouping (`hue`), so a grouped comparison is one line.

**Matplotlib, when you need control:**

```python
fig, ax = plt.subplots(figsize=(8, 4))
summary = df.groupby("store")["revenue"].sum().sort_values()
ax.barh(summary.index, summary.values)
ax.set_title("Revenue by store")
ax.set_xlabel("Revenue")
fig.tight_layout()
fig.savefig("revenue_by_store.png", dpi=150)
```

`fig, ax = plt.subplots()` gives you the figure and axes objects; you then call methods on `ax`. This is the pattern for a chart that goes in a report.

**Plotly, for interactive:**

```python
import plotly.express as px
fig = px.line(monthly, x="month", y="revenue", color="store",
              title="Monthly revenue by store")
fig.show()
```

**Cleaning a chart up** (applies to all three): drop the legend if there is one series, drop gridlines unless values must be read off them, sort bars by value, start bar axes at zero, add a title only if the surrounding text does not already say what it is, label directly rather than making the reader trace to an axis.

## When you use it

pandas `.plot()` and Seaborn while exploring, dozens of throwaway charts. Matplotlib for the finished chart that needs exact control and a saved PNG. Plotly when the audience will interact with it or it lives in a dashboard.

## A worked example

Exploring, then finishing:

```python
# explore
sns.boxplot(df, x="store", y="unit_price")     # one store's prices are wider -> investigate
sns.histplot(df, x="units", bins=40)            # long right tail -> an outlier

# finish
fig, ax = plt.subplots(figsize=(7, 4))
s = df.groupby("store")["revenue"].sum().sort_values()
ax.barh(s.index, s.values, color="#4b6")
for i, v in enumerate(s.values):
    ax.text(v, i, f" {v:,.0f}", va="center")
ax.set_title("Ikeja is 33% below the next-lowest store")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("finding.png", dpi=150, bbox_inches="tight")
```

The exploratory plots find the story; the finished bar chart, with the finding as the title and labels on the bars, tells it.

> **Try This**
> For any case finding, make the exploratory plots first (boxplot, histogram, scatter) to confirm the pattern, then one clean bar or line chart with the finding as the title. Run Chart Critiquer to check you have not built a chart that misleads.
