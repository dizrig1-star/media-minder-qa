import fs from "fs";
import {buildProfileFromInitialWatches,searchOnboardingCandidates,HIGH_RATING} from "../src/services/onboardingService.js";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const base=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));

const lioness=searchOnboardingCandidates(shows,"Lioness")[0];
const reacher=searchOnboardingCandidates(shows,"Reacher")[0];
if(!lioness || !reacher) throw new Error("First-time setup cannot find the real-world Lioness/Reacher onboarding anchors");

const profile=buildProfileFromInitialWatches(base,[lioness,reacher],{[lioness.id]:5,[reacher.id]:5},"2026-08-15");
const affinities=profile.currentAffinities;
if(affinities.length!==2) throw new Error("High-rated current watches did not create current affinities");
if(!affinities.some(x=>x.itemId===lioness.id && x.rating===5)) throw new Error("Lioness affinity missing");
if(!affinities.some(x=>x.itemId===reacher.id && x.rating===5)) throw new Error("Reacher affinity missing");

// Current affinities must NOT silently become permanent favorites.
for(const genre of [...lioness.genre,...reacher.genre]){
  if(profile.favoriteGenres.includes(genre) && !(base.favoriteGenres||[]).includes(genre)) throw new Error(`Current-watch genre leaked into permanent favorites: ${genre}`);
}
if(!profile.platforms.includes("paramount") || !profile.platforms.includes("prime")) throw new Error("High-rated current watches did not preserve platform signals in their affinities");
if(profile.ratings[lioness.id]!==5 || profile.ratings[reacher.id]!==5) throw new Error("Initial ratings were not persisted into profile history");
if(!profile.onboardingComplete) throw new Error("Onboarding did not mark the profile complete");

const skeptical=buildProfileFromInitialWatches(base,[lioness,reacher],{[lioness.id]:3,[reacher.id]:2},"2026-08-15");
if(skeptical.currentAffinities.length!==0) throw new Error("Low ratings incorrectly became current affinities");
if(skeptical.favoriteGenres.includes("Espionage Thriller") || skeptical.favoriteGenres.includes("Action")) throw new Error("Low ratings incorrectly became strong taste signals");

if(HIGH_RATING!==4) throw new Error("Onboarding strong-signal threshold changed unexpectedly");

console.log("PASS — first-time setup finds Lioness and Reacher");
console.log("PASS — 4/5-star current watches become current affinities");
console.log("PASS — current affinities do not rewrite permanent favorites");
console.log("PASS — lower ratings remain history without becoming strong taste signals");
console.log("ONBOARDING TESTS: PASS");
