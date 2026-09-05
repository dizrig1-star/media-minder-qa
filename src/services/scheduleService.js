import {scoreItem} from "./recommendationService.js";

const PREMIERE_WINDOW_DAYS = 14;
const PREMIERE_RELEVANCE_THRESHOLD = 7;

function toDateOnly(value){
  return new Date(`${value}T12:00:00`);
}

export function nextRelevantDrop(show, progress={}){
  const current=Number(progress?.[show.id] ?? 0);
  const drops=(show.episodeDrops||[])
    .filter(drop=>Number(drop.episode)>current)
    .sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return drops[0] ? {...drops[0],show} : null;
}

/**
 * Personalized calendar: exactly one next drop per watchlisted series, plus
 * one "Now Showing" row per watchlisted movie. Movies are evergreen catalog
 * entries with no premiere/episodeDrops date to schedule against (see
 * recommendationService.hasReleasedContent) -- once a movie is on the
 * Watchlist it is simply available, so it belongs on the Calendar as an
 * always-current "Now Showing" entry rather than a dated countdown.
 */
export function getPersonalizedCalendarRows(state){
  const watchlistIds=new Set(Array.isArray(state.watchlist) ? state.watchlist.map(String) : []);
  const rows=[];
  for(const show of (state.shows||[])){
    if(show.type!=="series" || !watchlistIds.has(String(show.id))) continue;
    const next=nextRelevantDrop(show,state.progress||{});
    if(next) rows.push(next);
  }
  const nowShowingRows=[];
  for(const movie of (state.movies||[])){
    if(!watchlistIds.has(String(movie.id))) continue;
    nowShowingRows.push({show:movie, date:null, time:null, title:movie.title, episode:null, nowShowing:true});
  }
  rows.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  nowShowingRows.sort((a,b)=>a.show.title.localeCompare(b.show.title));
  return [...nowShowingRows, ...rows];
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
