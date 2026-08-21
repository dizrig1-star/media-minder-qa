import {heading,mediaCard,platformName} from "./pageUtils.js";
export function Tonight(state,choice,recs){
 const today=new Date().toISOString().slice(0,10);
 const tonight=state.shows.filter(x=>x.episodeDrops?.some(e=>e.date===today));
 const picks=tonight.length?tonight:recs;
 return `${heading("Tonight","Tonight's Watch List","Start with the best fit for this evening.")}
 <div class="grid-2"><section class="stack">${picks.slice(0,4).map(x=>mediaCard(state,x)).join("")}</section>
 <aside class="card"><div class="page-kicker">MM's Choice</div><h2>Start here.</h2><p>The recommendation is the star. The platform is shown so there is no hunting once you've decided.</p><div class="retro-rule"></div>
 ${choice?`<p><strong>${choice.title}</strong><br><span class="muted">${platformName(state,choice.platform)}</span></p>`:""}</aside></div>`;
}