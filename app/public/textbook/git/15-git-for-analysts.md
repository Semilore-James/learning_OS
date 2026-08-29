# Git for analysts: versioning SQL, notebooks, never data

## The one-sentence version

Everything an analyst produces that is text belongs in Git; everything that is data belongs somewhere else.

## What to commit

- **SQL files.** Every query that feeds a report or a dashboard. When a number is questioned, the history of that `.sql` file is your answer.
- **Notebooks** (`.ipynb`), with a caveat below.
- **Python and R scripts.**
- **dbt models, transformation code, pipeline configs.**
- **A `README.md`** explaining what the project is, where the data comes from, and how to run it.
- **A `requirements.txt` or environment file** so someone can reproduce your setup.

## What never to commit

- **Data.** No CSVs, no Excel, no `.parquet`, no database dumps. Data is large, it changes, and it often contains personal information. It lives in cloud storage, a data warehouse, or a database. Your repo has the code that reads it and a note on where it is.
- **Credentials.** Connection strings, API keys, `.env` files, service-account JSON. Use environment variables or a secrets manager, and put the patterns in `.gitignore` on day one.
- **Generated output.** Rendered HTML reports, exported charts, `__pycache__`, `.ipynb_checkpoints`.

A good starter `.gitignore` for an analyst repo:

```
*.csv
*.xlsx
*.parquet
data/
.env
*.pem
__pycache__/
.venv/
.ipynb_checkpoints/
.DS_Store
```

## The notebook problem

Jupyter notebooks store their output (tables, charts, sometimes data) inside the `.ipynb` file as JSON. That means:

- **Every run produces a huge, noisy diff** even if the code did not change.
- **Output can contain data** you did not mean to commit.

Options: clear all outputs before committing (`Kernel to Restart & Clear Output`), use a tool like `nbstripout` to do it automatically, or keep exploratory notebooks out of Git entirely and commit a cleaned-up `.py` version of the analysis that matters.

## A sensible project layout

```
sales-analysis/
  README.md
  requirements.txt
  .gitignore
  sql/
    revenue_by_region.sql
    churn_cohorts.sql
  notebooks/
    01-explore.ipynb        (outputs cleared)
  src/
    load.py
  reports/                  (gitignored, generated)
```

## Why this makes you more hireable

A hiring manager who opens your GitHub sees whether you can be trusted near a production data stack. Clean commits, real messages, no leaked keys, no 200 MB CSV in the history, a README that explains itself. That is the difference between "ran some queries once" and "works like an engineer".

## Try This

Take one analysis you have done — a few queries and a short write-up — and turn it into a proper repo: README, `.gitignore`, `sql/` folder, clean commits with real messages. Push it to GitHub. That is a portfolio piece.
