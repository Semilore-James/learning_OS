# The staging area (git add)

## The one-sentence version

The staging area is a holding zone where you assemble exactly the changes you want in your next commit, using `git add`.

## Why there is a middle step

Other tools save everything at once. Git makes you pick. Between "files I have changed" and "the commit I am about to make" sits the staging area (also called the "index"). You move changes into it with `git add`, and `git commit` records whatever is staged, nothing more.

This sounds like extra work. It is what lets you make clean, focused commits: you edited three files while fixing one bug and drafting an unrelated note, and you can commit just the bug fix.

## The three states of a file

Run `git status` constantly. It shows files in one of three buckets:

- **Untracked:** Git has never seen this file.
- **Modified (not staged):** tracked, and changed since the last commit, but not added.
- **Staged:** added, and ready to be committed.

```bash
git add report.sql            # stage one file
git add sql/                   # stage everything in a folder
git add .                      # stage everything changed, from here down
git add -p                     # step through each change and choose (powerful)
```

## Unstaging

You staged something by mistake:

```bash
git restore --staged report.sql   # move it back to "modified, not staged"
```

The file's contents are untouched; only its staged status changes.

## `git add -p` is worth learning

`-p` (patch mode) walks you through your changes hunk by hunk and asks `Stage this hunk? [y,n,s,q,...]`. It is how you split one messy editing session into several sensible commits. `s` splits a hunk into smaller pieces.

## Common problems

- **"I committed and my changes are not in it":** you forgot to `git add` first. `git commit` only records staged changes.
- **You accidentally `git add`ed a huge data file:** `git restore --staged bigfile.csv`, then add it to `.gitignore` so it does not happen again.
- **`git add .` staged files you did not want:** this is why `.gitignore` matters. Set it up early.

## Try This

In a repo, create a file, run `git status` (it is untracked), `git add` it, `git status` again (it is staged), then `git restore --staged` it (back to untracked). Watch the buckets change.
