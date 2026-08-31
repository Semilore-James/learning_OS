# Choosing what NOT to show

## The one-sentence version

Most of what you found does not belong in the presentation, and the discipline to cut it is what separates a sharp story from a data dump that leaves the room confused.

## What it is

The active decision to leave things out:

- **Findings that are true but not decision-relevant.** Interesting, not useful for this audience and this choice.
- **Analysis you did that did not pan out.** The three models that did not work, the hypothesis that was wrong.
- **Detail that supports the point but is not the point.** The full methodology, every robustness check, the data lineage.
- **Charts that are impressive but off-topic.** The beautiful heatmap that is not about the recommendation.
- **Nuance that belongs in a footnote.** Every caveat, every "it depends", stated in full.

None of this is deleted. It goes into an appendix, a backup section, or the underlying document. It is just not in the main narrative.

## Why it exists

Analysts over-include because it feels dishonest to leave things out, or because they want credit for the work, or because they cannot tell which findings matter. The result is a 30-slide deck where the recommendation is on slide 24 and the audience has lost the thread by slide 8. Every slide you add dilutes the ones that matter. Cutting is not hiding; it is focusing.

## How it works

**The test for every slide and every chart:** does this move the audience toward the decision? If it is not the insight, not direct evidence for the insight, and not the recommendation, it does not go in the main deck.

**Specifically cut:**

- **"While we were in there" findings.** You noticed a seasonality pattern while analysing churn. Unless seasonality is the story, it is a one-line mention or an appendix slide, not a section.
- **Method, in detail.** The audience needs to trust the number, not reproduce it. One line ("based on tagging every negative review, n=1,240") builds trust. Ten slides on the tagging protocol lose the room. Have the detail ready in the appendix for the person who asks.
- **Failed approaches.** "We tried a regression model and it did not fit well" is worth one sentence if it explains why you used a simpler cut. A full walkthrough of the model that did not work is for your own notes.
- **Every caveat, up front.** Stating fifteen limitations before the finding makes you sound unsure and buries the point. State the finding, then the one or two caveats that actually affect the decision, then reference "further limitations in the appendix".
- **Redundant charts.** If two charts make the same point, keep the clearer one.
- **The comprehensive backup table.** The 40-row detail table goes in the appendix; the main slide shows the top 5 and "full detail in appendix".

**What to keep even though it is uncomfortable:**

- **The caveat that could change the decision.** If your recommendation flips depending on an assumption, that assumption is not a footnote; it is on the recommendation slide.
- **The finding that undercuts your recommendation.** If you found evidence against your own conclusion, show it and address it. Omitting it is the dishonest kind of cutting.
- **The uncertainty range.** A point estimate with no range is a false precision that gets quoted forever.

**How to cut in practice:** build the full deck, then ruthlessly move slides to an appendix section. Present from the trimmed deck. If a question comes up that a cut slide answers, jump to it. You lose nothing and the main narrative stays tight.

## When you use it

After the narrative arc is built, as an editing pass. Go slide by slide asking "does this serve the decision". Move the "no"s and the "sort of"s to the appendix. Then do it once more; the second pass always finds more.

## A worked example

An analyst's full deck on a pricing analysis: 22 slides. The trimming pass:

- Slides 1-3 (data sources, cleaning, sample construction) -> appendix. Replace with one line on slide 2: "based on 18 months of transactions, all customers, test accounts excluded".
- Slides 5-7 (three pricing elasticity models, two of which were rejected) -> appendix. Keep one sentence: "elasticity estimated at -1.3 using [method]; two alternative methods gave -1.1 and -1.4, so the range is tight".
- Slide 11 (a fascinating chart about geographic price sensitivity that is not part of the recommendation) -> appendix, mentioned in one line as "a secondary finding worth a follow-up".
- Slides 14-18 (five robustness checks) -> one appendix slide summarising all five as "checked against X, Y, Z; conclusion holds".
- Slides 19-21 (every caveat) -> the two that matter move to the recommendation slide; the rest go to an appendix "limitations" slide.

Result: a 7-slide main deck (insight, context, complication, two evidence slides, recommendation, ask) and a 12-slide appendix. The meeting stays on the decision, and every cut slide is one click away if someone asks.

> **Try This**
> Take a completed case analysis. List every finding you have. Mark each: is it the insight, direct support for it, the recommendation, or "other". Everything marked "other" goes to an appendix. Build the main deck from what is left and count the slides.
