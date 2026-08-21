import {heading,platformName} from "./pageUtils.js";
import {MMSelect} from "../components/recommendation/MMSelect.js";
import {Platform} from "../components/media/Platform.js";
import {Poster} from "../components/media/Poster.js";
import {getUpcomingPremiereRows} from "../services/scheduleService.js";

export function Premieres(state){
  const items=getUpcomingPremiereRows(state);
  return `${heading("The searchlights","Premieres","New series and season openers worth knowing about next.")}
  <div class="retro-rule" style="margin-bottom:1.5rem"></div>
  <div class="grid-2"><section class="stack">${items.length?items.map(({show,title,date,time})=>`<article class="card media-row">
    ${Poster(show.title,"small")}
    <div class="details">
      <div class="cluster">${MMSelect(show.mmSelect)}${Platform(platformName(state,show.platform))}</div>
      <h3>${show.title}</h3>
      <p class="muted">${show.status==="new"?"Series Premiere":"Season Premiere"} · ${date}</p>
      <p>${show.summary}</p>
      <p class="muted">${new Date(date+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · ${time}</p>
      <div class="cluster"><button class="btn small ${state.watchlist.includes(show.id)?"secondary":"ghost"}" data-watch="${show.id}">${state.watchlist.includes(show.id)?"Remove":"Add to Watchlist"}</button><button class="btn small secondary" data-detail="${show.id}">Details</button></div>
    </div>
  </article>`).join(""):"<div class='empty-state'><h2>No qualifying premieres yet.</h2><p>Media Minder will surface relevant new series and season openers as they approach.</p></div>"}</section>
  <aside class="card"><div class="page-kicker">Coming Soon</div><h2>Next two weeks</h2><p>Only relevant new series and season openers are shown here. Weekly episodes stay on your Calendar.</p></aside></div>`;
}
