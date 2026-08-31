# Executive summary writing

## The one-sentence version

An executive summary is the whole analysis compressed into a few sentences that lead with the answer and the recommendation, written so that a busy reader who reads nothing else still knows what to do.

## What it is

A short block of text, usually 3 to 6 sentences or bullets, at the very top of a document or the first slide of a deck. It contains:

- **The finding** (the one insight, stated as a claim with a number).
- **Why it matters** (the consequence if nothing is done, or the opportunity).
- **The recommendation** (specific action, owner, rough timing).
- **The confidence and the main caveat** (how sure you are, and the one thing that could change the picture).

It does not contain the method, the data-cleaning notes, the alternatives you considered, or a buildup. Those are below.

## Why it exists

The most important reader of your analysis is often the one with the least time. They will read the first paragraph and skim the rest, or forward it with "thoughts?" after reading only the top. If the answer is buried on page 4, they miss it. The executive summary puts the conclusion where the attention is.

## How it works

**Write it last, place it first.** You cannot summarise an analysis you have not finished. Do the work, find the insight, then write the summary as the distillation.

**Lead with the answer, not the journey.** Bad: "We analysed Q3 support tickets across four channels and examined resolution times, satisfaction scores, and volume trends..." Good: "One billing bug caused 40% of last quarter's negative reviews. Engineering has it as a P3. Moving it to P1 would likely recover most of the affected satisfaction within a month."

**Every sentence earns its place.** In 5 sentences you have room for: the finding, the size of it, the cause, the recommended action, the expected result. Anything else is padding.

**Quantify.** "Sales dropped" is weak. "Sales dropped 4%, entirely in the West region" is a summary. Numbers give the reader something to hold and something to check.

**State confidence honestly.** "We are confident in the 40% figure (based on tagging every negative review for the quarter). The one-month recovery estimate is a rougher guess." Do not oversell the soft parts to make the summary punchier.

**The recommendation must be actionable.** Not "we should improve retention" but "revert the trial length from 7 to 14 days; owner: growth PM; expected to recover ~5 points of trial-to-paid conversion within a quarter".

**Structure options:**

- **Prose paragraph** for a document: 3 to 5 sentences, the arc compressed (finding, why, recommendation).
- **Bulleted** for a deck or a dense email: one line each for finding / impact / recommendation / confidence.
- **The "BLUF" format** (Bottom Line Up Front): a single bolded sentence, then two or three supporting lines.

**Test it:** hand the summary alone to someone who has not seen the analysis. Ask them what the finding is and what should happen next. If they get both right, the summary works. If they ask "what does this mean" or "so what should we do", rewrite.

## When you use it

On every document longer than a page and every deck longer than a few slides. Also as the body of the email that carries the deck: three sentences and the attachment, not "please see attached".

## A worked example

A 20-page retention analysis. The executive summary at the top:

> **Trial-to-paid conversion fell from 22% to 14% in April, costing roughly 300 new paying customers a month (~£45k MRR).** The drop began the week the trial length was cut from 14 to 7 days; no other change correlates. Users who converted under the old length used a median of 4 core features during the trial; under the 7-day trial, converters use a median of 2, and non-converters barely start.
>
> **Recommendation:** revert to a 14-day trial. Owner: Growth. Expected to recover 5 to 7 points of conversion within one quarter, based on the pre-April baseline. Risk: the shorter trial was meant to reduce free-tier support load, which will return; quantify that before deciding if it is material.

A reader who reads only that knows the problem, its size, the likely cause, what to do, who does it, what to expect, and the one thing to watch. The other 19 pages are for the people who want to check it.

> **Try This**
> Write the executive summary for a completed case: 4 to 5 sentences leading with the finding and its size, then the recommendation with an owner, then the confidence and one caveat. Give it to someone who has not seen your work and check they can state the finding and the next step.
