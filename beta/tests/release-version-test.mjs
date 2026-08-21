import fs from "fs";
import assert from "assert";

const version=fs.readFileSync("VERSION","utf8").trim();
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const index=fs.readFileSync("index.html","utf8");
const main=fs.readFileSync("src/main.js","utf8");
const readme=fs.readFileSync("README.md","utf8");

assert.equal(version,"1.1.0-qa","VERSION mismatch");
assert.equal(pkg.version,version,"package.json version mismatch");
assert(index.includes(`main.js?v=${version}`),"index.html has stale main.js cache-bust version");
assert(main.includes(`Calendar.js?v=${version}`),"main.js has stale Calendar cache-bust version");
assert(readme.includes(`Version ${version}`),"README version mismatch");
for(const stale of ["1.0.12","1.0.11","1.0.9","1.0.8","1.0.7"]){
  assert(!index.includes(`?v=${stale}`),`index.html contains stale cache-bust ${stale}`);
  assert(!main.includes(`?v=${stale}`),`main.js contains stale cache-bust ${stale}`);
}
console.log("PASS — release version and cache-busting metadata are consistent");
