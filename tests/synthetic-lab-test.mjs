import fs from "fs";
import {recommendations} from "../src/services/recommendationService.js";
import {getPersonalizedCalendarRows} from "../src/services/scheduleService.js";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const movies=JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));
const profiles=JSON.parse(fs.readFileSync("tests/fixtures/synthetic-profiles.json","utf8"));
const catalog=[...shows,...movies];

for(const profile of profiles){
  const recs=recommendations(catalog,profile,6);
  if(profile.id==="p06-new" && !recs.length) throw new Error("Cold-start profile produced no recommendations");
  const rows=getPersonalizedCalendarRows({...profile,shows,movies});
  const watchlist=new Set(profile.watchlist.map(String));
  if(rows.some(row=>!watchlist.has(String(row.show.id)))) throw new Error(`${profile.id}: Calendar leaked a non-watchlisted title`);
  const ids=rows.map(row=>row.show.id);
  if(new Set(ids).size!==ids.length) throw new Error(`${profile.id}: Calendar contains duplicate series rows`);
  for(const row of rows){
    const current=Number(profile.progress?.[row.show.id]||0);
    if(Number(row.episode)<=current) throw new Error(`${profile.id}: Calendar shows an already-consumed episode for ${row.show.title}`);
    const future=row.show.episodeDrops.filter(drop=>Number(drop.episode)>current);
    if(!future.length) throw new Error(`${profile.id}: Calendar shows ${row.show.title} without a future drop`);
    if(Number(row.episode)!==Number(future[0].episode)) throw new Error(`${profile.id}: Calendar did not select the first future drop for ${row.show.title}`);
  }
  console.log(`PASS — ${profile.id}: recommendations=${recs.length}, calendar=${rows.length}`);
}

const cold=profiles.find(p=>p.id==="p06-new");
const coldRecs=recommendations(catalog,cold,6);
if(cold.watchlist.length!==0 || Object.keys(cold.ratings).length!==0) throw new Error("Cold-start fixture is not actually cold");
if(coldRecs[0].recommendationScore<0) throw new Error("Cold-start recommendation score invalid");

console.log(`SYNTHETIC LAB: ${profiles.length}/10 profiles passed`);
console.log("CAL-02 invariant: one next future drop per watchlisted series");
console.log("COLD-START invariant: new user can receive recommendations without watch history");
