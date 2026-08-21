import {heading,mediaCard,platformName} from "./pageUtils.js";
import {CuratedShowCard} from "../components/recommendation/CuratedShowCard.js";
export function RecommendationsVisual(state,choice,recs){
 const gold=recs.filter(x=>x.mmSelect==="Gold");
 const prototype=gold[0];
 const remaining=gold.slice(1,4);
 return `${heading("Curated for you","Recommendations","Mostly your tastes, with one wildcard.")}
 <div class="section-heading"><h2>MM Select Gold</h2></div>
 ${prototype?`<div class="curated-prototype"><div class="prototype-label">CURATED CARD — VISUAL PROTOTYPE</div>${CuratedShowCard(prototype,platformName(state,prototype.platform),state.ratings[prototype.id]||0)}</div>`:"<div class='empty-state'>Nothing rates an MM Select Gold right now.</div>"}
 ${remaining.length?`<div class="prototype-following-grid">${remaining.map(x=>mediaCard(state,x)).join("")}</div>`:""}
 <div class="section-heading"><h2>One Wildcard</h2></div>
 ${recs.find(x=>x.mmSelect!=="Gold")?mediaCard(state,recs.find(x=>x.mmSelect!=="Gold")):""}`;
}
