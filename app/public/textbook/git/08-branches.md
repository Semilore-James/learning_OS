# Branches

## The one-sentence version

A branch is a movable label pointing at a commit, letting you work on a change in isolation without touching the main line until it is ready.

## The idea

Your history is a chain of commits. `main` is a label on the latest one. A branch is just another label. When you create `feature-x` and commit on it, `feature-x` moves forward while `main` stays put. Your work-in-progress never destabilises `main`.

When the change is done and reviewed, you merge it back (next chapter).

## The commands

```bash
git branch                       # list branches, * marks the current one
git switch -c fix-revenue-calc   # create a branch and move onto it
git switch main                  # move back to main
git branch -d fix-revenue-calc   # delete a branch (after merging)
```

(`git checkout -b` and `git checkout` do the same as `switch -c` and `switch`; `switch` is the newer, clearer name.)

Your uncommitted changes come with you when you switch, unless they conflict with the branch you are moving to. Commit or stash before switching if things get messy.

## The normal workflow

```bash
git switch main
git pull                          # start from the latest main
git switch -c add-cohort-report   # branch for this piece of work
# ...edit, git add, git commit... repeat...
git push -u origin add-cohort-report
# open a pull request, get review, merge
git switch main
git pull
git branch -d add-cohort-report   # clean up
```

One branch per task. Keep branches short-lived — a day or two, not a month — so merges stay small.

## Naming

Use a short, descriptive, hyphenated name: `fix-null-region`, `add-q3-dashboard`, `refactor-revenue-cte`. Some teams prefix with a type or a ticket number (`feat/`, `bug/`, `DATA-214-`). Follow whatever the team does.

## Common problems

- **"Your local changes would be overwritten by checkout":** you have uncommitted work that clashes. Commit it, or `git stash`, then switch.
- **Committed on `main` by accident:** create a branch from where you are (`git switch -c my-work`), then reset `main` back (the Undoing chapter).
- **Dozens of stale branches:** delete merged ones. `git branch --merged` lists the safe-to-delete ones.

## Try This

On a repo: `git switch -c experiment`, make a commit, `git switch main`, `git log --oneline` — your commit is not there. Switch back to `experiment` and it reappears. That is isolation.
