# Commits and commit messages

## The one-sentence version

A commit is a labelled snapshot of your staged files, and the label (the message) is how future-you understands what changed and why.

## Making a commit

```bash
git add report.sql
git commit -m "Fix revenue calc: exclude cancelled orders"
```

`-m` supplies the message inline. Leave it off and Git opens your editor for a longer message.

Each commit gets a unique id (a long hex string called a hash), records the author and time, and points back to the commit before it. That chain of commits is your history.

## What makes a good message

The message is written for someone reading `git log` in six months trying to understand a change. Aim for:

- **A short summary line**, about 50 characters, in the imperative: "Add", "Fix", "Remove", "Refactor", not "Added" or "Fixes".
- **A blank line, then a body** (for anything non-trivial) explaining *why*, not *what*. The diff already shows what changed. The message explains the reason a reader cannot see.

```
Exclude cancelled orders from the monthly revenue query

Finance flagged that March revenue looked ~4% high. Cancelled
orders keep their line items, so SUM(qty * price) was counting
them. Added `WHERE o.status <> 'cancelled'`.
```

Bad messages: "update", "fix", "wip", "asdf", "changes". They tell a future reader nothing.

## How big should a commit be?

One logical change. If you cannot summarise it in one line without "and", it is probably two commits. Small, focused commits make history readable and make it trivial to undo one thing without losing the rest.

## Amending the last commit

Forgot a file, or typo'd the message:

```bash
git add forgotten.sql
git commit --amend -m "Better message"
```

This replaces the last commit. Only do it if you have not pushed it anywhere shared, because it rewrites history.

## Common problems

- **Empty commit / "nothing to commit":** you did not stage anything. `git add` first.
- **Committed to the wrong branch:** the Undoing chapter covers moving a commit.
- **Huge commit touching 40 files:** you batched a week of work. Going forward, commit as you finish each piece.

## Try This

Make three small commits in a practice repo, each a one-line change with a clear imperative message. Then `git log --oneline` and read them back. Would they make sense to a stranger?
