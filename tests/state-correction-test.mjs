import fs from "fs";
import {Calendar,getCalendarRows} from "../src/pages/Calendar.js";
import {Search} from "../src/pages/Search.js";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const franchises=JSON.parse(fs.readFileSync("src/data/franchises.json","utf8"));
const platforms=JSON.parse(fs.readFileSync("src/data/platforms.json","utf8"));
const profile=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));
const movies=JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));

const makeState=(progress={},query="",watchlist=[])=>({shows,movies,franchises,platforms,profile,progress,ratings:{},watchlist,query});

let html=Calendar(makeState({"project-runway-s22":2},"",["project-runway-s22"]));
if(html.includes("<h3>Project Runway</h3><p>Season Premiere")) throw new Error("Stale Project Runway premiere remains after progress 2");
if(!html.includes("<h3>Project Runway</h3><p>Episode 3")) throw new Error("Project Runway Episode 3 is not the next relevant drop");
console.log("PASS — Project Runway progress 2 -> next calendar drop Episode 3");

html=Calendar(makeState({"slow-horses-s6":2},"",["slow-horses-s6"]));
if(html.includes("<h3>Slow Horses</h3><p>Season Premiere")) throw new Error("Stale Slow Horses premiere remains after progress 2");
if(!html.includes("<h3>Slow Horses</h3><p>Episode 3")) throw new Error("Slow Horses Episode 3 is not the next relevant drop");
console.log("PASS — Slow Horses progress 2 -> next calendar drop Episode 3");

html=Calendar(makeState({"the-shards":4},"",["the-shards"]));
if(html.includes("<h3>The Shards</h3>")) throw new Error("The Shards appears in Calendar despite no future drops");
console.log("PASS — The Shards excluded from Calendar");

html=Calendar(makeState({},"",[]));
if(html.includes("<h3>Graveyard</h3>") || html.includes("<h3>Project Runway</h3>") || html.includes("<h3>Slow Horses</h3>"))
  throw new Error("Calendar displays catalog titles when watchlist is empty");
console.log("PASS — Empty watchlist produces no personalized calendar entries");

html=Calendar(makeState({"project-runway-s22":2,"slow-horses-s6":2},"",["project-runway-s22","slow-horses-s6"]));
if(html.includes("<h3>Graveyard</h3>")) throw new Error("Unwatched Graveyard appears on personalized Calendar");
if(!html.includes("<h3>Project Runway</h3><p>Episode 3")) throw new Error("Project Runway next drop missing from personalized Calendar");
if(!html.includes("<h3>Slow Horses</h3><p>Episode 3")) throw new Error("Slow Horses next drop missing from personalized Calendar");
console.log("PASS — Calendar is limited to watchlist titles and next relevant drops");

const mixedState=makeState({"project-runway-s22":2,"slow-horses-s6":2},"",["project-runway-s22","slow-horses-s6"]);
const mixedRows=getCalendarRows(mixedState);
if(mixedRows.length!==2) throw new Error(`CAL-02 expected exactly 2 next-drop rows, got ${mixedRows.length}`);
if(mixedRows.some(x=>x.show.title==="Graveyard")) throw new Error("CAL-02: Graveyard leaked into personalized Calendar");
if(!mixedRows.some(x=>x.show.title==="Project Runway" && Number(x.episode)===3)) throw new Error("CAL-02: Project Runway Episode 3 missing");
if(!mixedRows.some(x=>x.show.title==="Slow Horses" && Number(x.episode)===3)) throw new Error("CAL-02: Slow Horses Episode 3 missing");
if(html=Calendar(mixedState), (html.match(/<article class="card media-row">/g)||[]).length!==2) throw new Error("CAL-02: rendered Calendar contains more than one row per watchlisted title");
console.log("PASS — CAL-02: only watchlisted titles and their next relevant drops render");

html=Search(makeState({}, "Andor"));
if(!html.includes("Andor") || !html.includes("Star Wars")) throw new Error("Andor search failed");
console.log("PASS — Andor search resolves through Star Wars connection");

html=Search(makeState({}, "Denzel Washington"));
if(!html.includes("Denzel Washington")) throw new Error("Denzel Washington search failed");
console.log("PASS — Cast search resolves Denzel Washington");

console.log("STATE CORRECTION TESTS: PASS");
