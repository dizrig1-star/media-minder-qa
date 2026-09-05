import assert from "assert";

// appState (src/app/state.js) reads/writes localStorage at module load and
// on every action, so a minimal in-memory shim is needed to run it under
// plain Node -- same approach used for manual verification throughout this
// project, just promoted here into the real suite.
const store = {};
global.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const { appState, hydrateLocalState } = await import("../src/app/state.js");
const { getPersonalizedCalendarRows } = await import("../src/services/scheduleService.js");

// 1. adoptLiveResult must match an existing curated catalog entry by title
// rather than create a duplicate. Found via a real case: "Last Seen" is
// fully curated (real episodeDrops) but also turns up in live search --
// adopting the live copy as a new entry silently duplicated it with no
// episodeDrops, so it could never appear on Calendar even though the real
// entry could.
{
  hydrateLocalState();
  appState.set({
    shows: [{
      id: "last-seen", type: "series", title: "Last Seen", platform: "apple",
      episodeDrops: [{ episode: 1, title: "Season Premiere", date: "2026-09-09", time: "3:00 AM" }]
    }],
    movies: [], watchlist: [], adoptedTitles: []
  });

  const liveDupe = {
    id: "live-tv-99999", title: "Last Seen", type: "series", poster: null,
    platform: "apple", link: null, genre: ["Thriller"], cast: [],
    summary: "", why: "Found via live search -- not yet part of your curated library.",
    mmRating: null, ratingSources: null, isLiveResult: true
  };
  appState.adoptLiveResult(liveDupe);

  assert.deepEqual(appState.get().watchlist, ["last-seen"],
    "should watchlist the existing curated entry's id, not the live result's id");
  assert.ok(!appState.get().shows.some(s => s.id === "live-tv-99999"),
    "should not create a duplicate catalog entry when a title match exists");
  const rows = getPersonalizedCalendarRows(appState.get());
  assert.ok(rows.some(r => r.show.id === "last-seen"),
    "the real curated entry (with episodeDrops) should now produce a Calendar row");
}
console.log("PASS -- adoptLiveResult matches an existing curated title instead of creating a worse-data duplicate");

// 2. adoptLiveResult still adopts as a new entry when nothing matches (e.g.
// a title with no curated equivalent at all, like "Dark Matter").
{
  hydrateLocalState();
  appState.set({ shows: [], movies: [], watchlist: [], adoptedTitles: [] });
  const liveOnly = {
    id: "live-tv-1", title: "Something Not In The Catalog", type: "series",
    poster: null, platform: null, link: null, genre: [], cast: [],
    summary: "", why: "x", mmRating: null, ratingSources: null, isLiveResult: true
  };
  appState.adoptLiveResult(liveOnly);
  assert.deepEqual(appState.get().watchlist, ["live-tv-1"]);
  assert.ok(appState.get().shows.some(s => s.id === "live-tv-1"));
}
console.log("PASS -- adoptLiveResult still creates a new entry when no curated title matches");

// 3. Marking a title watched or not-for-me drops it from the Watchlist
// (regression coverage for the fix that shipped without a dedicated test).
{
  hydrateLocalState();
  appState.set({
    shows: [{ id: "s1", type: "series", title: "S1" }],
    movies: [{ id: "m1", type: "movie", title: "M1" }],
    watchlist: ["s1", "m1"], watched: [], notInterested: []
  });
  appState.toggleWatched("m1");
  assert.ok(!appState.get().watchlist.includes("m1"), "marking watched should remove it from Watchlist");
  appState.toggleNotInterested("s1");
  assert.ok(!appState.get().watchlist.includes("s1"), "marking not-for-me should remove it from Watchlist");
  // Undo (un-marking) should not silently re-add it to the Watchlist.
  appState.toggleWatched("m1");
  assert.ok(!appState.get().watchlist.includes("m1"), "un-marking watched should not resurrect the Watchlist entry");
}
console.log("PASS -- marking watched/not-for-me removes a title from the Watchlist, without silent undo re-adds");
