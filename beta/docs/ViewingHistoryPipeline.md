# Viewing History Pipeline — Scope for the Recap Feature

Confidence: high on the problem statement and data model; medium on exact recap content, since that's a product call, not a technical one.

## Why this is needed

`My Reviews` already promises this: *"Your next quarterly edition will collect the highlights of the last 13 weeks."* Nothing behind that copy exists yet. I checked the app's entire state model (`src/app/state.js`) and confirmed the gap precisely:

Every piece of viewing data Media Minder keeps today is a **current-value snapshot**, not a history:

- `ratings: {itemId: number}` — the rating right now, not when it was given
- `progress: {itemId: episode}` — the furthest episode reached, not a log of episodes watched
- `watched: [id, id, ...]` — movies marked watched, no date
- `watchlist` / `notInterested` — same, no date

There is no timestamp anywhere in the data model. A recap ("here's what you watched this quarter") is fundamentally a question about *time* — and right now the app has no memory of when anything happened, only where things currently stand. This can't be computed retroactively from what's stored; it has to start being captured going forward.

## Proposed data model: an event log

Add one new piece of state, additive and non-breaking:

```js
viewingEvents: [
  { id: "evt_...", itemId: "the-shards", type: "rating", value: 5, at: "2026-08-30T14:22:00.000Z" },
  { id: "evt_...", itemId: "the-shards", type: "progress", value: 4, at: "2026-08-30T14:25:00.000Z" },
  { id: "evt_...", itemId: "sinners",    type: "watched",  value: true, at: "2026-08-29T20:10:00.000Z" }
]
```

Four event types cover everything the app already tracks: `rating`, `progress`, `watched`, `watchlist`. Each entry is small (under 150 bytes as JSON). At realistic beta usage — a handful of ratings and episode updates a week, across a few family members' own browsers — this is on the order of a few hundred events a year, nowhere close to a size concern for `localStorage`.

## Where it hooks in

`state.js`'s action methods are the only place viewing data ever changes, so they're the only place that needs a one-line addition each:

- `rate(id, rating)` → append a `rating` event
- `setProgress(id, episode)` → append a `progress` event
- `toggleWatched(id)` → append a `watched` event
- `toggleWatchlist(id)` → append a `watchlist` event

No page component needs to change. This is entirely a state-layer addition.

## Retention

The app's copy already commits to "the last 13 weeks," so that's the natural retention window: prune events older than 91 days each time a new one is appended. This keeps the log small forever without needing a backend job, and matches what's already promised in the UI.

## What the recap could show

Once a quarter of real events has accumulated, `My Reviews` gets a real "Looking Back" section built from the log rather than a placeholder line. Grounded in data the catalog already has (genre, platform, runtime, mmSelect tier):

- Titles rated this quarter, highest first
- Genre mix (most-watched genre this quarter, by count of progress/watched events)
- Platform mix (where the viewing happened)
- Total episodes advanced and movies marked watched
- Highest-rated pick of the quarter, called out the way the Home hero card already does

None of this needs new catalog data — it's all derivable from cross-referencing the event log against the existing `shows.json` / `movies.json` fields.

## Phased plan

1. **Phase 1 (small, safe, ships now):** add the event log to `state.js`, start capturing silently. No visible change to the app. This is the part that can't be delayed — every week without it is a week of history permanently lost.
2. **Phase 2 (after ~1 quarter of real data exists):** build the actual `My Reviews` recap section reading from the log.

Phase 1 is worth doing soon regardless of when Phase 2 ships, since the data only becomes useful once enough of it exists — starting later just delays the first real recap by that much longer.

## Risks / open questions

- **Device-bound:** `localStorage` doesn't sync across devices or browsers. If you (or a family member) use the app from more than one browser, each keeps its own separate history. Worth knowing, not necessarily worth solving for a friends & family beta.
- **No backfill:** anything watched/rated before Phase 1 ships has no history — the first recap will only reflect activity from the day this goes in.
- **Retention is a product choice, not just a technical one:** 13 weeks is what the copy already promises, but if you'd rather keep a longer history (e.g., a "year in review" later), that changes the pruning window. Easy to adjust, just flagging it's a decision rather than a default I should assume.

## Recommendation

Ship Phase 1 now — it's small, low-risk, and every day it's delayed is data that can never be recovered. Hold Phase 2 (the actual recap UI) until there's enough real history to make it worth looking at, and revisit the retention window question at that point.
