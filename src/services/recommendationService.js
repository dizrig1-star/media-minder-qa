import {affinityWeight} from "./profileModel.js";

const SCORE = {
  genre: 5,
  platform: 2,
  franchise: 4,
  person: 2,
  mmSelect: 3,
  currentAffinity: 3
};

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

export function recommendations(items, profile, limit=6){
  return [...items]
    .map(item => ({...item, recommendationScore:scoreItem(item,profile)}))
    .sort((a,b)=>b.recommendationScore-a.recommendationScore)
    .slice(0,limit);
}

export function mmChoice(items, profile){
  const ranked = recommendations(items,profile,20);
  return ranked.find(x=>x.mmSelect==="Select") || ranked.find(x=>x.mmSelect==="Gold") || null;
}

export function pickWildcard(items, profile={}){
  const candidates = (items||[]).filter(item => /deliberate wildcard/i.test(item.why || ""));
  if(!candidates.length) return null;
  return [...candidates].sort((a,b)=>scoreItem(b,profile)-scoreItem(a,profile))[0];
}
