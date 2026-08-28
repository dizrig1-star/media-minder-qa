/** Profile Model v1.1
 *
 * Separates durable preferences from current viewing affinities and behavior.
 * Current affinities are evidence, not permanent favorites.
 */
export const PROFILE_MODEL_VERSION = "1.1";

export function ensureProfileModel(profile={}){
  return {
    ...profile,
    profileModelVersion: PROFILE_MODEL_VERSION,
    currentAffinities: Array.isArray(profile.currentAffinities) ? profile.currentAffinities : [],
    behavior: {
      ratings: profile.ratings || {},
      watched: profile.watched || [],
      watchlist: profile.watchlist || [],
      progress: profile.progress || {},
      ...(profile.behavior || {})
    },
    context: profile.context || {}
  };
}

export function addCurrentAffinity(profile, item, rating, date=""){
  const next=ensureProfileModel(profile);
  const affinity={
    itemId:item.id,
    title:item.title,
    rating:Number(rating),
    observedAt:date || new Date().toISOString().slice(0,10),
    genres:[...(item.genre||[])],
    people:[...(item.cast||[])],
    franchises:[...(item.franchises||[])],
    platform:item.platform || null
  };
  const existing=next.currentAffinities.filter(x=>x.itemId!==item.id);
  return {...next,currentAffinities:[...existing,affinity]};
}

export function affinityWeight(affinity, today=""){
  const rating=Number(affinity.rating||0);
  if(rating<4) return 0;
  const observed=new Date(affinity.observedAt || today || Date.now());
  const now=new Date(today || Date.now());
  const age=Math.max(0,Math.floor((now-observed)/86400000));
  return Math.max(1, rating - Math.floor(age/30));
}
