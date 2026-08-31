# Who is your audience

## The one-sentence version

Before you make a single slide, know who is in the room, what decision they are trying to make, and how much they already know, because the same analysis becomes three different presentations for three different audiences.

## What it is

A short profile of the people who will receive your work:

- **Their role and stake.** An executive deciding where to put budget. A product manager deciding what to build next. A peer analyst who will pressure-test your method. Ops who has to implement whatever you recommend.
- **The decision on the table.** What will they do differently after seeing this? If the answer is "nothing", you are giving a status update, not a data story, and that is a different (shorter) format.
- **Their prior knowledge.** Do they know the metric definitions? The history? The last three times this was looked at? You calibrate how much to explain from this.
- **Their constraints.** How much time you have, whether it is a live presentation or a document they read alone, whether they are hostile, skeptical, or already convinced.
- **What they care about.** Cost, risk, speed, growth, headcount, a specific KPI they are measured on.

## Why it exists

Analysts default to presenting the analysis: here is what I did, in the order I did it, with all the caveats. That is the right structure for a lab notebook and the wrong structure for a decision-maker who has eight minutes and one question. Knowing the audience is what lets you cut the 40-slide method walkthrough down to the 3 slides that change what they do.

## How it works

**Ask, before you build:**

1. **Who exactly is in the room?** Names and roles, not "leadership". The most senior person's question is the one you must answer first.
2. **What decision does this inform?** Write it as a sentence: "Whether to keep funding Campaign B." If you cannot write it, find out before you present.
3. **What do they already believe?** If they think Campaign B is working and your data says it is not, you are changing a mind, which needs more evidence up front, not less.
4. **How will they consume it?** Live meeting: build for a spoken narrative, few words per slide, you fill the gaps. Emailed document: build for self-service, every slide readable without you.
5. **What is their time budget?** 5 minutes means the answer is slide 1 and the rest is backup. 45 minutes means you can walk the logic.

**Then adjust three things:**

- **Altitude.** Executives get the "so what" and the recommendation; the method is an appendix. Analysts get the method because they will check it. Ops gets the "what changes for you" in operational terms.
- **Vocabulary.** Define a term the first time only if someone in the room might not know it. Over-explaining to experts is as bad as under-explaining to newcomers.
- **What is backup.** Everything that is not the answer or the direct support for it goes into an appendix you have ready but do not show unless asked.

**The same analysis, three audiences:**

- To the **CFO** (decision: renew the tool contract?): one slide. "The tool saves 12 analyst-hours a week, worth ~£90k a year, against a £40k licence. Renew." Method on request.
- To the **analytics team** (will they trust the number?): the 12-hours figure, how it was measured (time-tracking sample, n=8, 3 weeks), the assumptions, the sensitivity. They want to poke it.
- To **ops** (they administer the tool): what the renewal means for their workflow, the migration risk, who owns it next year.

## When you use it

At the very start, before opening a slide tool or a notebook. Ten minutes profiling the audience saves hours building the wrong deliverable, and it is the difference between a presentation that lands and one that gets "thanks, we'll circle back".

## A worked example

An analyst finishes a churn analysis and books 30 minutes with "the leadership team". They build 25 slides: data sources, cleaning decisions, model selection, feature importance, three cohort charts, and finally a recommendation on slide 24.

They should have asked first: the meeting is the VP of Product plus two PMs, the decision is which of two retention features to build next quarter, and they have maybe 12 minutes because it is item 4 on a packed agenda.

The right deck is 4 slides: (1) churn is concentrated in month-2 users who never used feature X; (2) the two candidate features and which one addresses that; (3) the recommendation with the expected retention impact and a confidence range; (4) what they need from the room today. The 21 method slides become an appendix, opened only if a PM asks "how do you know".

> **Try This**
> For a completed case, write the audience profile in 5 lines: who, what decision, what they believe, how they will read it, how much time. Then list which parts of your analysis are the answer, which are support, and which are backup.
