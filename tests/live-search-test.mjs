import assert from "assert";
import { buildLiveSearchResult } from "../src/lib/liveSearch.mjs";

// Exercises buildLiveSearchResult against canned TMDB/OMDb-shaped fixtures --
// no network calls, no API keys needed, so this runs in the normal test suite
// on every commit. The real network-calling liveSearch() is exercised
// manually in the browser, where a real TMDB/OMDb key exists in localStorage.

// 1. A movie result assembles poster, genre, cast, and a blended rating.
{
  const searchHit = { id: 42, media_type: "movie", title: "Some Horror Movie" };
  const tmdbDetails = {
    poster_path: "/poster.jpg",
    imdb_id: "tt9999999",
    genres: [{ name: "Horror" }, { name: "Thriller" }],
    credits: { cast: [{ name: "Actor One" }, { name: "Actor Two" }, { name: "Actor Three" }, { name: "Actor Four" }] }
  };
  const tmdbProviders = { results: { US: { link: "https://tmdb.example/watch", flatrate: [{ provider_name: "Netflix" }] } } };
  const omdbData = { imdbRating: "6.5", Ratings: [{ Source: "Rotten Tomatoes", Value: "80%" }] };

  const result = buildLiveSearchResult(searchHit, tmdbDetails, tmdbProviders, omdbData, "US");

  assert.equal(result.id, "live-movie-42");
  assert.equal(result.title, "Some Horror Movie");
  assert.equal(result.type, "movie");
  assert.equal(result.poster, "https://image.tmdb.org/t/p/w780/poster.jpg");
  assert.equal(result.platform, "netflix");
  assert.equal(result.link, "https://tmdb.example/watch");
  assert.deepEqual(result.genre, ["Horror", "Thriller"]);
  assert.deepEqual(result.cast, ["Actor One", "Actor Two", "Actor Three"], "cast should cap at 3 names");
  assert.equal(result.mmRating, Math.round(((6.5 + 8) / 2) * 10) / 10);
  assert.deepEqual(result.ratingSources, { imdb: 6.5, rottenTomatoes: 80 });
  assert.equal(result.isLiveResult, true);
  assert.ok(result.why.length > 0, "should carry a disclosure note instead of editorial copy");
}
console.log("PASS -- buildLiveSearchResult assembles a full movie result from TMDB + OMDb fixtures");

// 2. A TV result with no confirmed platform and no OMDb match still renders
//    safely -- platform/link/mmRating are null rather than guessed at.
{
  const searchHit = { id: 7, media_type: "tv", name: "Some Obscure Show" };
  const tmdbDetails = { poster_path: null, genres: [], credits: { cast: [] } };
  const tmdbProviders = { results: {} };
  const omdbData = null;

  const result = buildLiveSearchResult(searchHit, tmdbDetails, tmdbProviders, omdbData, "US");

  assert.equal(result.id, "live-tv-7");
  assert.equal(result.type, "series");
  assert.equal(result.poster, null);
  assert.equal(result.platform, null);
  assert.equal(result.link, null);
  assert.equal(result.mmRating, null);
  assert.equal(result.ratingSources, null);
}
console.log("PASS -- buildLiveSearchResult degrades gracefully with no provider or rating data");

// 3. Titles are never left blank even if TMDB's search hit is missing fields.
{
  const searchHit = { id: 1, media_type: "movie" };
  const tmdbDetails = { title: "Fallback Title From Details" };
  const result = buildLiveSearchResult(searchHit, tmdbDetails, { results: {} }, null, "US");
  assert.equal(result.title, "Fallback Title From Details");
}
console.log("PASS -- buildLiveSearchResult falls back to TMDB details title when the search hit has none");

// 4. A series result carries the current season number + that season's
// episode count (from TMDB's already-fetched tv details), so Watchlist's
// Progress tracker can show "Season X - Episode Y of Z" once adopted --
// found missing when "Dark Matter" was added to the Watchlist and showed
// no season info at all.
{
  const searchHit = { id: 88, media_type: "tv", name: "Some Returning Show" };
  const tmdbDetails = {
    genres: [], credits: { cast: [] },
    seasons: [
      { season_number: 0, episode_count: 3 },
      { season_number: 1, episode_count: 9 },
      { season_number: 2, episode_count: 8 }
    ]
  };
  const result = buildLiveSearchResult(searchHit, tmdbDetails, { results: {} }, null, "US");
  assert.equal(result.season, 2, "should use the latest real season, excluding season 0 (Specials)");
  assert.equal(result.episodes, 8, "should use that season's own episode count, not the series total");
}
{
  // A movie must never carry season/episodes fields.
  const searchHit = { id: 89, media_type: "movie", title: "Some Movie" };
  const tmdbDetails = { genres: [], credits: { cast: [] }, seasons: [{ season_number: 1, episode_count: 9 }] };
  const result = buildLiveSearchResult(searchHit, tmdbDetails, { results: {} }, null, "US");
  assert.equal(result.season, undefined);
  assert.equal(result.episodes, undefined);
}
{
  // No seasons data at all (e.g. a brand-new show TMDB hasn't backfilled yet) degrades safely.
  const searchHit = { id: 90, media_type: "tv", name: "Some Brand New Show" };
  const tmdbDetails = { genres: [], credits: { cast: [] } };
  const result = buildLiveSearchResult(searchHit, tmdbDetails, { results: {} }, null, "US");
  assert.equal(result.season, undefined);
  assert.equal(result.episodes, undefined);
}
console.log("PASS -- buildLiveSearchResult carries current season/episode count for series, from data already fetched");

console.log("LIVE SEARCH LOGIC: PASS");
