import assert from "assert";
import {ensureProfileModel,addCurrentAffinity} from "../src/services/profileModel.js";
import {scoreItem} from "../src/services/recommendationService.js";

const cases=[
  {name:"Mystery Loyalist",watch:{id:"w1",title:"Mystery House",genre:["Mystery"],cast:["A"],platform:"netflix"},candidate:{id:"c1",title:"New Mystery",genre:["Mystery"],cast:[],platform:"netflix"}},
  {name:"Action Thriller",watch:{id:"w2",title:"Reacher",genre:["Action Thriller"],cast:["Alan Ritchson"],platform:"prime"},candidate:{id:"c2",title:"Hard Target",genre:["Action Thriller"],cast:[],platform:"prime"}},
  {name:"Political Thriller",watch:{id:"w3",title:"Lioness",genre:["Political Thriller"],cast:["Zoe Saldana"],platform:"paramount"},candidate:{id:"c3",title:"Shadow State",genre:["Political Thriller"],cast:[],platform:"paramount"}},
  {name:"Fantasy",watch:{id:"w4",title:"Dragon Realm",genre:["Fantasy"],cast:[],platform:"max"},candidate:{id:"c4",title:"The Crowned Isle",genre:["Fantasy"],cast:[],platform:"max"}},
  {name:"Crime",watch:{id:"w5",title:"Cold Case",genre:["Crime Thriller"],cast:[],platform:"hulu"},candidate:{id:"c5",title:"Night Files",genre:["Crime Thriller"],cast:[],platform:"hulu"}},
  {name:"Historical",watch:{id:"w6",title:"Empire",genre:["Historical Drama"],cast:[],platform:"pbs"},candidate:{id:"c6",title:"The Dynasty",genre:["Historical Drama"],cast:[],platform:"pbs"}},
  {name:"Marvel",watch:{id:"w7",title:"Marvel Hero",genre:["Action"],franchises:["marvel"],platform:"disney"},candidate:{id:"c7",title:"Marvel Next",genre:["Action"],franchises:["marvel"],platform:"disney"}},
  {name:"Star Wars",watch:{id:"w8",title:"Star Wars",genre:["Fantasy"],franchises:["star-wars"],platform:"disney"},candidate:{id:"c8",title:"Galactic Echo",genre:["Science Fiction"],franchises:["star-wars"],platform:"disney"}},
  {name:"Prestige Drama",watch:{id:"w9",title:"Prestige",genre:["Drama"],franchises:["masterpiece"],platform:"pbs"},candidate:{id:"c9",title:"New Prestige",genre:["Drama"],franchises:[],platform:"pbs"}},
  {name:"Platform Explorer",watch:{id:"w10",title:"Platform Favorite",genre:["Drama"],platform:"apple"},candidate:{id:"c10",title:"Apple Drama",genre:["Drama"],platform:"apple"}}
];

for(const c of cases){
  const base=ensureProfileModel({name:c.name,favoriteGenres:[],favoriteFranchises:[],favoritePeople:[],platforms:[],ratings:{},watched:[],watchlist:[]});
  const p=addCurrentAffinity(base,c.watch,5,"2026-08-15");
  assert.equal(p.favoriteGenres.length,0,`${c.name}: affinity leaked into permanent genres`);
  assert.equal(p.favoriteFranchises.length,0,`${c.name}: affinity leaked into permanent franchises`);
  assert.equal(p.currentAffinities.length,1,`${c.name}: affinity missing`);
  const score=scoreItem(c.candidate,p);
  assert(score>=15,`${c.name}: current affinity did not produce a meaningful recommendation signal (score ${score})`);
}

const recency=addCurrentAffinity(ensureProfileModel({favoriteGenres:[],favoriteFranchises:[],favoritePeople:[],platforms:[]}),cases[2].watch,5,"2026-06-15");
const fresh=scoreItem(cases[2].candidate,addCurrentAffinity(ensureProfileModel({favoriteGenres:[],favoriteFranchises:[],favoritePeople:[],platforms:[]}),cases[2].watch,5,"2026-08-15"));
const older=scoreItem(cases[2].candidate,recency);
assert(fresh>older,"recent affinity should be stronger than older affinity");

console.log(`PASS — Profile Model v1.1 synthetic lab: ${cases.length}/10 profiles`);
console.log("PASS — current affinity influences recommendations without becoming permanent preference");
console.log("PASS — recency reduces affinity weight over time");
