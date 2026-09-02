#!/usr/bin/env node
// Phase 1 of the Future Recommendation Model: refreshes artwork, platform,
// and rating data in src/data/shows.json and src/data/movies.json from TMDB
// and OMDb. Does NOT touch title, genre, cast, summary, "why", episodes,
// episodeDrops, franchises, mmSelect, or any other hand-curated editorial
// field -- those stay exactly as written.
//
// Requires two environment variables: TMDB_API_KEY and OMDB_API_KEY.
// Run manually with:
//   TMDB_API_KEY=xxx OMDB_API_KEY=yyy node scripts/enrich-catalog.mjs
// In CI, these come from repository secrets of the same names -- see
// .github/workflows/catalog-refresh.yml.

import fs from "fs";
import {
  pickBestTmdbMatch,
  mergeEnrichment
} from "../src/lib/enrichLogic.mjs";

const REGION = process.env.MM_REGION || "US";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

if(!TMDB_API_KEY || !OMDB_API_KEY){
  console.error("Missing TMDB_API_KEY and/or OMDB_API_KEY in the environment. Nothing was changed.");
  process.exit(1);
}

const SHOWS_PATH = "src/data/shows.json";
const MOVIES_PATH = "src/data/movies.json";

async function tmdbFetch(path, params = {}){
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if(!res.ok) throw new Error(`TMDB ${path} -> HTTP ${res.status}`);
  return res.json();
}

async function omdbFetch(params){
  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", OMDB_API_KEY);
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if(!res.ok) throw new Error(`OMDb -> HTTP ${res.status}`);
  const data = await res.json();
  if(data.Response === "False") throw new Error(`OMDb: ${data.Error}`);
  return data;
}

async function resolveTmdbId(entry, isSeries){
  if(entry.tmdbId) return entry.tmdbId;
  const searchPath = isSeries ? "/search/tv" : "/search/movie";
  const searchResults = await tmdbFetch(searchPath, { query: entry.title });
  const match = pickBestTmdbMatch(searchResults, entry.title, entry.year);
  return match?.id || null;
}

async function fetchEnrichmentData(entry, isSeries){
  const tmdbId = await resolveTmdbId(entry, isSeries);
  if(!tmdbId) return { skipped: "no TMDB match found" };

  const detailPath = isSeries ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
  const providersPath = isSeries ? `/tv/${tmdbId}/watch/providers` : `/movie/${tmdbId}/watch/providers`;

  const [tmdbDetails, tmdbProviders] = await Promise.all([
    tmdbFetch(detailPath),
    tmdbFetch(providersPath)
  ]);

  let imdbId = tmdbDetails.imdb_id || null;
  if(!imdbId && isSeries){
    const externalIds = await tmdbFetch(`/tv/${tmdbId}/external_ids`);
    imdbId = externalIds.imdb_id || null;
  }

  let omdbData = null;
  if(imdbId){
    try {
      omdbData = await omdbFetch({ i: imdbId });
    } catch(err){
      console.warn(`  OMDb lookup failed for ${entry.id} (${imdbId}): ${err.message}`);
    }
  }

  return { tmdbDetails, tmdbProviders, omdbData, tmdbId };
}

async function enrichList(list, isSeries, label){
  const updated = [];
  for(const entry of list){
    process.stdout.write(`${label}: ${entry.id} ... `);
    try {
      const data = await fetchEnrichmentData(entry, isSeries);
      if(data.skipped){
        console.log(`skipped (${data.skipped})`);
        updated.push(entry);
        continue;
      }
      const merged = mergeEnrichment(entry, data, REGION);
      const changed = JSON.stringify(merged) !== JSON.stringify(entry);
      console.log(changed ? "updated" : "no change");
      updated.push(merged);
    } catch(err){
      console.warn(`failed (${err.message}) -- keeping existing data`);
      updated.push(entry);
    }
  }
  return updated;
}

async function main(){
  const shows = JSON.parse(fs.readFileSync(SHOWS_PATH, "utf8"));
  const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));

  console.log(`Enriching ${shows.length} shows and ${movies.length} movies against TMDB + OMDb (region: ${REGION})`);

  const updatedShows = await enrichList(shows, true, "show");
  const updatedMovies = await enrichList(movies, false, "movie");

  fs.writeFileSync(SHOWS_PATH, JSON.stringify(updatedShows, null, 2) + "\n");
  fs.writeFileSync(MOVIES_PATH, JSON.stringify(updatedMovies, null, 2) + "\n");

  console.log("Done. If a title's match looks wrong in the diff, add a \"tmdbId\": <id> field to that entry to pin it for future runs.");
}

main().catch(err => {
  console.error("Enrichment run failed:", err);
  process.exit(1);
});
