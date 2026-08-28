import assert from "node:assert/strict";
import {getPersonalizedCalendarRows,getUpcomingPremiereRows} from "../services/scheduleService.js";

const drops=[
 {episode:1,title:"Episode 1",date:"2026-08-10",time:"9:00 PM"},
 {episode:2,title:"Episode 2",date:"2026-08-17",time:"9:00 PM"},
 {episode:3,title:"Episode 3",date:"2026-08-24",time:"9:00 PM"}
];
const premiereDrops=[
 {episode:1,title:"Season Premiere",date:"2026-08-16",time:"9:00 PM"},
 {episode:2,title:"Episode 2",date:"2026-08-23",time:"9:00 PM"}
];
const shows=[
 {id:"shards",title:"The Shards",type:"series",status:"returning",platform:"hulu",genre:["Mystery"],premiere:"2026-08-05",episodeDrops:drops},
 {id:"alpha",title:"Alpha",type:"series",status:"returning",platform:"hulu",genre:["Mystery"],premiere:"2026-08-16",episodeDrops:premiereDrops},
 {id:"beta",title:"Beta",type:"series",status:"returning",platform:"hulu",genre:["Reality Competition"],premiere:"2026-08-16",episodeDrops:premiereDrops}
];
const rows=getPersonalizedCalendarRows({shows,watchlist:["shards","alpha"],progress:{shards:1,alpha:1}});
assert.equal(rows.length,2);
assert.deepEqual(rows.map(row=>row.show.id),["shards","alpha"]);
assert.equal(rows.find(row=>row.show.id==="shards").episode,2);
assert.equal(rows.find(row=>row.show.id==="alpha").episode,2);
assert.equal(rows.some(row=>row.show.id==="beta"),false);

const profile={favoriteGenres:["Mystery"],platforms:["hulu"],favoriteFranchises:[],favoritePeople:[]};
const premiereRows=getUpcomingPremiereRows({shows,profile},new Date("2026-08-15T12:00:00"));
assert.ok(premiereRows.some(row=>row.show.id==="alpha"),"A relevant premiere inside the 14-day window should qualify");
assert.ok(premiereRows.every(row=>row.episode===1));
assert.equal(premiereRows.some(row=>row.show.id==="beta"),false);
assert.equal(premiereRows.some(row=>row.show.id==="shards"),false,"A premiere already past must not reappear");
console.log("CAL-02 regression passed.");
