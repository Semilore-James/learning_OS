# Setting up: Jupyter and VS Code

## The one-sentence version

Install Python once, get a place to run notebooks and a place to run scripts, and learn which one to use for which kind of work.

## What it is

Two things to set up:

1. **A Python installation** with the data libraries. The easiest path is to install pip packages into a virtual environment, or to use a distribution like Anaconda / Miniconda that bundles them.
2. **An editor.** For analysts, that is **Jupyter** (notebooks) and/or **VS Code** (which runs both notebooks and scripts).

## Why it exists

You need somewhere to type code and see results. A notebook shows output cell by cell as you go, which fits the "load it, look at it, try something, look again" rhythm of analysis. A script editor is for when the analysis is settled and you want a file that runs top to bottom the same way every time. Both matter; most analysts live mostly in notebooks and graduate the finished pipeline to a script.

## How it works

**Install.** From a terminal:

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install pandas numpy matplotlib seaborn jupyterlab
```

A **virtual environment** (`.venv`) is a project-local set of packages, so different projects can have different versions without fighting. Activate it before you work; you will see `(.venv)` in the prompt.

If terminals and pip feel like too much, install **Miniconda**, then `conda create -n analysis python pandas numpy matplotlib seaborn jupyterlab` and `conda activate analysis`. Same idea, different manager.

**Run a notebook.** `jupyter lab` opens a browser tab. Make a new notebook. A notebook is a list of **cells**; type code in one, press `Shift+Enter` to run it and move to the next. Output (a table, a chart, a number) appears right under the cell. Variables persist between cells, so cell 3 can use what cell 1 loaded.

**Run a script.** Make `analysis.py`, write code, run `python analysis.py`. Everything runs once, top to bottom. No inline output unless you `print()`.

**VS Code** does both: install the Python and Jupyter extensions, open a folder, and you can run `.py` files with a click and open `.ipynb` notebooks in the same window. Many analysts settle here because it is one tool for exploring and shipping.

**The one habit that saves you:** at the top of every notebook, an imports cell:

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
```

Run it first, always.

## When you use it

Notebook: exploring a new dataset, trying transformations, building a chart, anything where you want to see each step. Script: a pipeline that runs on a schedule or that someone else will run, where "it does the same thing every time" matters.

## A worked example

You are handed a messy CSV. Open a notebook. Cell 1: imports. Cell 2: `df = pd.read_csv("file.csv")`. Cell 3: `df.head()` and `df.info()` to see what you have. Cells 4 onward: one transformation each, checking the result after each. When the cleaning is settled, copy the working cells into `clean_file.py` so it can be run again without you.

> **Try This**
> Set up an environment, install the libraries, open a notebook, and run the imports cell plus `pd.__version__`. If that prints a version number, you are ready.
