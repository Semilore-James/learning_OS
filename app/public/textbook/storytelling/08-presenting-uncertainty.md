# Presenting uncertainty

## The one-sentence version

Every estimate has a range, and showing that range honestly makes you more credible, not less, and stops your best guess from being quoted forever as a hard fact.

## What it is

Communicating how sure you are, alongside what you found:

- **A range instead of a point.** "5 to 7 points" rather than "6 points".
- **A confidence level in plain words.** "We are confident in X; Y is a rougher estimate; Z we genuinely cannot tell yet."
- **The assumptions the conclusion rests on**, and which ones, if wrong, would change it.
- **Visual uncertainty** on charts: error bars, confidence bands, a shaded forecast cone.

## Why it exists

Analysts feel pressure to be definitive, so they report the point estimate and drop the range. Then "conversion will improve by 6 points" gets written into a plan, the actual improvement is 3, and the analyst's credibility takes the hit. Presenting the uncertainty up front sets the right expectation and, counterintuitively, makes the audience trust the parts you *are* sure about more, because they can see you are not overclaiming.

## How it works

**Separate what you know from what you are guessing.** In any finding there are usually parts on solid ground and parts that are extrapolation:

- Solid: "40% of negative reviews mention this bug" (you tagged every review, it is a count).
- Softer: "fixing it would recover most of that satisfaction within a month" (an estimate based on how similar issues have recovered before).

Say which is which. "The 40% is a direct count. The one-month recovery is my estimate based on two prior cases; it could be two months or it could not fully recover if the damage is lasting."

**Use ranges, and say where they come from.** "Trial-to-paid conversion should recover 5 to 7 points" is more useful than "6 points" because the audience can plan for the low end. Add the basis: "the range is the spread between the pre-change baseline and a conservative adjustment for the market being softer now".

**Confidence intervals on charts.** If you have them (from a test, a model, a sample), show them: error bars on the bars, a shaded band on the line, a cone on the forecast. If two groups' intervals overlap heavily, the honest headline is "we can't distinguish these yet", and the chart should make that visible rather than showing two bare bars that look different.

**Name the load-bearing assumption.** Most analyses rest on one or two assumptions that, if wrong, flip the conclusion. "This assumes the marketplace channel's fulfilment cost stays at current levels. If it rises 20%, the recommendation reverses." Put that on the recommendation slide, not in a footnote.

**Distinguish the kinds of uncertainty:**

- **Sampling / statistical:** you measured a subset. Expressed as a confidence interval.
- **Model / assumption:** your estimate depends on a choice or a projection. Expressed as a sensitivity ("if X instead of Y, then...").
- **Unknown unknowns:** the data cannot see something relevant. Expressed as a caveat ("we have no visibility into offline sales, which could account for some of the gap").

**Do not drown the finding in caveats.** State the finding clearly first. Then the one or two caveats that matter for the decision. Then "further limitations in the appendix". Fifteen hedges before the point makes you sound like you have nothing.

**Avoid false precision.** "Revenue will be £4,237,891" from a forecast is absurd. "£4.2M, plus or minus £0.3M" is honest. Round to the precision your method actually supports.

## When you use it

On every estimate, forecast, and recommendation. The pattern: state the finding, state the range, name the one assumption that could change it, point to the appendix for the rest. It takes one extra sentence per finding and it protects both the decision and your reputation.

## A worked example

A forecast slide. 

**Overconfident version:** a line chart projecting revenue to £5.1M next quarter, single line, no range. Title: "Q4 revenue: £5.1M".

**Honest version:** the same projection as the center line, with a shaded band from £4.6M to £5.5M. Title: "Q4 revenue likely £4.6M to £5.5M, midpoint £5.1M". One line of text: "Range reflects the spread of the last four quarters' forecast error. Assumes the enterprise deal in late-stage pipeline closes; without it, subtract £0.4M."

The audience now plans for a range, knows the one deal that matters, and when Q4 comes in at £4.8M, the analyst was right, not wrong.

> **Try This**
> Take an estimate or recommendation from a completed case. Rewrite it with: a range instead of a point, one sentence on how confident you are and why, and the single assumption that would change the conclusion if it were wrong. Add a confidence band or error bars to the supporting chart if you can.
