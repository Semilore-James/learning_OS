# Repositories: init and clone

## The one-sentence version

A repository is a project folder that Git is tracking; you create one with `git init` or copy an existing one with `git clone`.

## What a repository is

A repository ("repo") is an ordinary folder with a hidden `.git` subfolder inside it. That `.git` folder holds the entire history: every commit, every branch, every version of every file. Delete `.git` and you have a plain folder again with no history.

Everything you do with Git happens inside a repo.

## Starting a new one: `git init`

```bash
mkdir sales-analysis
cd sales-analysis
git init
```

`git init` creates the `.git` folder. Nothing is tracked yet; you have an empty history and a folder full of untracked files. The next chapters cover how to actually record them.

## Copying an existing one: `git clone`

Most of the time you are joining a project that already exists, usually on GitHub:

```bash
git clone https://github.com/some-org/some-project.git
cd some-project
```

`clone` downloads the full history and puts you on the default branch, ready to work. It also remembers where it came from (called the "origin remote"), so `git push` and `git pull` know where to go later.

## What lives in a repo

Code and text: SQL, Python, notebooks, markdown, small config files. **Not** data files, not credentials, not generated output, not virtual environments. The `.gitignore` chapter covers keeping those out.

A good analyst repo has a `README.md` at the top explaining what the project is, where the data comes from, and how to run it.

## Common problems

- **You ran `git init` in the wrong folder** (e.g. your home directory). Remove the accidental repo with `rm -rf .git` in that folder, then `git init` in the right place.
- **Nested repos:** running `git init` inside a folder that is already in a repo creates a confusing repo-in-a-repo. Check with `git status` before you init.
- **`clone` fails with a permission error:** the repo is private and you are not authenticated. The Remotes chapter covers GitHub auth.

## Try This

Create a folder, `cd` into it, run `git init`, then `git status`. It will tell you there are "no commits yet". That is a healthy empty repo.
