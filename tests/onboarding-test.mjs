import fs from "fs";
import {buildProfileFromInitialWatches,searchOnboardingCandidates,HIGH_RATING} from "../src/services/onboardingService.js";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const base=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));

const lioness=searchOnboardingCandidates(shows,"Lioness")[0];
const reacher=searchOnboardingCandidates(shows,"Reacher")[0];
if(!lioness || !reacher) throw new Error("First-time setup cannot find the real-world Lioness/Reacher onboarding anchors");

const profile=buildProfileFromInitialWatches(base,[lioness,reacher],{[lioness.id]:5,[reacher.id]:5});
for(const genre of [...lioness.genre,...reacher.genre]){
  if(!profile.favoriteGenres.includes(genre)) throw new Error(`Missing high-rated genre signal: ${genre}`);
}
for(const person of [...lioness.cast,...reacher.cast]){
  if(!profile.favoritePeople.includes(person)) throw new Error(`Missing high-rated people signal: ${person}`);
}
if(!profile.platforms.includes("paramount") || !profile.platforms.includes("prime")) throw new Error("High-rated current watches did not seed platform signals");
if(profile.ratings[lioness.id]!==5 || profile.ratings[reacher.id]!==5) throw new Error("Initial ratings were not persisted into profile signals");
if(!profile.onboardingComplete) throw new Error("Onboarding did not mark the profile complete");

const skeptical=buildProfileFromInitialWatches(base,[lioness,reacher],{[lioness.id]:3,[reacher.id]:2});
if(skeptical.favoriteGenres.includes("Espionage Thriller") || skeptical.favoriteGenres.includes("Action")) throw new Error("Low ratings incorrectly became strong taste signals");

if(HIGH_RATING!==4) throw new Error("Onboarding strong-signal threshold changed unexpectedly");

console.log("PASS — first-time setup finds Lioness and Reacher");
console.log("PASS — 4/5-star current watches become reusable profile signals");
console.log("PASS — lower ratings remain history without becoming strong taste signals");
console.log("ONBOARDING TESTS: PASS");
