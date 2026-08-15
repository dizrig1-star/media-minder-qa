const HIGH_RATING = 4;

/**
 * Turn a small set of highly-rated current watches into reusable profile signals.
 * This deliberately reuses the existing profile vocabulary instead of creating
 * a second recommendation model for first-time users.
 */
export function buildProfileFromInitialWatches(baseProfile, items, ratings={}){
  const profile={...baseProfile};
  const highRated=(items||[]).filter(item=>Number(ratings[item.id]||0)>=HIGH_RATING);

  const addUnique=(existing=[], values=[])=>[...new Set([...(existing||[]), ...values.filter(Boolean)])];
  profile.favoriteGenres=addUnique(profile.favoriteGenres, highRated.flatMap(item=>item.genre||[]));
  profile.favoritePeople=addUnique(profile.favoritePeople, highRated.flatMap(item=>item.cast||[]));
  profile.favoriteFranchises=addUnique(profile.favoriteFranchises, highRated.flatMap(item=>item.franchises||[]));
  profile.platforms=addUnique(profile.platforms, highRated.map(item=>item.platform));
  profile.ratings={...(profile.ratings||{}), ...ratings};
  profile.onboardingComplete=true;
  return profile;
}

export function getOnboardingCandidates(shows, limit=6){
  return (shows||[]).filter(item=>item.type==="series").slice(0,limit);
}

// Ratings below four stars remain useful user history but do not seed strong taste signals.
export {HIGH_RATING};
