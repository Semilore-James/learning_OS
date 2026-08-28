# What a data analyst actually does

## The one-sentence version

A data analyst turns a vague business worry into a specific question, answers it with data, and tells someone what to do about the answer.

## The job is not "know the tools"

You will learn SQL, spreadsheets, a bit of Python, a BI tool, some statistics. Those are the instruments. The job is what you play with them.

The job, most days, is this loop:

1. **Someone is worried about something.** "Churn feels high." "The campaign underperformed." "We do not know which region to expand into."
2. **You make the worry precise.** What does "high" mean, compared to what, over what period? A worry you cannot measure is not a question yet.
3. **You find the data** that would answer it, usually by writing SQL against the company's database, sometimes by pulling a file or an export.
4. **You clean it,** because it is never clean. Dates in three formats, a customer counted twice, a region left blank.
5. **You do the actual analysis,** which is often simpler than beginners expect: a well-chosen group-by, a rate, a trend, a comparison.
6. **You check whether the answer is real** or an artifact of a small sample, an outlier, or how you sliced it.
7. **You say what it means** in one or two sentences a busy person can act on, with a chart that makes the point in three seconds.

Steps 2 and 7 are where good analysts separate from average ones, and they involve no code at all.

## Why this framing matters for how you learn

If you treat this as "learn SQL, then learn Python, then get a job", you will spend months on syntax and still freeze the first time a manager says "the numbers look off, can you look into it?"

So every skill in this OS is tied to a real scenario in the Case Files. You learn `GROUP BY` because Case 04 needs it, not because it is chapter 6. The constellation map is the skill tree; the case files are the reason each skill exists.

## What "competence" looks like

You are competent when you can take a one-line request, ask the two or three clarifying questions that sharpen it, pull and clean the data without hand-holding, produce an answer you would stake your name on, and explain it to someone who does not care how you got it.

That is the target. Everything here is built to grind you toward it.
