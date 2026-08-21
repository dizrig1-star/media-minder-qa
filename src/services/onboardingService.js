// First-time setup: turn a handful of rated shows + chosen platforms into a
// taste profile. Deliberately outputs the SAME flat shape recommendationService's
// scoreItem() already reads (favoriteGenres/favoriteFranchises/favoritePeople/
// platforms) -- one profile shape for the whole app, not a second, incompatible
// one. (An earlier attempt on a side branch built a richer profile model that
// never matched what scoreItem() actually expects; not repeating that here.)

const HIGH_RATING = 4;

export function getOnboardingCandidates(shows){
  return (shows || []).filter(item => item.type === "series");
}

export function searchOnboardingCandidates(shows, query = ""){
  const needle = String(query).trim().toLowerCase();
  const candidates = getOnboardingCandidates(shows);
  if(!needle) return candidates;
  return candidates.filter(item => [
    item.title,
    ...(item.genre || []),
    ...(item.cast || [])
  ].some(value => String(value).toLowerCase().includes(needle)));
}

export function buildProfileFromInitialWatches(items, ratings, platforms, name){
  const favoriteGenres = new Set();
  const favoriteFranchises = new Set();
  const favoritePeople = new Set();
  for(const item of (items || [])){
    const rating = Number(ratings[item.id] || 0);
    if(rating < HIGH_RATING) continue;
    (item.genre || []).forEach(g => favoriteGenres.add(g));
    (item.franchises || []).forEach(f => favoriteFranchises.add(f));
    (item.cast || []).forEach(p => favoritePeople.add(p));
  }
  const trimmedName = String(name || "").trim();
  return {
    name: trimmedName || "there",
    favoriteGenres: [...favoriteGenres],
    favoriteFranchises: [...favoriteFranchises],
    favoritePeople: [...favoritePeople],
    favoriteCelebrations: [],
    platforms: [...(platforms || [])],
    tasteMode: "mostly-me-one-wildcard",
    editionLabel: trimmedName ? `${trimmedName}'s Edition` : "My Edition"
  };
}

export {HIGH_RATING};
