import {affinityWeight} from "./profileModel.js";

const SCORE = {
  genre: 5,
  platform: 2,
  franchise: 4,
  person: 2,
  mmSelect: 3,
  currentAffinity: 3
};

// A show can carry a future "premiere" date for its next season while
// earlier seasons remain in the catalog (e.g. "returning" status) -- but the
// episodeDrops list is the actual ground truth for what has aired. If the
// earliest episode on record hasn't dropped yet, there is nothing released
// to recommend as tonight's watch, regardless of taste score. Movies have no
// "premiere" key at all (evergreen catalog entries, nothing to gate on) and
// stay eligible -- but a show that carries the key with a null value (e.g.
// "A Knight of the Seven Kingdoms: Season 2") is one Media Minder is
// explicitly tracking as not-yet-dated/announced, and must NOT default to
// eligible just because there's no date to compare against.
export function hasReleasedContent(item, now=new Date()){
  const today = new Date(now);
  today.setHours(0,0,0,0);
  const drops = item.episodeDrops || [];
  const earliest = drops.length
    ? drops.map(d=>d.date).sort()[0]
    : item.premiere;
  if(!earliest) return !("premiere" in item);
  const earliestDate = new Date(`${earliest}T12:00:00`);
  earliestDate.setHours(0,0,0,0);
  return earliestDate <= today;
}

function sharesAffinity(item, affinity){
  if(item.id===affinity.itemId) return true;
  if((item.genre||[]).some(g=>(affinity.genres||[]).includes(g))) return true;
  if((item.franchises||[]).some(f=>(affinity.franchises||[]).includes(f))) return true;
  if((item.cast||[]).some(p=>(affinity.people||[]).includes(p))) return true;
  if(item.platform && item.platform===affinity.platform) return true;
  return false;
}

export function scoreItem(item, profile){
  let score = 0;
  if(item.genre?.some(g => (profile.favoriteGenres||[]).includes(g))) score += SCORE.genre;
  if((profile.platforms||[]).includes(item.platform)) score += SCORE.platform;
  if(item.franchises?.some(f => (profile.favoriteFranchises||[]).includes(f))) score += SCORE.franchise;
  if(item.cast?.some(p => (profile.favoritePeople||[]).includes(p))) score += SCORE.person;
  if(item.mmSelect) score += SCORE.mmSelect;

  // Current affinities are evidence about taste, not permanent favorites.
  // A current watch influences related content through shared attributes and recency.
  for(const affinity of (profile.currentAffinities||[])){
    if(sharesAffinity(item, affinity)) score += SCORE.currentAffinity * affinityWeight(affinity);
  }
  return score;
}

export function recommendations(items, profile, limit=6, now=new Date()){
  return [...items]
    .filter(item => hasReleasedContent(item, now))
    .map(item => ({...item, recommendationScore:scoreItem(item,profile)}))
    .sort((a,b)=>b.recommendationScore-a.recommendationScore)
    .slice(0,limit);
}

export function mmChoice(items, profile){
  const ranked = recommendations(items,profile,20);
  return ranked.find(x=>x.mmSelect==="Select") || ranked.find(x=>x.mmSelect==="Gold") || null;
}

// Deterministic "rotation": a stable index derived from the seed string
// (defaults to today's date), so the pick is the same all day but changes
// day to day -- a real rotation without random flicker on every render/
// navigation within the same visit. Not cryptographic; just needs to be
// stable and spread picks out reasonably evenly across a small pool.
export function selectRotatingWildcard(candidates, seed=new Date().toISOString().slice(0,10)){
  if(!candidates?.length) return null;
  let hash = 0;
  for(let i=0;i<seed.length;i++){ hash = (hash*31 + seed.charCodeAt(i)) >>> 0; }
  return candidates[hash % candidates.length];
}

// Static-pool fallback: the hand-curated catalog titles editorially tagged
// as a "deliberate wildcard" in their "why" copy (see Design Bible). Used
// when there's no live TMDB-correlation pool yet (no 5-star ratings, no
// TMDB key, or discovery hasn't run/failed) -- see resolveWildcard below,
// which is what render() actually calls. Now rotates daily instead of
// always returning the single highest-scoring candidate.
export function pickWildcard(items, profile={}, seed=new Date().toISOString().slice(0,10)){
  const candidates = (items||[]).filter(item => /deliberate wildcard/i.test(item.why || ""));
  if(!candidates.length) return null;
  return selectRotatingWildcard(candidates, seed);
}

// The actual picker render() uses: prefers the live TMDB-correlation pool
// (state.wildcardCandidates, populated by triggerWildcardDiscovery in
// main.js from the person's own 5-star ratings) and falls back to the
// static curated pool only when that live pool is empty, so a first-time
// user (or one without a TMDB key) still sees a wildcard rather than
// nothing. Both pools rotate through the same daily-seeded selection.
export function resolveWildcard(state, items, seed=new Date().toISOString().slice(0,10)){
  const live = state.wildcardCandidates || [];
  if(live.length) return selectRotatingWildcard(live, seed);
  return pickWildcard(items, state.profile, seed);
}
