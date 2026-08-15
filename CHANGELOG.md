# Media Minder Changelog

## 1.0.10
- Corrected Project Runway genre metadata from Historical Drama to Reality Competition.
- Made the 14-day Premiere window explicit.
- Made the Premiere relevance threshold explicit and reused the shared recommendation scorer.
- Added regression coverage preventing Project Runway from passing Premieres relevance solely because of the bad genre tag.


## 1.0.9
- Coordinated Calendar and Premieres schedule/state correction.
- Calendar now emits exactly one next episode per watchlisted series.
- Premieres now shows only relevant series/season openers within the next two weeks.
- Excludes ordinary weekly episodes and already-opened seasons from Premieres.
- Added shared schedule selectors and regression coverage for CAL-02 and PREMIERES-01.

# Changelog

## 1.0.0-beta.1
- Consolidated Media Minder into a single multi-file repository.
- Implemented shared application shell, router, state, components and data model.
- Implemented approved screens and core beta interactions.
- Applied the approved Atomic Age / broadcast-inspired visual language.

\n## 1.0.0-beta.2
- Completed focused Brand Art pass.
- Refined MM logo with broadcast test-pattern negative space.
- Added cohesive MM Select Gold, Silver and Bronze artwork.
- Applied MM Select artwork to existing recommendation components.

## 1.0.0
- Media Minder v1.0 released.
- Beta-certified and UAT-approved.
- Final focused brand-art pass incorporated.
- Release scope frozen according to the Design Bible.
- Deferred enhancements remain in the Projection Room.

## 1.0.2
- Fixed GitHub Pages asset paths for the MM logo and MM Select artwork.
- Hardened primary navigation and landing-page CTAs with native hash links.

## 1.0.3
- Fixed Tonight and Recommendations route rendering argument mismatch.
- Hardened application-shell routing.

## 1.0.5
- Corrected local viewing-state normalization and episode-progress presentation.
- Calendar now excludes episode drops already completed by the user.
- Search now includes franchise connections, including Andor via Star Wars.
- Preserved local beta state across the correction pass.

## 1.0.6
- Corrected Calendar to derive upcoming drops from persisted episode progress.
- Added complete future episode schedules for catalog series.
- Hardened Search to match title, cast, genre, summary, and franchise connections using tokenized queries.
- Bumped release metadata to 1.0.6.

## 1.0.7
- Fixed CAL-02: Calendar is now limited to titles on the user watchlist.
- Added regression coverage for empty and multi-title watchlists, including next-drop calculation after episode progress.


## 1.0.9
- Corrected CAL-02 at the Calendar data-pipeline level.
- Calendar now resolves only known watchlist titles before generating events.
- Calendar now shows only the next relevant episode drop for each watchlisted title.
- Unknown/stale watchlist IDs are ignored safely.
- Added explicit regression coverage proving non-watchlisted titles cannot appear.
- Added GitHub Pages module cache-busting metadata for the 1.0.9 release.

## 1.0.11
- Finalized CAL-02 personalized Calendar behavior: one next drop per watchlisted series.
- Finalized PREMIERES-01: 14-day window, shared recommendation relevance scoring, and opener-only filtering.
- Corrected Project Runway genre metadata to `Reality Competition`.
- Fixed release cache-busting/version metadata so GitHub Pages cannot retain the prior 1.0.9 Calendar/main module references.
- Added regression coverage for release-version consistency.
