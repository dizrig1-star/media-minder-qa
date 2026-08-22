import {heading,platformName} from "./pageUtils.js";
import {EditorialCard} from "../components/recommendation/EditorialCard.js";
import {getUpcomingPremiereRows} from "../services/scheduleService.js";

export function Premieres(state){
  const items=getUpcomingPremiereRows(state);
  return `${heading("The searchlights","Premieres","New series and season openers worth knowing about next.")}
  <div class="retro-rule" style="margin-bottom:1.5rem"></div>
  <div class="grid-2"><section class="stack editorial-stack">${items.length?items.map(({show})=>EditorialCard(show,platformName(state,show.platform),"premiere",state)).join(""):"<div class='empty-state'><h2>No qualifying premieres yet.</h2><p>Media Minder will surface relevant new series and season openers as they approach.</p></div>"}</section>
  <aside class="card coming-soon-aside"><div class="page-kicker">Coming Soon</div><h2>Next two weeks</h2><p>Only relevant new series and season openers are shown here. Weekly episodes stay on your Calendar.</p><div class="retro-rule"></div><p class="muted">The gold banner and framed card treatment identify this section as a distinct editorial module.</p></aside></div>`;
}
