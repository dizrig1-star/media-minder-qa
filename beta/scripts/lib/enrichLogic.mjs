// Pure merge/rating logic for the TMDB + OMDb catalog enrichment pipeline.
// No network calls happen in this file -- everything here takes already-fetched
// API response objects and returns plain data. That split is what lets
// tests/catalog-enrichment-test.mjs prove the logic is correct using canned
// fixtures, with no API keys or network access required.

// Maps the provider names TMDB returns to the platform ids Media Minder
// already uses in src/data/platforms.json. Anything not in this table is
// left unmapped rather than guessed at.
export const TMDB_PROVIDER_NAME_TO_PLATFORM_ID = {
  "Netflix": "netflix",
  "Amazon Prime Video": "prime",
  "Prime Video": "prime",
  "Apple TV+": "apple",
  "Apple TV Plus": "apple",
  "Disney Plus": "disney",
  "Disney+": "disney",
  "Hulu": "hulu",
  "Max": "max",
  "Paramount Plus": "paramount",
  "Paramount+": "paramount",
  "Peacock": "peacock",
  "Peacock Premium": "peacock"
};

// TMDB search results: { results: [{ id, name|title, first_air_date|release_date, ... }] }
// Picks the entry whose title matches and whose year is closest to the one we
// already have on file (if we have one). Falls back to the first result.
export function pickBestTmdbMatch(searchResults, title, year){
  const results = searchResults?.results || [];
  if(!results.length) return null;
  const normalizedTitle = title.trim().toLowerCase();
  const exact = results.filter(r => (r.name || r.title || "").trim().toLowerCase() === normalizedTitle);
  const pool = exact.length ? exact : results;
  if(!year || pool.length === 1) return pool[0];
  let best = pool[0];
  let bestDiff = Infinity;
  for(const r of pool){
    const dateStr = r.first_air_date || r.release_date;
    if(!dateStr) continue;
    const y = parseInt(dateStr.slice(0,4), 10);
    const diff = Math.abs(y - year);
    if(diff < bestDiff){ bestDiff = diff; best = r; }
  }
  return best;
}

// TMDB watch/providers: { results: { US: { link, flatrate: [{provider_name,...}], ... } } }
// Returns { platform, link } or null if nothing usable is found for the region.
// Note: TMDB's per-region "link" is a single JustWatch page listing every
// provider for that title, not a deep link into one specific platform -- it's
// only used as a fallback when we don't already have a curated deep link.
export function buildProviderInfo(watchProvidersResponse, region = "US"){
  const regionData = watchProvidersResponse?.results?.[region];
  if(!regionData) return null;
  const flatrate = regionData.flatrate || [];
  for(const provider of flatrate){
    const platformId = TMDB_PROVIDER_NAME_TO_PLATFORM_ID[provider.provider_name];
    if(platformId) return { platform: platformId, link: regionData.link || null };
  }
  return null;
}

// OMDb "Ratings": [{ Source: "Rotten Tomatoes", Value: "92%" }, ...]
export function extractRottenTomatoesPercent(omdbData){
  const entry = (omdbData?.Ratings || []).find(r => r.Source === "Rotten Tomatoes");
  if(!entry) return null;
  const match = /(\d+)%/.exec(entry.Value || "");
  return match ? parseInt(match[1], 10) : null;
}

export function extractImdbRating(omdbData){
  const value = parseFloat(omdbData?.imdbRating);
  return Number.isFinite(value) ? value : null;
}

// Blends IMDb (0-10) and Rotten Tomatoes (0-100, converted to 0-10) into a
// single Media Minder rating. If only one source is available, use it alone
// rather than dropping the rating entirely.
export function computeMMRating(imdbRating, rottenTomatoesPercent){
  const imdb = Number.isFinite(imdbRating) ? imdbRating : null;
  const rt = Number.isFinite(rottenTomatoesPercent) ? rottenTomatoesPercent / 10 : null;
  if(imdb === null && rt === null) return null;
  if(imdb !== null && rt !== null) return Math.round(((imdb + rt) / 2) * 10) / 10;
  return Math.round((imdb !== null ? imdb : rt) * 10) / 10;
}

// The core merge: takes one existing catalog entry plus the raw TMDB/OMDb API
// responses fetched for it, and returns an updated entry. Only touches
// artwork, platform/link, and the new rating fields -- title, genre, cast,
// summary, why, episodes, episodeDrops, franchises, mmSelect and every other
// hand-curated editorial field are passed through untouched.
export function mergeEnrichment(existingEntry, { tmdbDetails, tmdbProviders, omdbData } = {}, region = "US"){
  const updated = { ...existingEntry };

  if(tmdbDetails?.poster_path){
    updated.poster = `https://image.tmdb.org/t/p/w780${tmdbDetails.poster_path}`;
  }

  const providerInfo = buildProviderInfo(tmdbProviders, region);
  if(providerInfo){
    updated.platform = providerInfo.platform;
    if(!existingEntry.link && providerInfo.link){
      updated.link = providerInfo.link;
    }
  }

  const imdbRating = extractImdbRating(omdbData);
  const rtPercent = extractRottenTomatoesPercent(omdbData);
  const mmRating = computeMMRating(imdbRating, rtPercent);
  if(mmRating !== null){
    updated.mmRating = mmRating;
    updated.ratingSources = { imdb: imdbRating, rottenTomatoes: rtPercent };
  }

  return updated;
}
