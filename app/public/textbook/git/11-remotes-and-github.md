# Remotes and GitHub

## The one-sentence version

A remote is a copy of your repo hosted somewhere else (almost always GitHub), and it is how you back up your work and share it.

## What a remote is

Your repo lives on your laptop. A **remote** is a linked copy on a server. `git push` sends your commits there; `git pull` brings down commits others added. The default remote is named `origin`.

When you `git clone`, `origin` is set up automatically. When you `git init` locally, you add it yourself:

```bash
git remote add origin https://github.com/yourname/sales-analysis.git
git remote -v            # show configured remotes
```

## GitHub

GitHub is a website that hosts Git repos and adds collaboration on top: pull requests, issues, reviews, a profile page. For an analyst it is also your portfolio. A public GitHub with three or four clean, documented projects is a strong signal to a hiring manager.

Create a repo on GitHub first (the "New repository" button), then link and push:

```bash
git remote add origin https://github.com/yourname/sales-analysis.git
git push -u origin main
```

`-u` sets `origin/main` as the default for this branch, so future `git push` and `git pull` need no arguments.

## Authentication

GitHub no longer accepts your account password on the command line. Two options:

- **Personal access token (HTTPS):** on GitHub, Settings to Developer settings to Personal access tokens. Generate one, and use it as the password when Git prompts. A credential manager (installed with Git on Windows and Mac) remembers it.
- **SSH key:** generate a key pair (`ssh-keygen -t ed25519`), add the public key to GitHub, and clone with the `git@github.com:...` URL. No prompts after setup.

SSH is the smoother long-term choice.

## Common problems

- **`remote origin already exists`:** you added it twice. `git remote set-url origin <url>` to change it, or `git remote remove origin` first.
- **`Authentication failed`:** you used your password instead of a token, or the token expired or lacks `repo` scope.
- **`Repository not found`:** wrong URL, or the repo is private and you are not authorised.

## Try This

Create an empty repo on GitHub, then locally: `git init`, make a commit, `git remote add origin <url>`, `git push -u origin main`. Refresh the GitHub page — your files are there.
