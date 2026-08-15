import {ensureProfileModel,addCurrentAffinity} from "./profileModel.js";

const HIGH_RATING = 4;

/**
 * Build first-time profile state without converting current shows into permanent favorites.
 * Highly-rated current watches become current affinities; explicit existing preferences remain intact.
 */
export function buildProfileFromInitialWatches(baseProfile, items, ratings={}, observedAt=""){
  let profile=ensureProfileModel(baseProfile);
  profile={
    ...profile,
    behavior:{
      ...profile.behavior,
      ratings:{...(profile.behavior?.ratings||{}), ...ratings}
    },
    ratings:{...(profile.ratings||{}), ...ratings},
    onboardingComplete:true
  };
  for(const item of (items||[])){
    const rating=Number(ratings[item.id]||0);
    if(rating>=HIGH_RATING) profile=addCurrentAffinity(profile,item,rating,observedAt);
  }
  return profile;
}

/** All current series are searchable during first-time setup; the UI filters them client-side. */
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
