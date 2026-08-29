# Resolving merge conflicts

## The one-sentence version

A conflict happens when two branches changed the same lines, and Git asks you to decide which version wins.

## Why they happen

Git merges automatically when changes are in different places. It cannot when two branches edited the *same* lines of the *same* file, because it has no way to know which is right. So it stops, marks the file, and hands it to you.

This is normal. It is not a mistake or a disaster. On an active team you will resolve conflicts regularly.

## What it looks like

```bash
git merge main
# Auto-merging report.sql
# CONFLICT (content): Merge conflict in report.sql
# Automatic merge failed; fix conflicts and then commit the result.
```

Open the file. Git has inserted markers:

```
<<<<<<< HEAD
WHERE o.status = 'completed'
=======
WHERE o.status <> 'cancelled'
>>>>>>> main
```

- Between `<<<<<<< HEAD` and `=======` is **your** version (the branch you are on).
- Between `=======` and `>>>>>>> main` is **their** version (the branch you are merging in).

## Resolving it

Edit the file so it says what you actually want. Sometimes that is one side, sometimes the other, sometimes a combination. Delete all three marker lines. The file should end up as valid, correct code with no `<<<`, `===`, or `>>>` left.

```sql
WHERE o.status = 'completed'   -- decided: completed is the right filter here
```

Then:

```bash
git add report.sql       # tell Git this file is resolved
git status                # check for other conflicted files
git merge --continue     # or: git commit
```

## Tooling

`git status` lists every conflicted file. Most editors (VS Code especially) show conflicts with "Accept Current / Accept Incoming / Accept Both" buttons, which is faster than editing markers by hand. `git mergetool` opens a configured three-way diff tool.

## Bailing out

Made a mess, want to start over:

```bash
git merge --abort
```

Back to before the merge, as if it never happened.

## Avoiding them

- Keep branches short-lived and small. A branch open for three weeks will conflict with everything.
- Pull `main` into your branch often, so you resolve small conflicts as you go instead of one huge one at the end.
- Do not reformat a whole file while also making a real change; the reformat causes conflicts that hide the real edit.

## Try This

Deliberately cause one: on `main`, edit line 1 of a file and commit. On a branch from an earlier point, edit line 1 differently and commit. Merge, resolve the markers, `git add`, commit. Now you have done it once and it will never scare you again.
