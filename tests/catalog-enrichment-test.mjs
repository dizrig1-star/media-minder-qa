import assert from "assert";
import {
  pickBestTmdbMatch,
  buildProviderInfo,
  extractRottenTomatoesPercent,
  extractImdbRating,
  computeMMRating,
  mergeEnrichment
} from "../src/lib/enrichLogic.mjs";

// This test exercises the enrichment pipeline's merge/rating logic against
// canned TMDB/OMDb-shaped fixtures. It makes no network calls and needs no
// API keys, so it runs in the normal test suite on every commit -- the actual
// network-calling script (scripts/enrich-catalog.mjs) is exercised separately,
// manually or via the weekly GitHub Actions workflow, where real keys exist.

// 1. pickBestTmdbMatch prefers an exact title match closest to the known year.
{
  const searchResults = {
    results: [
      { id: 100, name: "The Thomas Crown Affair", first_air_date: "1968-06-19" },
      { id: 200, name: "The Thomas Crown Affair", first_air_date: "1999-08-06" },
      { id: 300, name: "Some Other Show", first_air_date: "2020-01-01" }
    ]
  };
  const match = pickBestTmdbMatch(searchResults, "The Thomas Crown Affair", 1999);
  assert.equal(match.id, 200, "should pick the 1999 exact-title match closest to the given year");
}
{
  const match = pickBestTmdbMatch({ results: [] }, "Nothing Found", 2020);
  assert.equal(match, null, "should return null when there are no search results");
}
console.log("PASS -- pickBestTmdbMatch picks the closest exact-title match, and handles no results");

// 2. buildProviderInfo maps TMDB provider names to our platform ids, and only
//    trusts flatrate (subscription) providers, never rental/buy tiers.
{
  const providers = {
    results: {
      US: {
        link: "https://www.themoviedb.org/tv/123/watch?locale=US",
        flatrate: [{ provider_name: "Hulu" }, { provider_name: "Some Rando Service" }]
      }
    }
  };
  const info = buildProviderInfo(providers, "US");
  assert.deepEqual(info, { platform: "hulu", link: providers.results.US.link });
}
{
  // No US region data at all (e.g. broadcast-only network show) -> null, caller must keep existing platform.
  const info = buildProviderInfo({ results: {} }, "US");
  assert.equal(info, null, "should return null when the region has no provider data");
}
console.log("PASS -- buildProviderInfo maps known flatrate providers and returns null when nothing usable is found");

// 3. OMDb rating extraction.
{
  const omdbData = {
    imdbRating: "7.8",
    Ratings: [
      { Source: "Internet Movie Database", Value: "7.8/10" },
      { Source: "Rotten Tomatoes", Value: "92%" },
      { Source: "Metacritic", Value: "70/100" }
    ]
  };
  assert.equal(extractRottenTomatoesPercent(omdbData), 92);
  assert.equal(extractImdbRating(omdbData), 7.8);
}
{
  assert.equal(extractRottenTomatoesPercent({}), null);
  assert.equal(extractImdbRating({ imdbRating: "N/A" }), null);
}
console.log("PASS -- OMDb rating extraction handles both present and missing data");

// 4. computeMMRating blends both sources, or falls back to whichever exists.
{
  assert.equal(computeMMRating(7.8, 92), 8.5, "average of 7.8 and 9.2 is 8.5");
  assert.equal(computeMMRating(7.8, null), 7.8, "IMDb only");
  assert.equal(computeMMRating(null, 60), 6, "Rotten Tomatoes only");
  assert.equal(computeMMRating(null, null), null, "neither source available");
}
console.log("PASS -- computeMMRating blends both sources and degrades gracefully when one is missing");

// 5. mergeEnrichment only touches artwork/platform/link/rating fields, and
//    never overwrites a curated link or platform that TMDB can't confirm.
{
  const existingEntry = {
    id: "doc-s3",
    poster: "https://images.justwatch.com/poster/old.jpg",
    title: "Doc",
    type: "series",
    platform: "hulu",
    genre: ["Medical Drama"],
    mmSelect: "Silver",
    cast: ["Molly Parker"],
    summary: "A hand-written editorial summary.",
    why: "A hand-written editorial reason.",
    episodes: 3,
    episodeDrops: [{ episode: 1, title: "E1", date: "2026-09-01", time: "9:00 PM" }]
  };
  const fixture = {
    tmdbDetails: { poster_path: "/newposter.jpg", imdb_id: "tt1234567" },
    tmdbProviders: { results: { US: { link: "https://tmdb.example/watch", flatrate: [{ provider_name: "Hulu" }] } } },
    omdbData: { imdbRating: "7.5", Ratings: [{ Source: "Rotten Tomatoes", Value: "88%" }] }
  };
  const merged = mergeEnrichment(existingEntry, fixture, "US");

  assert.equal(merged.poster, "https://image.tmdb.org/t/p/w780/newposter.jpg", "poster should refresh from TMDB");
  assert.equal(merged.platform, "hulu", "platform is unchanged -- it was already curated as hulu");
  assert.equal(merged.link, "https://tmdb.example/watch", "link should fill in since the entry had none");
  assert.equal(merged.mmRating, Math.round(((7.5 + 8.8) / 2) * 10) / 10, "mmRating should blend IMDb and RT");
  assert.deepEqual(merged.ratingSources, { imdb: 7.5, rottenTomatoes: 88 });

  // Untouched editorial fields must be byte-identical to the original.
  for(const field of ["title","type","genre","mmSelect","cast","summary","why","episodes","episodeDrops"]){
    assert.deepEqual(merged[field], existingEntry[field], `${field} must not be modified by enrichment`);
  }
}
{
  // Existing curated link must never be overwritten, even if TMDB has a link.
  const existingEntry = { id: "x", platform: "apple", link: "https://tv.apple.com/curated-deep-link" };
  const fixture = {
    tmdbProviders: { results: { US: { link: "https://tmdb.example/watch", flatrate: [{ provider_name: "Apple TV+" }] } } }
  };
  const merged = mergeEnrichment(existingEntry, fixture, "US");
  assert.equal(merged.link, "https://tv.apple.com/curated-deep-link", "curated link must survive enrichment");
}
{
  // Broadcast-only show with no TMDB flatrate match keeps its curated platform.
  const existingEntry = { id: "dwts-s35", platform: "abc" };
  const fixture = { tmdbProviders: { results: {} } };
  const merged = mergeEnrichment(existingEntry, fixture, "US");
  assert.equal(merged.platform, "abc", "platform must be preserved when TMDB has no confirmed match");
}
{
  // Even a *confirmed* flatrate match must never override a curated platform.
  // Found via a real run: TMDB listed "Prime Video" for Lioness and Project
  // Runway, both of which are actually exclusive to Paramount+/other homes --
  // TMDB can't tell a native listing apart from a resold add-on channel, so a
  // match here is not trustworthy enough to overwrite verified data.
  const existingEntry = { id: "lioness-s3", platform: "paramount" };
  const fixture = {
    tmdbProviders: { results: { US: { link: "https://tmdb.example/watch", flatrate: [{ provider_name: "Prime Video" }] } } }
  };
  const merged = mergeEnrichment(existingEntry, fixture, "US");
  assert.equal(merged.platform, "paramount", "a confirmed TMDB match must not override an already-curated platform");
}
{
  // Platform SHOULD be filled in when the entry doesn't have one yet at all
  // (e.g. a brand-new title the pipeline discovers with no curated platform).
  const existingEntry = { id: "brand-new-title" };
  const fixture = {
    tmdbProviders: { results: { US: { link: "https://tmdb.example/watch", flatrate: [{ provider_name: "Netflix" }] } } }
  };
  const merged = mergeEnrichment(existingEntry, fixture, "US");
  assert.equal(merged.platform, "netflix", "platform should be filled in when there was no curated value at all");
}
console.log("PASS -- mergeEnrichment only refreshes artwork/rating always, and platform/link only when not already curated");

console.log("CATALOG ENRICHMENT LOGIC: PASS");
