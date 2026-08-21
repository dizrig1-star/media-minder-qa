import {heading,mediaCard,platformName} from "./pageUtils.js";
import {MMSelect} from "../components/recommendation/MMSelect.js";
import {Platform} from "../components/media/Platform.js";
export function Tonight(state,choice,recs){
 const today=new Date().toISOString().slice(0,10);
 const tonight=state.shows.filter(x=>x.episodeDrops?.some(e=>e.date===today));
 const picks=tonight.length?tonight:recs;
 return `${heading("Tonight","Tonight's Watch List","Start with the best fit for this evening.")}
 <div class="grid-2"><section class="stack">${picks.slice(0,4).map(x=>mediaCard(state,x)).join("")}</section>
 <aside class="card"><div class="page-kicker">MM's Choice</div><h2>Start here.</h2><p>The recommendation is the star. The platform is shown so there is no hunting once you've decided.</p><div class="retro-rule"></div>
 ${choice?`<div class="cluster">${MMSelect(choice.mmSelect)}${Platform(platformName(state,choice.platform))}</div>
 <h3>${choice.title}</h3>
 <p class="muted">${(choice.genre||[]).join(" · ")}${choice.runtime?` · ${choice.runtime} min`:""}</p>
 <p>${choice.why||choice.summary||""}</p>
 <button class="btn small" data-detail="${choice.id}">See the details</button>`
 :`<p class="muted">Rate a few shows in onboarding to unlock a personal pick here.</p>`}
 </aside></div>`;
}
