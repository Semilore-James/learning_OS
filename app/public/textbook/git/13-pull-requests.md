# Pull requests and review

## The one-sentence version

A pull request (PR) is a proposal on GitHub to merge your branch into `main`, with a place for teammates to comment before it lands.

## The flow

```bash
git switch -c add-churn-report
# ...work, commit, commit...
git push -u origin add-churn-report
```

GitHub prints a link, or you click "Compare & pull request" on the repo page. You write a title and description, pick a reviewer, and open it. The PR shows every commit and the full diff.

Reviewers leave comments on specific lines. You respond, push more commits (they appear on the PR automatically), and once someone approves, you click **Merge**. GitHub does the merge; then you delete the branch.

## Writing a PR description

A reviewer should be able to understand the change without reading your mind:

- **What** the change does, in a sentence or two.
- **Why** — the ticket, the bug, the request.
- **How to check it** — the query to run, the number that should now be right, a screenshot of the chart.
- Anything you are unsure about, so the reviewer looks there.

## Being a good reviewer

When it is your turn to review someone else's PR:

- Check the logic, not just the style. Does this query actually answer the question? Are the joins right? Is a filter missing?
- Run it if you can.
- Be specific and kind. "This LEFT JOIN could drop customers with no orders — was that intended?" beats "wrong".
- Approve when it is good enough, not perfect. Nits can be follow-ups.

## Why analysts should care

Review catches the mistakes that cost trust: the off-by-one in a date filter, the double-counting join, the metric defined three different ways. A second pair of eyes on a query before it feeds a dashboard is cheap insurance. It is also how you learn the team's conventions fast.

## Common problems

- **PR shows unrelated changes:** your branch is behind `main`. `git switch add-churn-report`, `git merge main`, resolve, push.
- **Merge conflicts on the PR:** GitHub shows a "Resolve conflicts" button for simple cases, or resolve locally and push.
- **CI checks failing:** the repo runs automated checks (lint, tests). Read the log, fix, push.

## Try This

On a repo you own: branch, commit a small change, push, open a PR against yourself, write a proper description, then merge it and delete the branch. That is the full loop.
