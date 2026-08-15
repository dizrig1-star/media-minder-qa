import {ensureProfileModel,addCurrentAffinity} from "./profileModel.js";

const HIGH_RATING = 4;

/**
 * Convert first-session current watches into current affinities.
 * High ratings influence recommendations without permanently rewriting favorites.
 */
export function buildProfileFromInitialWatches(baseProfile, items, ratings={}, observedAt=""){
  let profile=ensureProfileModel(baseProfile);
  for(const item of (items||[])){
    const rating=Number(ratings[item.id]||0);
    profile=addCurrentAffinity(profile,item,rating,observedAt);
  }
  profile.ratings={...(profile.ratings||{}), ...ratings};
  profile.onboardingComplete=true;
  return profile;
}

export function getOnboardingCandidates(shows){
  return (shows||[]).filter(item=>item.type==="series");
}

export function searchOnboardingCandidates(shows, query=""){
  const needle=String(query).trim().toLowerCase();
  if(!needle) return getOnboardingCandidates(shows);
  return getOnboardingCandidates(shows).filter(item=>[
    item.title,
    ...(item.genre||[]),
    ...(item.cast||[]),
    ...(item.franchises||[])
  ].some(value=>String(value).toLowerCase().includes(needle)));
}

export {HIGH_RATING};
