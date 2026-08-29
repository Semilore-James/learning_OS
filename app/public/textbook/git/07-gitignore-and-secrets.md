# .gitignore and what not to commit

## The one-sentence version

A `.gitignore` file lists patterns for files Git should pretend do not exist, keeping data, secrets, and junk out of your history for good.

## Why it matters more for analysts

Analyst repos are full of things that must never be committed:

- **Data.** CSVs, Excel files, database dumps, extracts. They are large, they change constantly, and they often contain personal information. Data belongs in cloud storage or a database, not Git.
- **Credentials.** Connection strings, API keys, passwords, `.env` files. Once a secret is in Git history it is compromised, even if you delete it in a later commit, because the old commit still has it.
- **Generated output.** Charts, rendered reports, `__pycache__`, `.ipynb_checkpoints`, virtual environments.

## How it works

Create a file named `.gitignore` at the top of the repo. Each line is a pattern:

```
# data
*.csv
*.xlsx
data/
!data/schema.csv        # but do keep this one

# secrets
.env
*.pem
credentials.json

# python
__pycache__/
.venv/
*.pyc
.ipynb_checkpoints/

# os / editor
.DS_Store
.vscode/
```

`*.csv` ignores every CSV. `data/` ignores a whole folder. A leading `!` un-ignores something. `#` is a comment.

`.gitignore` itself **is** committed, so everyone on the project shares the same rules.

## The catch: it only ignores untracked files

If a file is already tracked, adding it to `.gitignore` does nothing. You have to stop tracking it first:

```bash
git rm --cached secrets.env      # stop tracking, keep the local file
echo "secrets.env" >> .gitignore
git commit -m "Stop tracking secrets.env"
```

The file stays on your disk; Git just forgets it going forward. The old commits still contain it, which is why you should never have committed it.

## If a secret was already committed and pushed

Treat it as leaked. Rotate the key immediately (generate a new one, revoke the old). Cleaning it out of history is possible with `git filter-repo` or the BFG tool, but rotation is the real fix.

## Common problems

- **`.gitignore` "not working":** the file is already tracked. Use `git rm --cached`.
- **You want a starter file:** [github.com/github/gitignore](https://github.com/github/gitignore) has good templates per language.

## Try This

Add a `.gitignore` with `*.csv`, `.env`, and `__pycache__/` to a repo. Create a `test.csv`, run `git status` — it should not appear. That is `.gitignore` doing its job.
