# VBA: variables, loops, and a small automation

## The one-sentence version

The moment your automation needs to do something a different number of times each run, or make a choice, you stop recording and start writing a few lines of VBA with a variable and a loop.

## What it is

Beyond the recorder: VBA where you declare a variable to hold a value, use `If` to branch, and use a loop to repeat a block once per row (or per sheet, or per file). This is the difference between "replay these exact clicks" and "process whatever is in front of me".

## Why it exists

A recorded macro is rigid: it deletes column C, it sorts rows 2 to 500. Real data has a different number of rows each week, needs different handling per row, or spans a folder of files. To handle "for each row, if the status is X do Y" you need actual code, and it is only about ten lines.

## How it works

**Variables.** Declare with `Dim`, assign with `=`:

```vba
Dim lastRow As Long
Dim total As Double
Dim name As String
lastRow = Cells(Rows.Count, 1).End(xlUp).Row   ' the last filled row in column A
```

`As Long` for whole numbers like row counts, `As Double` for decimals, `As String` for text, `As Range` for a cell or block. Put `Option Explicit` at the top of the module to force every variable to be declared, which catches typos.

**If:**

```vba
If Cells(i, 5).Value < 0 Then
    Cells(i, 6).Value = "check: negative"
ElseIf Cells(i, 4).Value = "" Then
    Cells(i, 6).Value = "check: missing"
End If
```

**Loop over rows** with `For ... Next`:

```vba
Dim i As Long
For i = 2 To lastRow
    Cells(i, 7).Value = Cells(i, 4).Value * Cells(i, 5).Value   ' total = units * price
Next i
```

`Cells(i, 4)` is row `i`, column 4 (column D). The loop runs once per row from 2 to the real last row, so it fits any file size.

**Loop over a collection** with `For Each`:

```vba
Dim ws As Worksheet
For Each ws In ThisWorkbook.Worksheets
    ws.Columns.AutoFit
Next ws
```

**Speed and safety.** At the top of a routine that touches many cells:

```vba
Application.ScreenUpdating = False
Application.Calculation = xlCalculationManual
```

and set them back to `True` / `xlCalculationAutomatic` at the end. This can turn a 30-second macro into a 1-second one. Also test on a copy, because `.Delete` has no undo from a macro.

**Getting values in and out fast:** reading `Cells(i, 4)` in a loop is slow. For big data, read a range into a `Variant` array once, work on the array, write it back once. That is an optimisation to reach for when a loop feels sluggish, not a starting point.

## When you use it

When the row count varies. When each row needs a decision. When you are iterating over sheets or files. When a recorded macro almost does the job but needs "and only if". If you find yourself wanting to say "for each", you have crossed into writing rather than recording.

## A worked example

You want a macro that, for any sales sheet, adds a `flag` column marking every row that fails a basic check.

```vba
Option Explicit

Sub FlagBadRows()
    Dim lastRow As Long, i As Long
    lastRow = Cells(Rows.Count, 1).End(xlUp).Row
    Cells(1, 8).Value = "flag"

    Application.ScreenUpdating = False
    For i = 2 To lastRow
        If Cells(i, 4).Value < 0 Then
            Cells(i, 8).Value = "negative units"
        ElseIf Cells(i, 7).Value <> Cells(i, 4).Value * Cells(i, 5).Value Then
            Cells(i, 8).Value = "total mismatch"
        ElseIf Cells(i, 5).Value = "" Then
            Cells(i, 8).Value = "missing price"
        End If
    Next i
    Application.ScreenUpdating = True

    MsgBox "Checked " & lastRow - 1 & " rows."
End Sub
```

Run it on any sales file and column H fills with flags. The loop adapts to the row count; the `If` chain does the judgement the recorder never could.

> **Try This**
> Write a short macro that loops the rows of a case dataset and writes a check column, using the same defect logic Data Detective tests: impossible dates, negative quantities, totals that do not add up. Run it, then compare its flags to what you would have found by eye.
