import fs from "fs";
import {Landing} from "../src/pages/Landing.js";
import {Tonight} from "../src/pages/Tonight.js";
import {Recommendations} from "../src/pages/Recommendations.js";
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
const state={profile,shows,movies,franchises,platforms,watchlist:[],watched:[],notInterested:[],progress:{},ratings:{},query:"",dataReady:true};
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

const shards=shows.find(x=>x.title==="The Shards");
if(!shards || shards.currentEpisode!==4 || shards.status!=="returning" || shards.premiere!==null)
  throw new Error("The Shards data is not corrected");
console.log("PASS — The Shards is returning, Episode 4, not a premiere");

const calendar=Calendar(state);
if(calendar.includes("Series Premiere") || calendar.includes("The Shards"))
  throw new Error("Calendar still exposes The Shards as a premiere");
console.log("PASS — Calendar excludes stale The Shards premiere");

const premieres=Premieres(state);
if(premieres.includes("The Shards"))
  throw new Error("Premieres still includes already-airing The Shards");
console.log("PASS — Premieres excludes The Shards");

console.log("PAGE RENDER QA: PASS — 11/11");

const premiereRowsHtml=Premieres(state);
if(premiereRowsHtml.includes("Slow Horses")) throw new Error("Premieres incorrectly includes Slow Horses outside the two-week window");
if(premiereRowsHtml.includes("The Shards")) throw new Error("Premieres incorrectly includes The Shards");
if(premiereRowsHtml.includes("Episode 2") || premiereRowsHtml.includes("Episode 3")) throw new Error("Premieres contains ordinary weekly episodes");
if(premiereRowsHtml.includes("Project Runway")) throw new Error("Premieres incorrectly includes Project Runway after relevance metadata correction");
if(!premiereRowsHtml.includes("Graveyard")) throw new Error("Premieres missing qualifying Graveyard opener");
console.log("PASS — Premieres shows only qualifying upcoming openers");
