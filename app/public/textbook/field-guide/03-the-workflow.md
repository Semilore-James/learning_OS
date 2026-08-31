# The workflow, start to finish

## The one-sentence version

Every piece of analysis you will ever do follows the same seven steps, and knowing them means you always know what to do next even when the problem is unfamiliar.

## The seven steps

1. **Frame.** Turn the request into a precise question with a shape (see the previous chapter). Write it as a sentence. Confirm it with whoever asked, out loud or in a message, before you touch data.
2. **Locate.** Find the data that would answer it. Which tables, which file, which system. If it does not exist, say so now, not in three days.
3. **Extract.** Pull it. Usually a SQL query against the warehouse; sometimes an export or a download. Pull a little more context than you think you need, a little less history than the whole table.
4. **Clean.** Fix what is wrong: types, duplicates, blanks, inconsistent categories, impossible values. Write it as code so it is repeatable and you can show your work.
5. **Analyse.** Do the actual computation. For most questions this is a group-by, a rate, a trend, or a comparison. Simpler than beginners expect.
6. **Check.** Is the answer real? Right order of magnitude? Robust to how you sliced it? Not driven by one outlier or a tiny sample? Reconcile against a number someone already trusts.
7. **Communicate.** One or two sentences a busy person can act on, and one chart that makes the point in three seconds. State your confidence and the one caveat that matters.

## Where the time goes

Not evenly. A rough split for a typical mid-size question:

- Framing: 10% (but it sets the direction for the other 90%)
- Locating and extracting: 15%
- Cleaning: 35%
- Analysing: 15%
- Checking: 15%
- Communicating: 10%

Beginners expect the analysis to be the big block. It is the small one. Cleaning is the big one, and framing is the one that, done badly, wastes all the others.

## The loop inside the loop

Steps 5 and 6 usually cycle a few times. You compute something, check it, notice it looks wrong, realise a cleaning step was off or the question needs a tweak, go back. That is normal. The danger is skipping step 6 entirely because the first number looked plausible.

## The move

When you feel stuck, name which of the seven steps you are on. Stuck framing means you need to talk to the requester. Stuck locating means you need to ask where the data lives. Stuck cleaning means slow down and go column by column. Stuck communicating means you have not found the one sentence yet, so keep looking. Naming the step tells you what to do.
