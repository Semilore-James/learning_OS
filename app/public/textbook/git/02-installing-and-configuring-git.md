# Installing Git and first-run config

## The one-sentence version

Install Git for your operating system, then set your name and email once so every commit you make is stamped with who you are.

## Installing

- **Windows:** download from [git-scm.com](https://git-scm.com/download/win). The installer includes "Git Bash", a terminal that behaves the same as one on Mac or Linux. Accept the defaults except one: when asked about the default editor, pick something you know (VS Code if you have it).
- **macOS:** run `git --version` in Terminal. If Git is missing, macOS offers to install the developer tools. Or use Homebrew: `brew install git`.
- **Linux:** `sudo apt install git` (Debian/Ubuntu) or `sudo dnf install git` (Fedora).

Check it worked:

```bash
git --version
```

## First-run config

Git records an author on every commit. Set it once, globally, and you never think about it again:

```bash
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
```

Use the same email you will use on GitHub, so your commits link to your profile.

Two more settings worth doing now:

```bash
git config --global init.defaultBranch main       # name the first branch "main", not "master"
git config --global pull.rebase false              # a sane default for merging on pull
```

See everything you have set:

```bash
git config --global --list
```

## Line endings (Windows only, but important)

Windows and Mac/Linux end lines of text differently. Without a setting, a file can look "changed" to Git the moment someone on the other OS touches it. Fix it:

```bash
# Windows
git config --global core.autocrlf true
# Mac / Linux
git config --global core.autocrlf input
```

## Common problems

- **`git` is not recognised (Windows):** the installer did not add Git to your PATH. Re-run it and choose "Git from the command line and also from 3rd-party software", or just use Git Bash.
- **Commits show the wrong author:** you set `user.email` after making commits, or set it per-repo. Check with `git config user.email` inside the repo.

## Try This

Run the four config commands with your real name and GitHub email, then `git config --global --list` to confirm. You are done with setup for good.
