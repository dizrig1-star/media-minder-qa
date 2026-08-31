import fs from "fs";
import assert from "assert";

// Guards against exactly the kind of drift Simon flagged: generic placeholder
// text left in shipped catalog data, and episode/runtime metadata that
// doesn't match the schedule the app actually renders. This runs on every
// commit, so a placeholder or a miscounted schedule fails CI instead of
// reaching the live site.

const PLACEHOLDER_PATTERNS = [
  /\bupcoming .+ title\b/i,
  /\btbd\b/i,
  /\bt\.b\.d\.?\b/i,
  /coming soon/i,
  /lorem ipsum/i,
  /\btodo\b/i,
  /to be announced/i,
  /\bplaceholder\b/i,
  /\bxxx\b/i,
  /example title/i
];

function scanForPlaceholders(value, path, hits){
  if(typeof value === "string"){
    for(const pattern of PLACEHOLDER_PATTERNS){
      if(pattern.test(value)) hits.push(`${path} matches ${pattern}: "${value}"`);
    }
  } else if(Array.isArray(value)){
    value.forEach((v,i) => scanForPlaceholders(v, `${path}[${i}]`, hits));
  } else if(value && typeof value === "object"){
    for(const [k,v] of Object.entries(value)) scanForPlaceholders(v, `${path}.${k}`, hits);
  }
}

const shows = JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const movies = JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));
const franchises = JSON.parse(fs.readFileSync("src/data/franchises.json","utf8"));

// 1. No generic placeholder text anywhere in the catalog.
const placeholderHits = [];
scanForPlaceholders(shows, "shows.json", placeholderHits);
scanForPlaceholders(movies, "movies.json", placeholderHits);
scanForPlaceholders(franchises, "franchises.json", placeholderHits);
assert.deepEqual(placeholderHits, [], `Placeholder text found in catalog data:\n${placeholderHits.join("\n")}`);
console.log("PASS — no placeholder text in shows.json, movies.json, or franchises.json");

// 2. Every show and movie lists a real cast/host -- an empty array is a
//    silent placeholder even though it's structurally valid JSON.
for(const s of shows){
  assert(Array.isArray(s.cast) && s.cast.length > 0, `${s.id} has an empty cast array`);
}
for(const m of movies){
  assert(Array.isArray(m.cast) && m.cast.length > 0, `${m.id} has an empty cast array`);
}
console.log("PASS — every show and movie lists at least one real cast/host name");

// 3. Declared episode count matches the actual schedule, and every
//    schedule is in chronological order -- catches copy/paste drift
//    between "episodes" and "episodeDrops" before it reaches Calendar/Premieres.
for(const s of shows){
  if(!Array.isArray(s.episodeDrops)) continue;
  assert.equal(
    s.episodeDrops.length, s.episodes,
    `${s.id}: episodes (${s.episodes}) does not match episodeDrops.length (${s.episodeDrops.length})`
  );
  let lastTime = -Infinity;
  for(const drop of s.episodeDrops){
    const t = Date.parse(`${drop.date}T00:00:00`);
    assert(Number.isFinite(t), `${s.id}: episodeDrops has an unparseable date "${drop.date}"`);
    assert(t >= lastTime, `${s.id}: episodeDrops is not in chronological order at episode ${drop.episode}`);
    lastTime = t;
  }
}
console.log("PASS — every show's episode count and schedule are internally consistent");

// 4. Runtime, genre, and editorial copy are populated -- catches rows added
//    with the numeric/text fields left blank or zeroed out.
for(const s of shows){
  assert(Number.isFinite(s.runtime) && s.runtime > 0, `${s.id} has an invalid runtime`);
  assert(Array.isArray(s.genre) && s.genre.length > 0, `${s.id} has no genre tags`);
  assert(typeof s.summary === "string" && s.summary.length > 10, `${s.id} has no real summary`);
  assert(typeof s.why === "string" && s.why.length > 10, `${s.id} has no real "why" copy`);
}
for(const m of movies){
  assert(Number.isFinite(m.runtime) && m.runtime > 0, `${m.id} has an invalid runtime`);
  assert(Array.isArray(m.genre) && m.genre.length > 0, `${m.id} has no genre tags`);
  assert(typeof m.summary === "string" && m.summary.length > 10, `${m.id} has no real summary`);
  assert(typeof m.why === "string" && m.why.length > 10, `${m.id} has no real "why" copy`);
}
console.log("PASS — every show and movie has real runtime, genre, and editorial copy");

console.log("CATALOG INTEGRITY QA: PASS");
