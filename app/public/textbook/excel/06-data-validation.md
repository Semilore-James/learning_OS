# Data validation

## The one-sentence version

Data validation restricts what a cell will accept, which stops bad data getting in rather than making you clean it out later.

## What it is

Select cells, go to Data, Data Validation, and set a rule: a value must be a whole number, a date in a range, a decimal, a length, or one of a list. You can also write a custom formula the entry must satisfy. Excel rejects anything that fails, with a message you choose.

## Why it exists

Every hour spent cleaning a dataset is partly an hour paying for the moment nobody put a rule on the input. A cell that should be a percentage between 0 and 1 gets a `50` typed into it. A region column gets `West`, `west`, `W`, and `Westt`. A date column gets `31/13/2024`. Validation is the cheap fix: catch it at entry, when the person can still correct it, instead of at analysis, when you have to guess what they meant.

## How it works

**A dropdown list** is the most common use. Data Validation, Allow: List, Source: either type `Open,Won,Lost` or point at a range like `=Settings!$A$2:$A$5`. Now that cell is a dropdown and free text is refused. This alone eliminates most category-spelling messes.

**Number and date ranges:** Allow: Whole number, between 1 and 100. Allow: Date, greater than `=TODAY()-365`. Allow: Decimal, between 0 and 1 for a rate.

**Custom formula** is the powerful option. Allow: Custom, and a formula that must return TRUE for the entry to stick:

- No duplicates in a column: `=COUNTIF($A:$A, A2)=1`
- Must be a valid email-ish string: `=ISNUMBER(SEARCH("@", A2))`
- Total must not exceed a budget cell: `=SUM($B$2:$B$100)<=Budget`

**The input message and error alert** are worth setting. Input message: a tooltip shown when the cell is selected ("enter as a decimal, e.g. 0.15"). Error alert: what pops up on a bad entry. Set the style to "Stop" to block it, "Warning" to allow with a confirm, "Information" to just note it.

**Circle invalid data:** Data Validation, Circle Invalid Data draws red rings around cells that break the rule, including ones entered before you added it. "Clear Validation Circles" removes them. This is a fast audit of an existing column.

**The limit:** validation only checks values typed into the cell. Pasting can bypass it in some versions, and it does not re-check when a referenced cell changes. It is a front door lock, not a guarantee.

## When you use it

Any sheet other people fill in: a tracker, an intake form, a data-entry template. Any column with a fixed set of allowed categories. Any place a wrong value would be expensive to catch later.

## A worked example

You are handing a weekly-numbers template to five regional managers. Column B is `region` (should be one of four), column C is `deals_closed` (a non-negative whole number), column D is `close_date` (this quarter only).

Set B to a List from your four region names. Set C to Whole number, greater than or equal to 0. Set D to Date, between the quarter start and end. Add input messages. When a manager fat-fingers `-3` deals or picks the wrong region, Excel stops them, and your Monday consolidation has nothing to clean.

> **Try This**
> Take a case dataset with a messy category column. Build a clean dropdown list from its correct values, apply it, then use "Circle Invalid Data" to see every row that would not have passed.
