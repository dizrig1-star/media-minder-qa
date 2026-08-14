import fs from "fs";
import {Calendar} from "../src/pages/Calendar.js";
import {Search} from "../src/pages/Search.js";

const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
const franchises=JSON.parse(fs.readFileSync("src/data/franchises.json","utf8"));
const platforms=JSON.parse(fs.readFileSync("src/data/platforms.json","utf8"));
const profile=JSON.parse(fs.readFileSync("src/data/profile.json","utf8"));
const movies=JSON.parse(fs.readFileSync("src/data/movies.json","utf8"));

const makeState=(progress={},query="")=>({shows,movies,franchises,platforms,profile,progress,ratings:{},watchlist:[],query});

let html=Calendar(makeState({"project-runway-s22":2}));
if(html.includes("<h3>Project Runway</h3><p>Season Premiere")) throw new Error("Stale Project Runway premiere remains after progress 2");
if(!html.includes("<h3>Project Runway</h3><p>Episode 3")) throw new Error("Project Runway Episode 3 is not the next relevant drop");
console.log("PASS — Project Runway progress 2 -> next calendar drop Episode 3");

html=Calendar(makeState({"slow-horses-s6":2}));
if(html.includes("<h3>Slow Horses</h3><p>Season Premiere")) throw new Error("Stale Slow Horses premiere remains after progress 2");
if(!html.includes("<h3>Slow Horses</h3><p>Episode 3")) throw new Error("Slow Horses Episode 3 is not the next relevant drop");
console.log("PASS — Slow Horses progress 2 -> next calendar drop Episode 3");

html=Calendar(makeState({"the-shards":4}));
if(html.includes("<h3>The Shards</h3>")) throw new Error("The Shards appears in Calendar despite no future drops");
console.log("PASS — The Shards excluded from Calendar");

html=Search(makeState({}, "Andor"));
if(!html.includes("Andor") || !html.includes("Star Wars")) throw new Error("Andor search failed");
console.log("PASS — Andor search resolves through Star Wars connection");

html=Search(makeState({}, "Denzel Washington"));
if(!html.includes("Denzel Washington")) throw new Error("Denzel Washington search failed");
console.log("PASS — Cast search resolves Denzel Washington");

console.log("STATE CORRECTION TESTS: PASS");
