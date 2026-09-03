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

// Regression for a real bug: Franchises.js/Search.js/pageUtils.js were edited
// across several rounds this session with no cache-bust query on their
// imports, so browsers that had already loaded an earlier version kept
// serving stale cached copies of the modules -- Simon kept seeing the old
// site ("Same result") even after the source on the branch was fixed and
// verified. Every module that's been touched this way now carries the same
// cache-bust as Calendar.js, and this asserts it stays that way.
const franchisesSrc=fs.readFileSync("src/pages/Franchises.js","utf8");
const searchSrc=fs.readFileSync("src/pages/Search.js","utf8");
assert(main.includes(`Franchises.js?v=${version}`),"main.js has stale Franchises cache-bust version");
assert(main.includes(`Search.js?v=${version}`),"main.js has stale Search cache-bust version");
assert(franchisesSrc.includes(`pageUtils.js?v=${version}`),"Franchises.js has stale pageUtils cache-bust version");
assert(searchSrc.includes(`pageUtils.js?v=${version}`),"Search.js has stale pageUtils cache-bust version");
console.log("PASS — Franchises/Search/pageUtils carry a matching cache-bust so browser caches can't serve stale copies");

assert(readme.includes(`Version ${version}`),"README version mismatch");
for(const stale of ["1.0.12","1.0.11","1.0.9","1.0.8","1.0.7"]){
  assert(!index.includes(`?v=${stale}`),`index.html contains stale cache-bust ${stale}`);
  assert(!main.includes(`?v=${stale}`),`main.js contains stale cache-bust ${stale}`);
}
console.log("PASS — release version and cache-busting metadata are consistent");
