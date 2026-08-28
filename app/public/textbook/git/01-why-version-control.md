# Why version control exists

## The one-sentence version

Version control is a tool that remembers every version of your work, who changed what and when, and lets several people work on the same files without overwriting each other.

## The problem it solves

You have seen the folder. `analysis.sql`, `analysis_v2.sql`, `analysis_final.sql`, `analysis_final_ACTUAL.sql`, `analysis_final_use_this_one.sql`. Nobody knows which is current. Nobody knows what changed between them. If two people edited `analysis_v2.sql` on the same day, one person's work is gone.

Version control (the tool almost everyone uses is called Git) fixes this by keeping one file, `analysis.sql`, and remembering its full history separately. Every time you reach a point worth saving, you make a "commit": a labelled snapshot of all your files. The history is a list of these snapshots, each with a message, an author, and a timestamp.

## Why an analyst needs it, not just software engineers

Three reasons.

**Your SQL and notebooks are code, and code benefits from history.** When a dashboard number looks wrong, "what changed in the query last week" is often the fastest path to the cause. With version control that is one command. Without it, it is archaeology.

**Portfolio work lives on GitHub.** GitHub is a website that hosts Git histories. When you apply for analyst roles, a GitHub profile with a few clean, documented projects is worth more than a line on a CV. You cannot put work on GitHub without using Git.

**Collaboration.** The moment a second person touches your project, you need a way to merge their changes with yours safely. Git is that way. It is the standard, on every data team.

## What it does not do

Version control is for text: SQL, Python, notebooks, markdown, configuration. It is **not** for data files. You do not commit a 2 GB CSV or a database dump. Those go in cloud storage or a database, and your repository holds the code that reads them. The chapter on `.gitignore` covers exactly what to keep out and why.

## The mental model

Picture a timeline. Each dot is a commit, a saved state of your whole project. You can walk back to any dot to see the project exactly as it was then. You can start a side branch from a dot, try something, and either merge it back or throw it away without touching the main line. That is the whole idea. Everything else is commands for moving around that timeline.

> **Try This**
> Open the Toolkit window, find the Git entry, and install Git plus create a free GitHub account. The next chapter assumes you can run `git --version` in a terminal.
