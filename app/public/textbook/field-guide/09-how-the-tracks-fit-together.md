# How the tracks fit together

## The one-sentence version

The constellation map is not a random list of skills; it is the analyst's workflow laid out as a path, and knowing the path tells you what to learn next and why.

## The three zones

The map is split into three clusters, and they mirror the workflow from chapter 3.

**Foundations** (bottom-left). The instruments. Excel, SQL, Python, Statistics. These are what you compute *with*. SQL is the deep track because it is what you will use most: extracting and shaping data from a warehouse is the daily work.

**Analysis** (centre). Turning raw data into an answer. Data Cleaning (the 80% nobody shows on a slide), Data Visualization (making the chart the argument), Power BI (going from a one-off to something a team refreshes). This is where a pull becomes a finding.

**Output** (top-right). Getting someone to act. Git (keeping and sharing your work, proving you did it), Storytelling with Data (the finding is worthless if the room does not move), the Portfolio (the thing you show an employer).

## The order is not strict, but it is not arbitrary

You can jump around. But the prerequisites encode real dependencies:

- Statistics builds on Python because you will run tests in code.
- Visualization builds on Data Cleaning because you cannot chart data you have not fixed.
- Storytelling builds on Visualization because a narrative is made of charts.
- Power BI builds on Visualization because a dashboard is charts plus a refresh schedule.

Follow the bright nodes and you are following a sequence that means something.

## SQL is the spine

If you learn one thing deeply, make it SQL. Every other track assumes you can get the data. A strong SQL analyst who is average at everything else is employable. A brilliant statistician who cannot write a join is not, because they cannot start.

## The cases are the reason each skill exists

The map is the skill tree. The Case Files are why you climb it. You learn `GROUP BY` because Case 04 needs it. You learn cohort SQL because Case 15 is a retention analysis. The book teaches the mechanic; the case makes you use it on a real, messy problem with a story buried in it.

## The games drill the reflexes

Data Detective trains you to spot the row that does not belong. Chart Critiquer trains you to see when a chart is working you. Pivot Puzzle trains the group-by-in-your-head instinct. SQL Dojo drills query patterns until they are automatic. These are the batting cage; the cases are the game.

## The move

Do not try to complete tracks in order like a course. Pick the next bright node, read its chapter, then immediately do the case or game it points at. Skill without a scenario does not stick. The map is there so that when you finish something, you can see the two or three things it just unlocked and pick one.
