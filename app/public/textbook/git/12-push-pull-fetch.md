# push, pull, fetch

## The one-sentence version

`push` sends your commits up, `fetch` downloads theirs without touching your files, and `pull` is fetch plus merge.

## push

```bash
git push                     # once -u is set
git push -u origin my-branch  # first push of a new branch
```

`push` uploads commits on your current branch to the remote. It only works if the remote branch has not moved ahead of you. If it has, Git rejects the push and tells you to pull first.

Never `git push --force` on a shared branch. It overwrites the remote history and can erase a colleague's commits. `--force-with-lease` is a safer variant if you truly need to force-push your own feature branch.

## fetch

```bash
git fetch
```

`fetch` downloads new commits and branch pointers from the remote into your local copy, but **does not change your working files or your current branch**. After a fetch you can inspect what is new:

```bash
git fetch
git log --oneline main..origin/main   # commits on the remote you do not have
```

Then merge when you are ready. `fetch` is the cautious way to see what changed before integrating it.

## pull

```bash
git pull
```

`pull` is `fetch` followed by `merge` of the matching remote branch into your current one, in a single step. Convenient, but it can drop you into a merge conflict without warning, so many people prefer `fetch` then `merge` (or `rebase`) so they see what is coming first.

## The daily rhythm

```bash
git switch main
git pull                 # start the day current
git switch -c todays-task
# ...work, commit...
git push -u origin todays-task
# ...pull request, merge on GitHub...
git switch main
git pull                 # bring the merge down
```

## Common problems

- **`push` rejected, "fetch first" / "non-fast-forward":** the remote moved. `git pull` (resolve any conflict), then `git push`.
- **`pull` created a surprise merge commit:** that is normal when both sides moved. Configure `git config --global pull.ff only` if you want it to refuse instead and make you choose.
- **Detached HEAD after messing with fetch:** `git switch main` to get back to a branch.

## Try This

Make a commit on GitHub directly (edit a file in the web UI). Locally, `git fetch` then `git log main..origin/main` to see it listed, then `git pull` to bring it in.
