# Case 02 — Social Media Engagement Report

**Industry:** Media · **Difficulty:** ROOKIE

## The situation

You handle analytics for a media brand with four social accounts. The content
lead is worried:

> "Our engagement rate fell off a cliff in the spring and never recovered. The
> team's morale is low about it. Can you put together a short report on what
> happened and whether we're actually declining?"

## The data

`posts.csv` — one row per post.

| column | notes |
|---|---|
| date, platform, post_type | |
| impressions | how many times it was shown |
| reach | unique accounts reached — **blank for Jan and Feb** (tracking wasn't set up yet) |
| likes, comments, shares | |

## How to approach it

First decide what "engagement rate" even means here — engagement over
impressions, or over reach? Try it both ways.

Then look at *why* the reach column is blank for the first two months, and what
that does to any rate you calculate on `reach`. If early-year rate was computed
on a smaller (or missing) denominator, the "cliff" might not be real.

Rebuild the trend on a basis that's consistent across the whole year. Then say
plainly: is engagement declining, flat, or growing? Break it down by platform
and post type while you're in there — the headline number can hide a real story
underneath (one platform up, one down).

## What to hand back

- one chart of engagement over the year on a consistent basis
- a one-line answer to "are we declining?" with the number behind it
- one thing the content team should actually do differently, backed by the
  platform or post-type breakdown

## Submit

Paste your findings and describe your chart below, then send it to your PM.
