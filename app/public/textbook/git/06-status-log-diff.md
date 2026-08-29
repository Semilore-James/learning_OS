# Inspecting history: status, log, diff

## The one-sentence version

`git status` shows where you are now, `git log` shows what happened before, and `git diff` shows exactly what changed.

## `git status` — your compass

Run it before and after almost every Git command. It tells you the current branch, which files are staged, modified, and untracked, and whether you are ahead of or behind the remote.

```bash
git status
git status -s       # short format, one line per file
```

If you are ever unsure what state your repo is in, `git status` is the answer.

## `git log` — the history

```bash
git log                          # full, newest first
git log --oneline                # one line per commit (use this most)
git log --oneline --graph        # with a visual branch diagram
git log --oneline -10            # last 10
git log --author="Ada"           # by a person
git log --since="2 weeks ago"    # by time
git log -- report.sql            # only commits that touched this file
git log -p -- report.sql         # ...with the diff for each
```

That last one is gold when a number looks wrong: "show me every change to this query, with what changed each time".

## `git diff` — what changed

```bash
git diff                 # modified but not staged
git diff --staged        # staged, i.e. what your next commit will contain
git diff HEAD            # everything since the last commit
git diff main feature-x  # between two branches
git diff abc123 def456   # between two commits
```

Reading a diff: lines starting `-` were removed, lines starting `+` were added. A change is shown as a remove plus an add.

## Finding when something broke

```bash
git log -S "cancelled"       # commits that added or removed the word "cancelled"
git blame report.sql          # who last changed each line, and in which commit
```

`git blame` is not about blame; it is "which commit should I go read to understand this line".

## Common problems

- **`git log` opens a pager you cannot exit:** press `q`.
- **Too much output:** always start with `--oneline`.
- **`git diff` shows nothing after you edited a file:** you already staged it. Try `git diff --staged`.

## Try This

In a repo with a few commits: `git log --oneline`, pick a file, run `git log -p -- <file>` and read one change. Then edit the file and run `git diff` to see your uncommitted change.
