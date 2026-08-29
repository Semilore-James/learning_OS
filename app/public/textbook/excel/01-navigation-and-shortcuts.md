# Navigation and keyboard shortcuts

## The one-sentence version

Learning to move around a spreadsheet without the mouse is the single biggest speed-up available to a new analyst, because you do it thousands of times a day.

## What it is

A spreadsheet is a grid: columns are letters, rows are numbers, and every cell has an address like `C4`. A range is a block of cells written as `C4:F20`. Navigation is how you move the selection around that grid and how you jump to the parts that matter without scrolling.

## Why it exists

The mouse is fine for one click. It is terrible for the hundredth. An analyst who reaches for the mouse to select a column of 10,000 rows, or to find the bottom of the data, or to copy a formula down, loses a few seconds each time, and does it all day. The people who look fast at Excel are not smarter. They stopped using the mouse for the repetitive parts.

## How it works

**Moving one cell:** arrow keys.

**Jumping to the edge of a block:** `Ctrl` + arrow. From a cell inside your data, `Ctrl+Down` lands on the last filled row, `Ctrl+Right` on the last filled column. This is how you find the size of a dataset in half a second.

**Selecting while you jump:** add `Shift`. `Ctrl+Shift+Down` selects from the current cell to the bottom of the column. `Ctrl+Shift+End` selects everything from here to the bottom-right corner of the used area. This is how you grab a whole column or the whole table.

**Home and corners:** `Ctrl+Home` goes to `A1`. `Ctrl+End` goes to the last used cell (useful for spotting stray data far below what you thought was the end).

**The essential edits:**

| Shortcut | Does |
|---|---|
| `Ctrl+C` / `Ctrl+V` / `Ctrl+X` | copy / paste / cut |
| `Ctrl+Z` / `Ctrl+Y` | undo / redo |
| `Ctrl+Shift+V` (or Paste Special) | paste values only, no formulas or formatting |
| `F2` | edit the active cell, cursor at the end |
| `Ctrl+;` | insert today's date as a static value |
| `Alt+=` | AutoSum the range above or to the left |
| `Ctrl+Shift+L` | toggle filters on the current table |
| `Ctrl+T` | turn the range into a structured Table |
| `Ctrl+PageUp` / `Ctrl+PageDown` | previous / next worksheet tab |

**Fill down a formula:** select the cell with the formula plus the range below it, then `Ctrl+D`. Or double-click the small square at the bottom-right of the cell (the fill handle) and it fills to match the length of the column next to it.

**The `Alt` key opens the ribbon by letters.** Press `Alt` and Excel shows a letter over each ribbon tab. This is slower to learn but it means every menu command has a keyboard path once you know it. Google Sheets does not have this, but it has its own menu-search: press `Alt+/` (or the menu key) and type what you want.

## When you use it

Constantly, and invisibly. There is no task where this does not apply. The goal is that within a week you never scroll to find the end of your data and never drag-select a long column.

## A worked example

You open a file. You do not know how big it is. Press `Ctrl+End`: the selection jumps to `H4012`. So the data is 8 columns wide and about 4,000 rows. Press `Ctrl+Home` to go back to `A1`. Click any cell in column A, press `Ctrl+Shift+Down`, and you have the whole column selected, ready to check for blanks or paste into a formula. Total time: three seconds, no scrolling.

> **Try This**
> Open any case dataset. Without touching the mouse, find how many rows and columns it has, select the entire first column, then jump back to A1. Then in Case 01 (Retail Sales Audit), navigate the till data this way while you look for what stands out.
