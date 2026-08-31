# Dashboard layout principles

## The one-sentence version

A dashboard is not a pile of charts; it is a designed page with one job, a reading order, and a clear top-left, and most bad dashboards are bad because nobody decided what they were for.

## What it is

A single view combining several charts and numbers so a specific audience can answer a specific set of questions at a glance and, ideally, without scrolling. The design decisions:

- What the dashboard is for and who reads it.
- Which metrics earn a place (few) and which do not (most).
- The layout: what goes top-left, what is grouped with what, what is filtered together.
- The refresh cadence and the level of interactivity.

## Why it exists

The default way a dashboard gets built is: someone asks for a chart, it gets added; someone else asks for another, it gets added; a year later there are 30 charts, nobody knows which ones matter, and people go back to asking the analyst directly. A dashboard with a clear purpose and a tight metric set stays useful; a dashboard that tries to answer every possible question answers none of them well.

## How it works

**Decide the purpose first, in one sentence.** "Lets the regional managers see, each Monday, whether their region is on track and where the problem is if it is not." That sentence tells you the audience (regional managers), the cadence (weekly), and the questions (on track? where is the problem?). Every chart either serves that sentence or it does not belong.

**The inverted pyramid.** Readers scan a page top-left to bottom-right (in left-to-right languages). Put the most important thing top-left:

- **Top row:** the headline numbers. 3 to 6 big single numbers (KPIs) with a comparison built in ("Revenue £4.2M, +8% vs target"). A number with no comparison is not a KPI, it is trivia.
- **Second row:** the primary trend. The one line chart that shows whether things are going the right way over time.
- **Below that:** the breakdowns. The bar charts and tables that answer "where is the problem" once the top rows show there is one.
- **Bottom / side:** detail, filters, notes, definitions.

**Grouping and alignment.** Charts that belong together (all the revenue views, all the funnel steps) sit together in a visual block, aligned on a grid. Consistent chart sizes, consistent margins, consistent colors for the same things across every chart on the page. A dashboard where "West" is blue in one chart and orange in another is broken.

**Ruthless subtraction.** For every chart, ask: if this were gone, what decision would the reader be unable to make? If the answer is "none", cut it. Aim for a dashboard that fits one screen. If it needs a scroll, it is probably two dashboards.

**Consistency of encoding.** Same metric, same chart type, same axis convention everywhere. Do not show conversion as a line in one place and a gauge in another. The reader should learn the visual language of the dashboard once.

**Interactivity, used sparingly.** A date-range filter and one or two segment filters (region, product) that apply to the whole page are worth it. Twelve independent filters, drill-downs three levels deep, and tabs within tabs turn a dashboard into an application the reader has to learn. Default the filters to the most common view so the dashboard is useful with zero clicks.

**Text does work.** A one-line summary at the top ("Week of Mar 10: revenue on plan, West conversion down 3 points, cause under investigation") that a human updates each period is often the most-read part of the dashboard. Definitions for any metric that could be interpreted two ways, in a footer or a tooltip.

## When you use it

When a question gets asked repeatedly, by the same people, on a regular cadence, and the answer is a small stable set of metrics. One-off analysis is a report or a slide, not a dashboard. If the metrics or the questions are still changing weekly, it is too early to build the dashboard.

## A worked example

A sales dashboard request: "the team wants to see everything about the pipeline."

**Bad build:** 22 charts. Pipeline by stage, by rep, by region, by product, by source; win rate 6 ways; a leaderboard; forecast vs actual; deal age distribution; activity counts. It loads slowly, requires two scrolls, and the weekly meeting still starts with "can someone pull the actual number".

**Redone with purpose "weekly check: are we going to hit the quarter, and if not, why":**

- Top row: 4 KPIs. Quarter-to-date bookings vs target. Pipeline coverage ratio. Forecast vs quota. Win rate vs last quarter. Each with its comparison.
- Second row: one line chart, bookings pace against the quota line, week by week.
- Third row: two charts. Pipeline by stage (is there enough in late stages), and a small table of the 10 largest open deals with age and next step.
- Footer: a human-written line on the week, and definitions of "coverage ratio" and "forecast".

Nine elements, one screen, and the meeting can start with the dashboard instead of a data pull.

> **Try This**
> Write the one-sentence purpose for a dashboard you would build from a case dataset. List only the charts that serve it, arranged top-left to bottom-right by importance. Then list three charts you were tempted to include and cut them.
