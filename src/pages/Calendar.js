import {heading,platformName} from "./pageUtils.js";
import {getPersonalizedCalendarRows} from "../services/scheduleService.js";

export {getPersonalizedCalendarRows as getCalendarRows};

const ASSET = './assets/branding/approved/';

export function Calendar(state){
  const rows=getPersonalizedCalendarRows(state);
  return `${heading("The calendar","Calendar","Week-by-week episode drops and premieres.")}
  <div class="list">${rows.map(x=>{
    const d=new Date(x.date+"T12:00:00");
    const month=d.toLocaleDateString("en-US",{month:"short"});
    const day=d.toLocaleDateString("en-US",{day:"numeric"});
    return `<article class="editorial-card editorial-card--compact">
    <div class="editorial-banner"><span class="editorial-banner-mark">✦</span>EPISODE DROP<span class="editorial-banner-mark">✦</span></div>
    <div class="media-row curated-row-body">
    <div class="date-tile">
      <img class="date-tile-art" src="${ASSET}date-badge-blank-tile.svg" alt="" aria-hidden="true">
      <span class="date-tile-month">${month}</span>
      <span class="date-tile-day">${day}</span>
    </div>
    <div class="details"><div class="cluster"><span class="platform">${platformName(state,x.show.platform)}</span><strong>Episode ${x.episode}</strong></div>
    <h3>${x.show.title}</h3><p>${x.title}</p><p class="muted">${d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${x.time}</p></div>
    </div>
  </article>`;
  }).join("")}</div>`;
}
