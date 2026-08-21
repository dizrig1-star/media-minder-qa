import {heading,platformName} from "./pageUtils.js";
import {getPersonalizedCalendarRows} from "../services/scheduleService.js";

export {getPersonalizedCalendarRows as getCalendarRows};

export function Calendar(state){
  const rows=getPersonalizedCalendarRows(state);
  return `${heading("The calendar","Calendar","Week-by-week episode drops and premieres.")}
  <div class="list">${rows.map(x=>`<article class="card media-row">
    <div class="calendar-date"><span class="month">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{month:"short"})}</span><span class="day">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{day:"numeric"})}</span></div>
    <div class="details"><div class="cluster"><span class="platform">${platformName(state,x.show.platform)}</span><strong>Episode ${x.episode}</strong></div>
    <h3>${x.show.title}</h3><p>${x.title}</p><p class="muted">${new Date(x.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${x.time}</p></div>
  </article>`).join("")}</div>`;
}
