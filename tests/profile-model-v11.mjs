import assert from "assert";
import {ensureProfileModel,addCurrentAffinity,affinityWeight} from "../src/services/profileModel.js";

const base={favoriteGenres:["Mystery"],ratings:{},watched:[],watchlist:[]};
const item={id:"lioness",title:"Lioness",genre:["Political Thriller"],cast:["Zoe Saldana"],franchises:[],platform:"paramount"};
const p=ensureProfileModel(base);
assert.equal(p.profileModelVersion,"1.1");
assert.deepEqual(p.currentAffinities,[]);
assert.deepEqual(p.context,{});
const withAffinity=addCurrentAffinity(p,item,5,"2026-08-15");
assert.equal(withAffinity.currentAffinities.length,1);
assert.equal(withAffinity.currentAffinities[0].title,"Lioness");
assert.equal(withAffinity.favoriteGenres.includes("Mystery"),true);
assert.equal(withAffinity.favoriteGenres.includes("Political Thriller"),false,"current affinity must not become permanent favorite");
assert.equal(affinityWeight(withAffinity.currentAffinities[0],"2026-08-15"),5);
assert.equal(affinityWeight({...withAffinity.currentAffinities[0],rating:3},"2026-08-15"),0);
console.log("PASS — Profile Model v1.1 core invariants");
