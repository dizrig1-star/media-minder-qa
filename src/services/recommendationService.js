const SCORE = {
  genre: 5,
  platform: 2,
  franchise: 4,
  person: 2,
  mmSelect: 3,
  wildcard: 1
};

export function scoreItem(item, profile={}){
  let score = 0;
  if(item.genre?.some(g => (profile.favoriteGenres||[]).includes(g))) score += SCORE.genre;
  if((profile.platforms||[]).includes(item.platform)) score += SCORE.platform;
  if(item.franchises?.some(f => (profile.favoriteFranchises||[]).includes(f))) score += SCORE.franchise;
  if(item.cast?.some(p => (profile.favoritePeople||[]).includes(p))) score += SCORE.person;
  if(item.mmSelect) score += SCORE.mmSelect;
  return score;
}

export function recommendations(items, profile, limit=6){
  return [...items]
    .map(item => ({...item, recommendationScore:scoreItem(item,profile)}))
    .sort((a,b)=>b.recommendationScore-a.recommendationScore)
    .slice(0,limit);
}

export function mmChoice(items, profile){
  return recommendations(items,profile,20).find(x=>x.mmSelect==="Gold") || null;
}

// A real wildcard, not just "whatever wasn't Gold". The expanded catalog's
// editorial "why" copy already tags genuine departures from the user's usual
// lane (see shows.json/movies.json -- several entries literally open with
// "A deliberate wildcard: ..."). We pick the best-scoring item among those,
// searched across the FULL catalog rather than the already-personalized top
// recs, since a true wildcard is expected to score low on normal taste-match.
export function pickWildcard(items, profile={}){
  const candidates = (items||[]).filter(item => /deliberate wildcard/i.test(item.why || ""));
  if(!candidates.length) return null;
  return [...candidates].sort((a,b)=>scoreItem(b,profile)-scoreItem(a,profile))[0];
}
