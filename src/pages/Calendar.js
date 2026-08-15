import {heading,platformName} from "./pageUtils.js";

/** Return the first future drop for a watchlisted show after the user's current progress. */
function nextRelevantDrop(show, progress){
  const current=Number(progress?.[show.id] ?? 0);
  const drops=(show.episodeDrops||[])
    .filter(drop=>Number(drop.episode)>current)
    .sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return drops[0] ? {...drops[0],show} : null;
}

export function getCalendarRows(state){
  // Calendar is the user's upcoming viewing schedule, never the global catalog.
  // Resolve watchlist IDs to known shows first; stale/unknown IDs are ignored.
  const watchlistIds=new Set(Array.isArray(state.watchlist) ? state.watchlist.map(String) : []);
  const rows=[];
  for(const show of (state.shows||[])){
    if(!watchlistIds.has(String(show.id))) continue;
    const next=nextRelevantDrop(show,state.progress||{});
    if(next) rows.push(next);
  }
  return rows.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function Calendar(state){
  const rows=getCalendarRows(state);
  return `${heading("The calendar","Calendar","Week-by-week episode drops and premieres.")}
  <div class="list">${rows.map(x=>`<article class="card media-row">
    <div class="poster small">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
    <div class="details"><div class="cluster"><span class="platform">${platformName(state,x.show.platform)}</span><strong>Episode ${x.episode}</strong></div>
    <h3>${x.show.title}</h3><p>${x.title}</p><p class="muted">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${x.time}</p></div>
  </article>`).join("")}</div>`;
}
