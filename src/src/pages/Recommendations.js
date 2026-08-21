import {heading,mediaCard} from "./pageUtils.js";
export function Recommendations(state,recs){
 const gold=recs.filter(x=>x.mmSelect==="Gold");
 return `${heading("Curated for you","Recommendations","Mostly your tastes, with one wildcard.")}
 <div class="section-heading"><h2>MM Select Gold</h2></div>
 ${gold.length?`<div class="grid-2">${gold.slice(0,4).map(x=>mediaCard(state,x)).join("")}</div>`:`<div class="empty-state">Nothing rates an MM Select Gold right now.</div>`}
 <div class="section-heading"><h2>One Wildcard</h2></div>
 ${recs.find(x=>x.mmSelect!=="Gold")?mediaCard(state,recs.find(x=>x.mmSelect!=="Gold")):""}`;
}
