import {heading,mediaCard,platformName} from "./pageUtils.js";
import {EditorialCard} from "../components/recommendation/EditorialCard.js";

const ASSET = './assets/branding/approved/';

export function Tonight(state,choice,recs){
 const today=new Date().toISOString().slice(0,10);
 const tonight=state.shows.filter(x=>x.episodeDrops?.some(e=>e.date===today));
 const picks=tonight.length?tonight:recs;
 return `${heading("Tonight","Tonight's Top Viewing Choices Curated For You","Start with the best fit for this evening.")}
 <div class="grid-2"><section class="stack editorial-stack">${picks.slice(0,4).map((x,i)=>{
   const kind=state.progress?.[x.id]?"watching":"tonight";
   const tier=i===0?"hero":i===1?"secondary":"compact";
   const extraBadges=x.mmSelect?['select']:[];
   const labelOverride=i===0?"Tonight's Top Choice":undefined;
   return EditorialCard(x,platformName(state,x.platform),kind,state,tier,extraBadges,labelOverride);
 }).join("")}</section>
 <aside class="card coming-soon-aside"><div class="page-kicker">MM's Choice</div><h2>Start here.</h2><p>The recommendation is the star. The platform is shown so there is no hunting once you've decided.</p><div class="retro-rule"></div>
 ${choice?`<p><strong>${choice.title}</strong><br><span class="muted">${platformName(state,choice.platform)}</span></p>`:""}
 <div class="seal-legend">
   <div class="seal-legend-row"><img src="${ASSET}mm-select-gold-seal.svg" alt=""><span>Gold -- can't-miss</span></div>
   <div class="seal-legend-row"><img src="${ASSET}mm-select-silver-seal.svg" alt=""><span>Silver -- strong pick</span></div>
   <div class="seal-legend-row"><img src="${ASSET}mm-select-star.svg" alt=""><span>Select -- worth a look</span></div>
 </div>
 </aside></div>`;
}
