/* ============================================================================
   The first-run mission. One tiny real analysis loop: read a short brief,
   notice one thing, tell the PM, get a reply. Kept self-contained so it works
   with the AI route down (cannedReply is the fallback).
   ========================================================================== */

export const FIRST_MISSION = {
  title: "Your first case",
  brief:
    "Northwind runs four corner shops. Head office pulled last Saturday's sales " +
    "and wants to know if anything looks off before the weekly review. That's it. " +
    "One glance, one flag, move on.",
  columns: ["Store", "Customers", "Sales", "Sales / customer"],
  rows: [
    ["Ikeja", "180", "£2,700", "£15.00"],
    ["Yaba", "165", "£2,560", "£15.52"],
    ["Lekki", "172", "£2,640", "£15.35"],
    ["Surulere", "158", "£1,180", "£7.47"],
  ],
  /** what a good first observation is in the neighbourhood of */
  hint: "Compare the last column across the four stores.",
  placeholder: "One thing you notice about this table",
  /** offline fallback when the PM route is unreachable or rate-limited */
  cannedReply:
    "Surulere's sales per customer is half everyone else's, same footfall. That's " +
    "the flag. Could be discounting off the books, a broken till, or staff ringing " +
    "sales through their own accounts. You don't know which yet, and you don't have " +
    "to. You noticed the number that doesn't fit. That's the whole job on repeat. " +
    "Case Files has twenty of these, longer and messier. Go.",
} as const;
