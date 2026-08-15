import fs from "node:fs";
import assert from "node:assert/strict";

// Tests run from the src/ working directory via npm test.
const required = [
 "index.html","main.js","app/router.js","app/state.js",
 "services/dataService.js","services/recommendationService.js","services/onboardingService.js",
 "services/scheduleService.js","styles/app.css","data/profile.json","data/shows.json",
 "data/onboardingShows.json","data/movies.json","data/franchises.json"
];
for(const file of required) assert.equal(fs.existsSync(file),true,`Missing ${file}`);

const html=fs.readFileSync("index.html","utf8");
assert.match(html,/main\.js/);
const shows=JSON.parse(fs.readFileSync("data/shows.json","utf8"));
const onboardingShows=JSON.parse(fs.readFileSync("data/onboardingShows.json","utf8"));
assert.ok(shows.length>0);
assert.ok(onboardingShows.some(show=>show.title==="Lioness"));
assert.ok(onboardingShows.some(show=>show.title==="Reacher"));
console.log("Media Minder smoke test passed.");
