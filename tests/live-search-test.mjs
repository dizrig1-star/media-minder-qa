import assert from "assert";
import { buildLiveSearchResult, buildEpisodeDropsFromSeason, buildWildcardCandidate } from "../src/lib/liveSearch.mjs";

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

// 5. buildEpisodeDropsFromSeason maps TMDB's /tv/{id}/season/{n} response
// into the same {episode, title, date, time} shape the curated catalog's
// episodeDrops use, so an adopted live series can produce real Calendar
// rows (see fetchSeasonEpisodeDrops, called from main.js at adopt time).
{
  const seasonData = {
    episodes: [
      { episode_number: 1, name: "Pilot", air_date: "2026-08-28" },
      { episode_number: 2, name: "", air_date: "2026-09-04" },
      { episode_number: 3, name: "Not Yet Aired", air_date: null }
    ]
  };
  const drops = buildEpisodeDropsFromSeason(seasonData);
  assert.deepEqual(drops, [
    { episode: 1, title: "Pilot", date: "2026-08-28", time: "" },
    { episode: 2, title: "Episode 2", date: "2026-09-04", time: "" }
  ], "should drop episodes with no air date yet, and fall back to a generic title when TMDB gives none");
}
{
  // No season data at all (fetch failed, or a malformed response) degrades to no drops.
  assert.deepEqual(buildEpisodeDropsFromSeason(null), []);
  assert.deepEqual(buildEpisodeDropsFromSeason({}), []);
}
console.log("PASS -- buildEpisodeDropsFromSeason maps TMDB season data into real Calendar-ready episodeDrops");

// 6. buildWildcardCandidate maps one TMDB discover/recommendations-shaped
// result into our live-item shape, for the Wildcard v2 correlation pool
// (see discoverWildcardCandidates + resolveWildcard in
// recommendationService.js).
{
  const movieResult = { id: 55, title: "Some Correlated Movie", poster_path: "/p.jpg", overview: "A summary.", vote_average: 8.043 };
  const candidate = buildWildcardCandidate(movieResult, "movie");
  assert.equal(candidate.id, "live-movie-55");
  assert.equal(candidate.title, "Some Correlated Movie");
  assert.equal(candidate.type, "movie");
  assert.equal(candidate.poster, "https://image.tmdb.org/t/p/w780/p.jpg");
  assert.equal(candidate.mmRating, 8.0);
  assert.ok(/deliberate wildcard/i.test(candidate.why));
}
{
  const tvResult = { id: 77, name: "Some Correlated Show", poster_path: null, overview: "", vote_average: null };
  const candidate = buildWildcardCandidate(tvResult, "tv");
  assert.equal(candidate.id, "live-tv-77");
  assert.equal(candidate.type, "series");
  assert.equal(candidate.poster, null);
  assert.equal(candidate.mmRating, null);
}
console.log("PASS -- buildWildcardCandidate maps a TMDB recommendations result into the live-item shape");

console.log("LIVE SEARCH LOGIC: PASS");
