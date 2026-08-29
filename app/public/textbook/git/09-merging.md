# Merging

## The one-sentence version

Merging takes the commits from one branch and brings them into another, usually your feature branch back into `main`.

## The command

```bash
git switch main
git pull                     # make sure main is current
git merge add-cohort-report  # bring the branch's commits into main
```

Git combines the two histories. If nothing on `main` changed the same lines your branch changed, this "just works" and you get a new **merge commit** that ties the two lines together.

## Fast-forward vs merge commit

If `main` has not moved since you branched, Git can just slide the `main` label forward to your branch's tip. This is a **fast-forward** merge; there is no merge commit, and history stays linear.

If `main` did move (someone else merged something), Git makes a merge commit with two parents. Both are normal; the merge commit is not a problem.

Some teams prefer to keep history linear and use `git rebase` instead of merge for feature branches. Rebasing replays your commits on top of the latest `main`. It produces a cleaner log but rewrites your branch's commits, so never rebase a branch someone else is working on.

## Where merging happens in practice

Most of the time you do not run `git merge` yourself. You push your branch, open a **pull request** on GitHub, and click "Merge" there after review. GitHub runs the merge for you. The Pull Requests chapter covers this. Knowing the underlying command still matters for local work and for understanding what the button does.

## After a merge

```bash
git branch -d add-cohort-report   # local branch, now merged
git push origin --delete add-cohort-report   # the remote one too
```

Delete merged branches. A repo with 50 stale branches is noise.

## Common problems

- **Merge conflict:** Git stops and asks you to resolve overlapping changes by hand. This is common and fine; the next chapter is entirely about it.
- **"Already up to date":** the branch has nothing new, or you already merged it.
- **You merged the wrong branch:** if you have not pushed, `git reset --hard HEAD~1` undoes the merge commit (Undoing chapter).

## Try This

Create a branch, add a commit, switch to `main`, and `git merge` it. Run `git log --oneline --graph` to see how the two lines joined.
