# Media Minder Beta QA Runbook

## Purpose

This is the Product Owner's manual QA guide. No technical setup is required.

## 1. First-time user setup

Use a private/incognito browser window so no previous Media Minder state is present.

1. Open the Beta URL.
2. Confirm **FIRST-TIME SETUP** appears.
3. Search for **Lioness**.
4. Select it and rate it **5 stars**.
5. Search for **Reacher**.
6. Select it and rate it **5 stars**.
7. Select **Use these to curate my edition**.
8. Confirm onboarding disappears.
9. Confirm the Watchlist contains the selected shows.
10. Confirm Recommendations reflect the new signals rather than the default Simon profile alone.

### Expected experience

The user should feel that Media Minder learned something useful without requiring a long questionnaire.

## 2. Calendar — CAL-02

For a test profile with:

- Project Runway at Episode 2
- Slow Horses at Episode 2
- The Shards at Episode 4

Calendar must show exactly:

- Project Runway — Episode 3
- Slow Horses — Episode 3
- The Shards — Episode 5

There must be **one row per watchlisted series** and no unrelated titles.

If a watchlist is empty, Calendar should be empty.

## 3. Recommendation calibration

Using Lioness + Reacher at 5 stars, ask:

- Did the recommendations become recognizably more action/espionage/thriller-oriented?
- Did platform signals behave sensibly?
- Did the app still provide variety rather than simply copying the two titles?
- Is the explanation for the recommendation believable?

A bad recommendation is a product-quality issue, not a user error.

## 4. Premiere page

Premieres should show only relevant series/season openers in the next two weeks. Ordinary weekly episodes must not appear.

## 5. Visual QA

Check desktop and narrow/mobile widths for:

- hierarchy
- spacing
- buttons
- search field
- rating controls
- cards
- navigation
- no clipped content

## 6. Pass/fail rule

Simon reports what he sees. Engineering owns diagnosis and implementation. Do not ask the Product Owner to determine the technical cause.

A release candidate requires:

- automated regression green
- synthetic lab green
- first-time setup manual QA pass
- Calendar CAL-02 manual QA pass
- Premiere manual QA pass
- visual QA pass
- no unresolved release blocker
