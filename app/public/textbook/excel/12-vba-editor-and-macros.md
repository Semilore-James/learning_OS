# VBA: the editor, recording and running macros

## The one-sentence version

A macro is a recorded sequence of Excel actions you can replay with one click, and VBA is the code that recording produces, which you can read and edit.

## What it is

VBA (Visual Basic for Applications) is a programming language built into Excel. The Macro Recorder watches what you do (select this, format that, sort this column) and writes the equivalent VBA into a module. You then run that module to repeat all those actions instantly. The code lives in the Visual Basic Editor, opened with `Alt+F11`.

## Why it exists

Some Excel tasks are a fixed ten-step ritual you do every week: import the file, delete two columns, format the headers, add a total row, save as PDF. Doing it by hand is slow and easy to get subtly wrong. A macro does the exact same steps the exact same way in a second. It is automation for the parts of the job that are mechanical.

## How it works

**Enable it.** VBA and the Developer tab are off by default. File, Options, Customize Ribbon, tick Developer. To run macros the file must be saved as `.xlsm` (macro-enabled), and Excel will warn on open that it contains macros.

**Record one.** Developer, Record Macro. Give it a name (no spaces), optionally a shortcut key. Do your steps. Developer, Stop Recording. That is it, the macro exists.

**Run it.** Developer, Macros, select it, Run. Or the shortcut key. Or put a button on the sheet: Developer, Insert, Button, and assign the macro.

**Read what it recorded.** `Alt+F11` opens the editor. In the Project pane on the left, expand Modules, double-click `Module1`. You will see something like:

```vba
Sub CleanExport()
    Columns("C:C").Delete
    Range("A1:F1").Font.Bold = True
    Range("A2").Select
    Selection.Sort Key1:=Range("B2"), Order1:=xlAscending, Header:=xlYes
End Sub
```

`Sub CleanExport()` ... `End Sub` is the macro. Each line is one action. `Columns`, `Range`, `Selection` are the objects; `.Delete`, `.Font.Bold`, `.Sort` are what you do to them.

**The recorder's habits, and how to fix them:** it records `.Select` then acts on `Selection`, which is slower and fragile. `Range("A2").Select` then `Selection.Value = 1` is better written as `Range("A2").Value = 1`. It also records absolute cell addresses, so a macro recorded on `C:C` always deletes column C even if the layout changed. You clean these up by editing the code, which is the next chapter.

**Relative recording:** Developer, Use Relative References (toggle it before recording) makes the macro record moves relative to the starting cell instead of fixed addresses. Useful for "do this to whatever row I am on".

**Where macros live:** in the workbook (`.xlsm`) for macros specific to that file, or in the Personal Macro Workbook (`PERSONAL.XLSB`, a hidden file that opens with Excel) for macros you want available everywhere.

## When you use it

A repeated, mechanical, multi-step task with a fixed shape. Formatting an export the same way every week. Generating the same three sheets from a template. Anything where you would write yourself a checklist of Excel clicks. If the task involves judgement or changes each time, a macro is the wrong tool.

## A worked example

Every Monday you get `sales_export.csv`, and every Monday you: delete columns A and D, bold row 1, freeze the top row, sort by date, and save as `.xlsx`.

Record a macro doing exactly that once. Name it `PrepSalesExport`. Assign it `Ctrl+Shift+P`. Next Monday, open the CSV, press the shortcut, done in a second. Then open the editor and read the five lines it wrote, so you understand what it will do and can fix it if the export format changes.

> **Try This**
> Record a macro that takes a raw case CSV and applies your standard first-pass formatting (bold headers, freeze panes, autofit columns, add filters). Run it on a second case file. Then open `Alt+F11` and read the code it generated.
