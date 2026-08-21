import fs from "node:fs";
import assert from "node:assert/strict";

const required = [
 "src/index.html","src/main.js","src/app/router.js","src/app/state.js",
 "src/services/dataService.js","src/services/recommendationService.js",
 "src/styles/app.css","src/data/profile.json","src/data/shows.json",
 "src/data/movies.json","src/data/franchises.json"
];
for(const file of required) assert.equal(fs.existsSync(file),true,`Missing ${file}`);

const html=fs.readFileSync("src/index.html","utf8");
assert.match(html,/main\.js/);
const shows=JSON.parse(fs.readFileSync("src/data/shows.json","utf8"));
assert.ok(shows.length>0);
console.log("Media Minder smoke test passed.");
