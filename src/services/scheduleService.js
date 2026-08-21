import {scoreItem} from "./recommendationService.js";

const PREMIERE_WINDOW_DAYS = 14;
const PREMIERE_RELEVANCE_THRESHOLD = 7;

function toDateOnly(value){
return new Date(`${value}T12:00:00`);
}

export function nextRelevantDrop(show, progress={}, now=new Date()){
const current=Number(progress?.[show.id] ?? 0);
const today=new Date(now);
today.setHours(0,0,0,0);
const drops=(show.episodeDrops||[])
.filter(drop=>Number(drop.episode)>current)
.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
const next=drops[0];
if(!next) return null;
if(toDateOnly(next.date)<today) return null;
return {...next,show};
}

/** Personalized calendar: exactly one next drop per watchlisted series. */
export function getPersonalizedCalendarRows(state, now=new Date()){
const watchlistIds=new Set(Array.isArray(state.watchlist) ? state.watchlist.map(String) : []);
const rows=[];
for(const show of (state.shows||[])){
if(show.type!=="series" || !watchlistIds.has(String(show.id))) continue;
const next=nextRelevantDrop(show,state.progress||{},now);
if(next) rows.push(next);
}
return rows.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/**
* Premiere page: only relevant series/season openers in the next two weeks.
* Ordinary weekly episodes and already-opened seasons are excluded.
*/
export function getUpcomingPremiereRows(state, now=new Date()){
const start=new Date(now);
start.setHours(0,0,0,0);
const end=new Date(start);
end.setDate(end.getDate()+PREMIERE_WINDOW_DAYS);
end.setHours(23,59,59,999);

return (state.shows||[])
.filter(show=>show.type==="series" && show.premiere)
.filter(show=>show.status==="new" || show.status==="returning")
.filter(show=>show.episodeDrops?.some(drop=>Number(drop.episode)===1 && drop.date===show.premiere))
.filter(show=>{
const premiereDate=toDateOnly(show.premiere);
return premiereDate>=start && premiereDate<=end;
})
.filter(show=>scoreItem(show,state.profile||{})>=PREMIERE_RELEVANCE_THRESHOLD)
.map(show=>({show,date:show.premiere,time:show.episodeTime,title:show.episodeTitle||"Season Premiere",episode:1}))
.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export {PREMIERE_WINDOW_DAYS, PREMIERE_RELEVANCE_THRESHOLD};
