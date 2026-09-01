// Phase 2 of the Future Recommendation Model: live search against TMDB and
// OMDb, run from the browser at query time. This is what lets Search find a
// title that isn't in the local curated catalog at all (e.g. a horror movie
// a first-time visitor searches for) -- something the weekly background
// refresh can't do, since it only re-checks titles already on file.
//
// Keys are read from state.apiKeys (see src/app/state.js), which is only
// ever written to localStorage -- never committed to the repo. This repo is
// public, so a key baked into any committed file would be visible to anyone
// on the internet, not just people with the site passphrase. If no TMDB key
// is set, liveSearch() resolves to an empty array and the page falls back to
// local-catalog-only results, same as before this phase existed.
//
// buildLiveSearchResult is a pure function (no fetch) so it can be tested
// with canned fixtures -- see tests/live-search-test.mjs. liveSearch() itself
// does the real network calls and is exercised manually in the browser,
// where real keys exist.

import {
  buildProviderInfo,
  computeMMRating,
  extractImdbRating,
  extractRottenTomatoesPercent
} from "./enrichLogic.mjs";

async function tmdbFetch(path, params, apiKey){
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", apiKey);
  for(const [k,v] of Object.entries(params || {})) url.searchParams.set(k, v);
  const res = await fetch(url);
  if(!res.ok) throw new Error(`TMDB ${path} -> HTTP ${res.status}`);
  return res.json();
}

async function omdbFetch(params, apiKey){
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey);
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if(!res.ok) throw new Error(`OMDb -> HTTP ${res.status}`);
  const data = await res.json();
  if(data.Response === "False") throw new Error(`OMDb: ${data.Error}`);
  return data;
}

// Builds one result card's worth of data from already-fetched API responses.
// A live result is intentionally distinct from a curated catalog entry: its
// "why" is a generic disclosure rather than editorial voice, and it carries
// isLiveResult so the UI can label it as such.
export function buildLiveSearchResult(searchHit, tmdbDetails, tmdbProviders, omdbData, region = "US"){
  const isMovie = searchHit.media_type === "movie";
  const providerInfo = buildProviderInfo(tmdbProviders, region);
  const imdbRating = extractImdbRating(omdbData);
  const rtPercent = extractRottenTomatoesPercent(omdbData);
  const mmRating = computeMMRating(imdbRating, rtPercent);

  return {
    id: `live-${searchHit.media_type}-${searchHit.id}`,
    title: searchHit.title || searchHit.name || tmdbDetails?.title || tmdbDetails?.name || "Untitled",
    type: isMovie ? "movie" : "series",
    poster: tmdbDetails?.poster_path ? `https://image.tmdb.org/t/p/w780${tmdbDetails.poster_path}` : null,
    platform: providerInfo?.platform || null,
    link: providerInfo?.link || null,
    genre: (tmdbDetails?.genres || []).map(g => g.name),
    cast: (tmdbDetails?.credits?.cast || []).slice(0, 3).map(c => c.name),
    summary: tmdbDetails?.overview || "",
    why: "Found via live search -- not yet part of your curated library.",
    mmRating,
    ratingSources: mmRating !== null ? { imdb: imdbRating, rottenTomatoes: rtPercent } : null,
    isLiveResult: true
  };
}

// The real, network-calling search. Returns [] (never throws) if there's no
// TMDB key, or if the search itself fails -- callers should treat this as
// "no live results" and keep showing local catalog matches regardless.
export async function liveSearch(query, { tmdbApiKey, omdbApiKey, region = "US", limit = 4 } = {}){
  if(!tmdbApiKey || !query?.trim()) return [];

  let searchResults;
  try {
    searchResults = await tmdbFetch("/search/multi", { query, include_adult: "false" }, tmdbApiKey);
  } catch(err){
    console.warn("Live search: TMDB search failed", err);
    return [];
  }

  const candidates = (searchResults.results || [])
    .filter(r => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, limit);

  const results = [];
  for(const hit of candidates){
    try {
      const isMovie = hit.media_type === "movie";
      const detailPath = isMovie ? `/movie/${hit.id}` : `/tv/${hit.id}`;
      const [tmdbDetails, tmdbProviders] = await Promise.all([
        tmdbFetch(detailPath, { append_to_response: "credits,external_ids" }, tmdbApiKey),
        tmdbFetch(`${detailPath}/watch/providers`, {}, tmdbApiKey)
      ]);

      let omdbData = null;
      const imdbId = tmdbDetails.imdb_id || tmdbDetails.external_ids?.imdb_id;
      if(imdbId && omdbApiKey){
        try {
          omdbData = await omdbFetch({ i: imdbId }, omdbApiKey);
        } catch(err){
          console.warn(`Live search: OMDb lookup failed for ${hit.id}`, err);
        }
      }

      results.push(buildLiveSearchResult(hit, tmdbDetails, tmdbProviders, omdbData, region));
    } catch(err){
      console.warn(`Live search: TMDB detail lookup failed for ${hit.id}`, err);
    }
  }
  return results;
}
