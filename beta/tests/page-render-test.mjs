import fs from "fs";
import {Landing} from "../src/pages/Landing.js";
import {Tonight} from "../src/pages/Tonight.js";
import {RecommendationsVisual as Recommendations} from "../src/pages/RecommendationsVisual.js";
import {Watchlist} from "../src/pages/Watchlist.js";
import {Calendar} from "../src/pages/Calendar.js";
import {Premieres} from "../src/pages/Premieres.js";
import {Movies} from "../src/pages/Movies.js";
import {Franchises} from "../src/pages/Franchises.js";
import {Reviews} from "../src/pages/Reviews.js";
import {Settings} from "../src/pages/Settings.js";
import {Search} from "../src/pages/Search.js";
import {recommendations,mmChoice} from "../src/services/recommendationService.js";

const profile=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));
const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const movies=JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));
const franchises=JSON.parse(fs.readFileSync("src/data/franchises.json","utf8"));
const platforms=JSON.parse(fs.readFileSync("src/data/platforms.json","utf8"));
const state={profile,shows,movies,franchises,platforms,watchlist:[],watched:[],notInterested:[],progress:{},ratings:{},query:"",movieMood:null,reviewsSort:"rating",dataReady:true,onboardingComplete:false};
const all=[...shows,...movies];
const recs=recommendations(all,profile,8);
const choice=mmChoice(all,profile);

const pages={
 landing:()=>Landing(state,choice,recs),
 tonight:()=>Tonight(state,choice,recs),
 recommendations:()=>Recommendations(state,choice,recs),
 watchlist:()=>Watchlist(state),
 calendar:()=>Calendar(state),
 premieres:()=>Premieres(state),
 movies:()=>Movies(state),
 franchises:()=>Franchises(state),
 reviews:()=>Reviews(state),
 settings:()=>Settings(state),
 search:()=>Search(state)
};

for(const [name,fn] of Object.entries(pages)){
  const html=fn();
  if(typeof html!=="string" || html.length<100) throw new Error(`${name}: empty/invalid render`);
  if(!html.includes("<")) throw new Error(`${name}: no HTML output`);
  console.log(`PASS — ${name} renders (${html.length} chars)`);
}

const landing=pages.landing();
if(!landing.includes("data-onboarding-complete")) throw new Error("Landing missing onboarding confirm action");
if(!landing.includes("data-onboarding-star=\"lioness-s3\"")) throw new Error("Onboarding missing functional Lioness star controls");
if(!landing.includes("data-onboarding-star=\"reacher-s4\"")) throw new Error("Onboarding missing functional Reacher star controls");
if(landing.includes("<select data-onboarding-rating=")) throw new Error("Onboarding still uses fragile rating dropdown controls");
console.log("PASS — First-Time Setup renders actionable rating controls and confirm action");

const main=fs.readFileSync("src/main.js","utf8");
if(!main.includes("data-onboarding-star")) throw new Error("Main binding missing onboarding star handler");
if(!main.includes("data-onboarding-complete")) throw new Error("Main binding missing onboarding confirm handler");
console.log("PASS — First-Time Setup interaction bindings are present");

const shards=shows.find(x=>x.title==="The Shards");
if(!shards || shards.currentEpisode!==4 || shards.nextEpisode!==5 || shards.status!=="returning" || shards.premiere!=="2026-08-05")
  throw new Error("The Shards data is not corrected");
console.log("PASS — The Shards is returning, Episode 4 with Episode 5 next");

const calendar=Calendar(state);
if(calendar.includes("Series Premiere"))
  throw new Error("Calendar still exposes The Shards as a premiere");
console.log("PASS — Calendar excludes stale The Shards premiere state");

const premieres=Premieres(state);
if(premieres.includes("The Shards"))
  throw new Error("Premieres still includes already-airing The Shards");
console.log("PASS — Premieres excludes The Shards");

console.log("PAGE RENDER QA: PASS — 11/11");

// The exact set of "upcoming" premieres depends on the wall-clock date at the
// moment this suite runs, and the catalog's premiere dates are fixed values --
// so any assertion tied to real time (e.g. "Graveyard must currently be
// upcoming") eventually goes stale as the calendar moves past it, even though
// nothing is actually broken. Anchoring to a fixed reference date (matching
// the convention already used in state-correction-test.mjs's PREMIERES-01
// check) makes this assertion permanent and immune to calendar drift.
const {getUpcomingPremiereRows}=await import("../src/services/scheduleService.js");
const PREMIERE_TEST_ANCHOR=new Date("2026-08-14T12:00:00");
const anchoredPremiereRows=getUpcomingPremiereRows(state,PREMIERE_TEST_ANCHOR);
if(anchoredPremiereRows.some(x=>x.show.title==="Slow Horses")) throw new Error("Premieres incorrectly includes Slow Horses outside the two-week window");
if(anchoredPremiereRows.some(x=>x.show.title==="The Shards")) throw new Error("Premieres incorrectly includes The Shards");
if(anchoredPremiereRows.some(x=>x.show.title==="Project Runway")) throw new Error("Premieres incorrectly includes Project Runway after relevance metadata correction");
if(!anchoredPremiereRows.some(x=>x.show.title==="Graveyard" && x.episode===1)) throw new Error("Premieres missing qualifying Graveyard opener");
const premiereRowsHtml=Premieres(state);
if(premiereRowsHtml.includes("Episode 2") || premiereRowsHtml.includes("Episode 3")) throw new Error("Premieres contains ordinary weekly episodes");
console.log("PASS — Premieres shows only qualifying upcoming openers");

// Regression for a real bug: the Franchises search box only indexed each
// franchise's title + description, not its "next" field (the actual
// upcoming show/movie title, e.g. "VisionQuest"). Searching for the name of
// an upcoming release -- the single most likely thing someone would type --
// returned nothing, even though the franchise itself was right there.
const franchisesHtml=Franchises(state);
for(const f of franchises){
  const marker=`data-franchise-text="`;
  const start=franchisesHtml.indexOf(marker+f.title.toLowerCase());
  if(start===-1) throw new Error(`Franchises: could not find data-franchise-text block for ${f.title}`);
  const end=franchisesHtml.indexOf(`"`, start+marker.length);
  const indexedText=franchisesHtml.slice(start+marker.length, end);
  if(!indexedText.includes(f.next.toLowerCase()))
    throw new Error(`Franchises search index for ${f.title} is missing its "next" title (${f.next}) -- searching for an upcoming release by name would return nothing`);
}
console.log("PASS — Franchises search index includes each franchise's upcoming title, not just name/description");
