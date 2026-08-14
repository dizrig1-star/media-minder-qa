import {heading,platformName} from "./pageUtils.js";
export function Calendar(state){
 const rows=[];
 state.shows.forEach(show => (show.episodeDrops||[])
   .filter(drop => Number(drop.episode) > Number(state.progress[show.id] || 0))
   .forEach(e => rows.push({...e,show})));
 rows.sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
 return `${heading("The calendar","Calendar","Week-by-week episode drops and premieres.")}
 <div class="list">${rows.slice(0,20).map(x=>`<article class="card media-row">
 <div class="poster small">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
 <div class="details"><div class="cluster"><span class="platform">${platformName(state,x.show.platform)}</span><strong>Episode ${x.episode}</strong></div>
 <h3>${x.show.title}</h3><p>${x.title}</p><p class="muted">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${x.time}</p></div>
 </article>`).join("")}</div>`;
}
