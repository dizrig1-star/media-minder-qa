import assert from "node:assert/strict";
import {buildProfileFromInitialWatches} from "../services/onboardingService.js";

const base={name:"Synthetic",favoriteGenres:["Mystery"],favoritePeople:[],favoriteFranchises:[],platforms:["hulu"],ratings:{}};
const catalog=[
  {id:"lioness-s3",genre:["Espionage Thriller","Action Drama"],platform:"paramount",cast:["Zoe Saldaña"],franchises:[]},
  {id:"reacher-s4",genre:["Action","Crime Thriller"],platform:"prime",cast:["Alan Ritchson"],franchises:[]},
  {id:"project-runway-s22",genre:["Reality Competition"],platform:"disney",cast:["Heidi Klum"],franchises:[]}
];
const profiles=Array.from({length:10},(_,i)=>({...base,name:`Synthetic ${i+1}`,favoriteGenres:i%2?["Mystery"]:["Crime Thriller"]}));

for(const [i,profile] of profiles.entries()){
  const ratings=i===0?{"lioness-s3":5,"reacher-s4":5}:{"project-runway-s22":i%3+1};
  const selected=Object.keys(ratings).map(id=>catalog.find(item=>item.id===id));
  const result=buildProfileFromInitialWatches(profile,selected,ratings);
  assert.equal(result.onboardingComplete,true);
  assert.deepEqual(result.ratings,ratings);
  if(i===0){
    assert.ok(result.favoriteGenres.includes("Espionage Thriller"));
    assert.ok(result.favoriteGenres.includes("Action"));
    assert.ok(result.platforms.includes("paramount"));
    assert.ok(result.platforms.includes("prime"));
    assert.ok(result.favoritePeople.includes("Zoe Saldaña"));
    assert.ok(result.favoritePeople.includes("Alan Ritchson"));
  } else {
    assert.equal(result.favoriteGenres.includes("Reality Competition"),false);
  }
}

console.log("Onboarding synthetic lab passed: 10 profiles.");
