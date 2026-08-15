import assert from "node:assert/strict";
import {buildProfileFromInitialWatches} from "../services/onboardingService.js";

const base={name:"New User",favoriteGenres:[],favoritePeople:[],favoriteFranchises:[],platforms:[],ratings:{}};
const catalog=[
  {id:"lioness-s3",genre:["Espionage Thriller","Action Drama"],platform:"paramount",cast:["Zoe Saldaña"],franchises:[]},
  {id:"reacher-s4",genre:["Action","Crime Thriller"],platform:"prime",cast:["Alan Ritchson"],franchises:[]},
  {id:"the-shards",genre:["Mystery","Crime Thriller"],platform:"hulu",cast:["Kaia Gerber"],franchises:[]},
  {id:"slow-horses-s6",genre:["Mystery","Crime Thriller"],platform:"apple",cast:["Gary Oldman"],franchises:[]},
  {id:"project-runway-s22",genre:["Reality Competition"],platform:"disney",cast:["Heidi Klum"],franchises:[]}
];
const patterns=[
  {"lioness-s3":5,"reacher-s4":5},
  {"the-shards":5},
  {"slow-horses-s6":4},
  {"project-runway-s22":3},
  {"lioness-s3":5,"the-shards":4}
];
const profiles=Array.from({length:10},(_,i)=>({...base,name:`Synthetic ${i+1}`}));

for(const [i,profile] of profiles.entries()){
  const ratings=patterns[i%patterns.length];
  const selected=Object.keys(ratings).map(id=>catalog.find(item=>item.id===id));
  const result=buildProfileFromInitialWatches(profile,selected,ratings);
  assert.equal(result.onboardingComplete,true);
  assert.deepEqual(result.ratings,ratings);
  if(i%5===0){
    assert.ok(result.favoriteGenres.includes("Espionage Thriller"));
    assert.ok(result.favoriteGenres.includes("Action"));
    assert.ok(result.platforms.includes("paramount"));
    assert.ok(result.platforms.includes("prime"));
  }
  if(i%5===1){
    assert.ok(result.favoriteGenres.includes("Mystery"));
    assert.ok(result.platforms.includes("hulu"));
  }
  if(i%5===3){
    assert.equal(result.favoriteGenres.includes("Reality Competition"),false,"Ratings below four stars must not seed a strong taste signal");
  }
}

console.log("Onboarding synthetic lab passed: 10 cold-start profiles.");
