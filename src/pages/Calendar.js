import {heading,platformName} from "./pageUtils.js";
import {getPersonalizedCalendarRows} from "../services/scheduleService.js";

export {getPersonalizedCalendarRows as getCalendarRows};

const ASSET = './assets/branding/approved/';

function countdownText(dateStr){
  const drop = new Date(dateStr+"T00:00:00");
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.round((drop - today) / 86400000);
  return diffDays > 0 ? String(diffDays) : "Showing";
}

export function Calendar(state){
  const rows=getPersonalizedCalendarRows(state);
  return `${heading("The calendar","Calendar","Week-by-week episode drops and premieres.")}
  <div class="list">${rows.map(x=>{
    const d=new Date(x.date+"T12:00:00");
    const month=d.toLocaleDateString("en-US",{month:"short"});
    const day=d.toLocaleDateString("en-US",{day:"numeric"});
    const countdown=countdownText(x.date);
    const artStyle=x.show.poster?` style="background-image:linear-gradient(180deg, rgba(15,45,51,.05) 0%, rgba(15,45,51,.35) 55%, rgba(10,10,10,.72) 100%), url('${x.show.poster}');background-size:cover;background-position:center;"`:"";
    return `<article class="editorial-card editorial-card--compact">
    <div class="editorial-banner"><span class="editorial-banner-mark">✦</span>EPISODE DROP<span class="editorial-banner-mark">✦</span></div>
    <div class="media-row curated-row-body">
    <div class="cal-art"${artStyle}>
      <span class="cal-art-title">${x.show.title}</span>
    </div>
    <div class="date-tile">
      <img class="date-tile-art" src="${ASSET}date-badge-blank-tile.svg" alt="" aria-hidden="true">
      <span class="date-tile-month">${month}</span>
      <span class="date-tile-day">${day}</span>
    </div>
    <div class="details"><div class="cluster"><span class="platform">${platformName(state,x.show.platform)}</span><strong>Episode ${x.episode}</strong></div>
    <h3>${x.show.title}</h3><p>${x.title}</p><p class="muted">${d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${x.time}</p></div>
    <div class="countdown-badge">
      <img class="countdown-badge-art" src="${ASSET}Icon-countdown.svg" alt="" aria-hidden="true">
      <span class="countdown-badge-value">${countdown}</span>
    </div>
    </div>
  </article>`;
  }).join("")}</div>`;
}
