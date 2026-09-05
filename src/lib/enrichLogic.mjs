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
// Returns { platform, link } or null if nothing usable is found for the
// region, or if the result is ambiguous (see below).
// Note: TMDB's per-region "link" is a single JustWatch page listing every
// provider for that title, not a deep link into one specific platform -- it's
// only used as a fallback when we don't already have a curated deep link.
//
// Two known-unreliable shapes in TMDB's flatrate list, found from a real
// live-search "Dark Matter" (Apple TV+ Original) case that surfaced "prime"
// instead of "apple":
// 1. Resold/bundled access shows up as its own flatrate entry, named after
//    the storefront it's resold through -- e.g. "Apple TV Plus Amazon
//    Channel" for an Apple Original a Prime member can add as a channel.
//    That's Amazon acting as a storefront, not Amazon being the home
//    platform, so any "<X> Channel" entry is dropped before matching.
// 2. Even after dropping those, a title can carry more than one genuinely
//    direct flatrate listing at once (e.g. a limited-time promotional
//    window on a second service). With no signal for which one is the
//    actual home, guessing either one risks being confidently wrong --
//    same failure mode mergeEnrichment's comment below already documents
//    for the curated catalog. If more than one distinct platform maps here,
//    this returns null (unconfirmed) rather than picking one.
export function buildProviderInfo(watchProvidersResponse, region = "US"){
  const regionData = watchProvidersResponse?.results?.[region];
  if(!regionData) return null;
  const flatrate = regionData.flatrate || [];
  const direct = flatrate.filter(p => !/channel/i.test(p.provider_name || ""));
  const mappedIds = [...new Set(
    direct.map(p => TMDB_PROVIDER_NAME_TO_PLATFORM_ID[p.provider_name]).filter(Boolean)
  )];
  if(mappedIds.length === 1) return { platform: mappedIds[0], link: regionData.link || null };
  if(mappedIds.length > 1) return null;
  // Nothing usable among direct listings -- fall back to a resold/channel
  // entry rather than nothing, same as before this fix (still better than
  // no platform at all, and less likely to be ambiguous in practice).
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

  // Only fill in platform/link when we don't already have a curated value --
  // never overwrite one. TMDB's flatrate list doesn't distinguish a title's
  // native home from an add-on "channel" subscription resold through another
  // platform (e.g. Paramount+ sold via Amazon Channels can surface as plain
  // "Prime Video" with no way to tell the two apart), so a confirmed match
  // here is not reliable enough to override data we already verified by
  // hand. This was found and fixed after the first live run reassigned
  // Lioness and Project Runway to "prime" -- both wrong.
  const providerInfo = buildProviderInfo(tmdbProviders, region);
  if(providerInfo){
    if(!existingEntry.platform){
      updated.platform = providerInfo.platform;
    }
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
