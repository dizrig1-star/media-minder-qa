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
  extractRottenTomatoesPercent,
  pickBestTmdbMatch
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
// For a series, TMDB's /tv/{id} details (already fetched for every result,
// no extra call) list every season's episode count in `seasons`. Watchlist's
// progress tracker (Progress.js) needs a current season number + episode
// count to show "Season X - Episode Y of Z" -- without it, a watchlisted
// live result just shows raw episode numbers with no season context. Picks
// the highest real season (season_number > 0 excludes "Specials"/season 0).
function currentSeasonInfo(tmdbDetails){
  const seasons = (tmdbDetails?.seasons || []).filter(s => s.season_number > 0);
  if(!seasons.length) return {season: null, episodes: null};
  const latest = seasons.reduce((a, b) => (b.season_number > a.season_number ? b : a));
  return {season: latest.season_number, episodes: latest.episode_count || null};
}

export function buildLiveSearchResult(searchHit, tmdbDetails, tmdbProviders, omdbData, region = "US"){
  const isMovie = searchHit.media_type === "movie";
  const providerInfo = buildProviderInfo(tmdbProviders, region);
  const imdbRating = extractImdbRating(omdbData);
  const rtPercent = extractRottenTomatoesPercent(omdbData);
  const mmRating = computeMMRating(imdbRating, rtPercent);
  const {season, episodes} = isMovie ? {season: null, episodes: null} : currentSeasonInfo(tmdbDetails);

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
    ...(season !== null ? {season} : {}),
    ...(episodes !== null ? {episodes} : {}),
    isLiveResult: true
  };
}

// Pure mapper from TMDB's /tv/{id}/season/{n} response to the same
// {episode, title, date, time} shape the curated catalog's episodeDrops
// use (see shows.json) -- so an adopted live series can produce real
// Calendar rows the same way a hand-curated show does. TMDB gives an air
// date but no air time, unlike curated entries (which are hand-timed), so
// time is always "" here; Calendar.js/EditorialCard.js only show a time
// segment when one is present. Episodes with no air_date yet (unaired,
// TBD) are dropped -- a date-less "drop" is not a real Calendar entry.
export function buildEpisodeDropsFromSeason(seasonData){
  return (seasonData?.episodes || [])
    .filter(e => e.air_date)
    .map(e => ({
      episode: e.episode_number,
      title: e.name || `Episode ${e.episode_number}`,
      date: e.air_date,
      time: ""
    }));
}

// Fetches one season's real per-episode air dates for a live-search-found
// series, at the moment someone adopts it to their Watchlist (see
// adoptLiveResult in state.js) -- not on every search result, since this is
// an extra network call per title and only actually matters once someone
// has decided they want it tracked. Never throws: returns [] on any
// failure (no key, bad id, network error), same "degrade to nothing rather
// than break the adopt" contract as liveSearch() itself.
export async function fetchSeasonEpisodeDrops(tmdbShowId, seasonNumber, tmdbApiKey){
  if(!tmdbShowId || !seasonNumber || !tmdbApiKey) return [];
  try {
    const seasonData = await tmdbFetch(`/tv/${tmdbShowId}/season/${seasonNumber}`, {}, tmdbApiKey);
    return buildEpisodeDropsFromSeason(seasonData);
  } catch(err){
    console.warn(`Live search: season details fetch failed for tv/${tmdbShowId} season ${seasonNumber}`, err);
    return [];
  }
}

// ---------------------------------------------------------- Wildcard v2
// Rotating wildcard picks correlated with the person's own 5-star ratings
// (see resolveWildcard/selectRotatingWildcard in recommendationService.js
// for the rotation itself, and triggerWildcardDiscovery in main.js for when
// this runs). Rather than guess at genre overlap -- this app's editorial
// genre labels ("Espionage Thriller", "Medical Drama", etc.) don't map
// cleanly onto TMDB's fixed genre taxonomy -- this asks TMDB directly for
// each highly-rated title's own "recommendations" (its "people who liked
// this also liked" list), which is a much more precise correlation signal
// than a hand-built genre-id table would be.

// Pure mapper: one TMDB discover/recommendations-shaped result -> our
// live-item shape. No genre names (TMDB recommendations only gives genre
// ids, and resolving those to names would mean yet another lookup table --
// left blank rather than guessed at, same spirit as leaving cast empty).
export function buildWildcardCandidate(result, mediaType){
  const isMovie = mediaType === "movie";
  return {
    id: `live-${mediaType}-${result.id}`,
    title: result.title || result.name || "Untitled",
    type: isMovie ? "movie" : "series",
    poster: result.poster_path ? `https://image.tmdb.org/t/p/w780${result.poster_path}` : null,
    platform: null,
    link: null,
    genre: [],
    cast: [],
    summary: result.overview || "",
    why: "A deliberate wildcard: found via a strong correlation with something you rated highly.",
    mmRating: Number.isFinite(result.vote_average) ? Math.round(result.vote_average * 10) / 10 : null,
    ratingSources: null,
    isLiveResult: true
  };
}

// Finds a catalog item's own TMDB entry by title (reusing the same matching
// logic the weekly enrichment pipeline already trusts), then pulls TMDB's
// "recommendations" for it. Returns [] on any failure -- a single 5-star
// title that TMDB can't match, or a request that fails, should never break
// the wildcard pick for the person's other ratings.
async function tmdbRecommendationsForItem(item, tmdbApiKey){
  const mediaType = item.type === "series" ? "tv" : "movie";
  try {
    const searchResults = await tmdbFetch(`/search/${mediaType}`, { query: item.title, include_adult: "false" }, tmdbApiKey);
    const match = pickBestTmdbMatch(searchResults, item.title, null);
    if(!match) return [];
    const recs = await tmdbFetch(`/${mediaType}/${match.id}/recommendations`, {}, tmdbApiKey);
    return (recs.results || []).map(r => ({ result: r, mediaType }));
  } catch(err){
    console.warn(`Wildcard discovery: TMDB recommendations lookup failed for "${item.title}"`, err);
    return [];
  }
}

// Orchestrates the whole correlation pool: for each of the person's recent
// 5-star titles (fiveStarItems, already resolved to catalog items -- see
// triggerWildcardDiscovery in main.js), pulls TMDB's recommendations,
// merges and dedupes them, keeps only a real quality bar (vote_average 7.0+
// on at least 50 votes -- TMDB's own "recommendations" are already a
// curated similarity list, so this is a lighter bar than discoverExceptional's
// open-genre-browse 7.5/200, just enough to filter out obscure/poor results),
// and excludes anything already in the library so it can't "recommend" a
// title the person already has. Never throws; returns [] on no key/no
// 5-star ratings/total failure, so callers fall back to the old static pool.
export async function discoverWildcardCandidates(fiveStarItems, { tmdbApiKey, omdbApiKey, excludeTitles = [], limit = 12 } = {}){
  if(!tmdbApiKey || !fiveStarItems?.length) return [];

  const exclude = new Set(excludeTitles.map(t => (t || "").trim().toLowerCase()));
  const seen = new Set();
  const candidates = [];

  for(const item of fiveStarItems){
    const recs = await tmdbRecommendationsForItem(item, tmdbApiKey);
    for(const { result, mediaType } of recs){
      const key = `${mediaType}-${result.id}`;
      if(seen.has(key)) continue;
      const title = (result.title || result.name || "").trim().toLowerCase();
      if(!title || exclude.has(title)) continue;
      if(!(result.vote_average >= 7.0 && result.vote_count >= 50)) continue;
      seen.add(key);
      candidates.push(buildWildcardCandidate(result, mediaType));
    }
  }
  return candidates.slice(0, limit);
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

// TMDB's own official movie genre ids (from /genre/movie/list -- these are
// stable, published constants, not something this app invents), used so the
// Movie Desk's mood buttons can discover beyond the curated catalog without
// a free-text query, which TMDB's search endpoint requires and discover does
// not.
export const TMDB_MOVIE_GENRE_IDS = {
  Drama: 18,
  Fantasy: 14,
  Documentary: 99,
  Romance: 10749,
  Mystery: 9648,
  Comedy: 35,
  "Sci-Fi": 878,
  Adventure: 12,
  Family: 10751,
  War: 10752
};

// "Only exceptional recommendations" beyond the local library: TMDB's
// /discover/movie can browse by genre without a search term, so a mood pick
// with no free-text query can still reach past the curated catalog. The bar
// for "exceptional" is a vote_average of 7.5+ on at least 200 votes -- high
// enough to filter out obscure or poorly-reviewed titles, but not so narrow
// that a genre with a thinner catalog on TMDB comes back empty. Deliberately
// lighter-weight than liveSearch()'s per-title detail/provider/OMDb calls:
// this is a "few more worth seeking out" aside, not a full result list, so it
// works directly off discover's own vote_average rather than fetching full
// detail for every candidate.
export async function discoverExceptional(genreIds, { tmdbApiKey, region = "US", limit = 3, excludeTitles = [] } = {}){
  if(!tmdbApiKey || !genreIds?.length) return [];

  let data;
  try {
    data = await tmdbFetch("/discover/movie", {
      with_genres: genreIds.join(","),
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      "vote_average.gte": "7.5",
      include_adult: "false",
      watch_region: region
    }, tmdbApiKey);
  } catch(err){
    console.warn("Mood discovery: TMDB discover failed", err);
    return [];
  }

  const exclude = new Set(excludeTitles.map(t => t.toLowerCase()));
  return (data.results || [])
    .filter(r => !exclude.has((r.title || "").toLowerCase()))
    .slice(0, limit)
    .map(r => ({
      id: `live-movie-${r.id}`,
      title: r.title || "Untitled",
      type: "movie",
      poster: r.poster_path ? `https://image.tmdb.org/t/p/w780${r.poster_path}` : null,
      platform: null,
      link: null,
      genre: (r.genre_ids || []).map(id => Object.keys(TMDB_MOVIE_GENRE_IDS).find(name => TMDB_MOVIE_GENRE_IDS[name] === id)).filter(Boolean),
      cast: [],
      summary: r.overview || "",
      why: "Found via TMDB discovery -- not yet part of your curated library.",
      mmRating: Math.round(r.vote_average * 10) / 10,
      ratingSources: null,
      isLiveResult: true
    }));
}
