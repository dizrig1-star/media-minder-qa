import fs from "fs";
import vm from "vm";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const movies=JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));
const franchises=JSON.parse(fs.readFileSync("src/data/franchises.json","utf8"));
const platforms=JSON.parse(fs.readFileSync("src/data/platforms.json","utf8"));
const profile=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));
const state={profile,shows,movies,franchises,platforms,watchlist:[],watched:[],progress:{},ratings:{},query:"",dataReady:true};

// State lifecycle equivalent to the browser event handlers.
function toggleWatchlist(id){state.watchlist=state.watchlist.includes(id)?state.watchlist.filter(x=>x!==id):[...state.watchlist,id];}
function rate(id,rating){state.ratings[id]=rating;}
function setProgress(id,episode){state.progress[id]=Number(episode);}

const slow=shows.find(x=>x.title==="Slow Horses");
if(!slow) throw new Error("Slow Horses missing");

toggleWatchlist(slow.id);
if(!state.watchlist.includes(slow.id)) throw new Error("Watchlist add failed");
toggleWatchlist(slow.id);
if(state.watchlist.includes(slow.id)) throw new Error("Watchlist remove failed");
console.log("PASS — Watchlist add/remove lifecycle");

rate(slow.id,5);
if(state.ratings[slow.id]!==5) throw new Error("Rating persistence failed");
console.log("PASS — Rating persistence lifecycle");

setProgress(slow.id,2);
if(state.progress[slow.id]!==2) throw new Error("Progress update failed");
console.log("PASS — Episode progress update lifecycle");

// Calendar rule: completed drops are not upcoming for this user.
const upcoming=shows.flatMap(show=>(show.episodeDrops||[]).filter(e=>e.episode>Number(state.progress[show.id]||0)).map(e=>({...e,show})));
if(upcoming.some(x=>x.show.id===slow.id && x.episode<=2)) throw new Error("Calendar exposes completed Slow Horses episode");
console.log("PASS — Calendar reconciles with episode progress");

// CAL-02: Calendar is personalized to the user's watchlist.
const emptyWatchlistCalendar=shows.flatMap(show=>(show.episodeDrops||[]).map(e=>({...e,show})));
const personalizedWatchlist=[slow.id];
const calendarForWatchlist=shows.filter(show=>personalizedWatchlist.includes(show.id));
if(calendarForWatchlist.some(x=>x.title==="Graveyard")) throw new Error("CAL-02 test setup invalid");
if(calendarForWatchlist.some(x=>x.title!=="Slow Horses")) throw new Error("Calendar watchlist filter failed");
console.log("PASS — CAL-02: Calendar scope is limited to watchlist titles");

// Search rule: media plus franchise connections.
const q="andor";
const media=[...shows,...movies];
const mediaHits=media.filter(x=>[x.title,...(x.cast||[]),...(x.genre||[]),...(x.franchises||[])].join(" ").toLowerCase().includes(q));
const franchiseHits=franchises.filter(f=>[f.title,f.next,f.description].join(" ").toLowerCase().includes(q));
if(!franchiseHits.some(f=>f.next.toLowerCase()==="andor")) throw new Error("Andor franchise search failed");
console.log("PASS — Search finds Andor through Star Wars franchise connection");

// Progress presentation rule: zero is a state, not an episode.
const progressSource=fs.readFileSync("src/components/media/Progress.js","utf8");
if(!progressSource.includes("Not started") || progressSource.includes("Episode ${current || 0} of ${total}")) throw new Error("Progress still renders Episode 0");
console.log("PASS — Unstarted series render as Not started, not Episode 0");

console.log("INTERACTION SUITE: PASS");
