# First-Time User Setup

## Goal

Give a new Media Minder user enough signal to make the first recommendation useful without turning onboarding into a questionnaire.

## Flow

1. The first Home visit presents **Start with what you're already watching**.
2. The user selects a small number of current series.
3. The user rates each selected series from 1–5 stars.
4. Selected shows are added to the Watchlist because they are explicitly current watches.
5. Ratings are persisted locally.
6. Ratings of 4–5 stars seed the existing profile vocabulary: genres, platforms, cast/people and franchises.
7. The existing recommendation engine consumes the resulting profile. There is no separate onboarding recommendation engine.
8. Calendar then shows the next scheduled drop for each selected watchlisted series.

## Cold-start test

The synthetic lab should include a profile with empty preferences and verify that two or three highly-rated current watches create usable signals.

Example: a user selects **Lioness** and **Reacher** and rates both 5 stars. The resulting profile should gain action/espionage/crime/suspense signals and the relevant streaming platforms without asking the user to classify genres manually.

## Scope boundary

This is intentionally not a general-purpose preference editor. Editing a mature profile remains a later concern. The first-time flow exists to establish enough signal for initial curation.
