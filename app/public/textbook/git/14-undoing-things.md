# Undoing things: checkout, restore, reset, revert

## The one-sentence version

Git can undo almost anything; the trick is knowing which command matches which "oops", and whether the change has been pushed.

## The golden rule

If a commit has **not** been pushed to a shared branch, you can rewrite it freely. If it **has**, do not rewrite history; use `revert` instead, which undoes by adding a new commit.

## Discard uncommitted changes to a file

```bash
git restore report.sql        # throw away edits, back to last commit
git restore .                  # all files
```

This is destructive and unrecoverable, because the changes were never committed. Be sure.

## Unstage a file

```bash
git restore --staged report.sql   # staged -> modified, contents untouched
```

## Undo the last commit, keep the changes

```bash
git reset --soft HEAD~1     # commit undone, files still staged
git reset HEAD~1            # commit undone, files modified but unstaged
```

Use this when you committed too early or to the wrong branch. Re-commit properly.

## Undo the last commit AND the changes

```bash
git reset --hard HEAD~1     # commit and its changes gone
```

Only safe if not pushed. `--hard` also wipes uncommitted work, so `git status` should be clean first.

## Undo a commit that is already pushed

```bash
git revert abc123           # creates a new commit that reverses abc123
git push
```

History stays intact; you just add "the opposite" of the bad commit. This is the safe, team-friendly undo.

## Go look at an old version without changing anything

```bash
git switch --detach abc123   # HEAD now at that commit, "detached"
# ...look around, run the old query...
git switch main              # back to normal
```

## The safety net: reflog

`git reflog` lists every position HEAD has been in, including commits you "lost" with a bad reset. You can almost always recover:

```bash
git reflog
git reset --hard HEAD@{2}    # jump back to where you were 2 moves ago
```

## Common problems

- **`git reset --hard` and lost work:** check `git reflog`; the commit is probably still there for ~90 days.
- **Reverted a merge commit and it is weird:** merge reverts need `git revert -m 1 <hash>`; ask for help, it is fiddly.
- **Detached HEAD and made commits:** `git branch rescue <hash>` to save them before switching away.

## Try This

Make a commit, then `git reset --soft HEAD~1` and see the changes back in staging. Re-commit. Then `git revert HEAD` and watch it add an "undo" commit. Two different tools for two situations.
