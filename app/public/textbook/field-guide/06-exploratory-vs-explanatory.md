# Exploratory vs explanatory

## The one-sentence version

There are two modes of analysis, one for you and one for the audience, and mixing them up is why so many presentations are 40 slides of charts with no point.

## Exploratory: finding the story

This is the messy phase, done for yourself. You slice the data every way you can think of, plot dozens of quick charts, chase hunches, hit dead ends. The goal is to *find* what is going on. Nothing here is polished, nothing here is shown to anyone.

Exploratory work is fast and disposable:

- Default charts, no formatting. `df.plot()` and move on.
- Many views, most of which you discard.
- You follow curiosity: "that region looks weird, let me split it by month, by product, by rep."
- You are allowed to be wrong repeatedly. That is the process working.

You stop when you can state the finding in one sentence.

## Explanatory: telling the story

This is the polished phase, done for the audience. You have the finding. Now you build the smallest set of charts that proves it and the narrative that carries it.

Explanatory work is slow and deliberate:

- One chart per point, designed: sorted, one accent colour, honest axis, the finding as the title.
- Few views, each chosen to advance the argument.
- You follow the audience's decision, not your curiosity.
- Everything that does not serve the point goes in an appendix.

## The common failure

An analyst does great exploratory work, then presents it *as* the exploration. Slide 1: data sources. Slide 8: an interesting seasonality pattern that is not the point. Slide 14: the model that did not work. Slide 22: finally, the recommendation.

The audience needed the explanatory version: the finding first, three slides of proof, the recommendation. The 21 exploratory slides were real work, but they were the analyst's process, not the audience's answer.

## The move

When you finish exploring, close the notebook and start a fresh one (or a fresh slide deck) for the explanatory version. Do not "clean up" the exploration into a presentation; rebuild from the one-sentence finding. The physical act of starting over forces you to cut everything that was for you and keep only what is for them.
