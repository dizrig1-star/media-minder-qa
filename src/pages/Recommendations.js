import {heading,mediaCard} from "./pageUtils.js";
export function Recommendations(state,choice,recs,wildcard){
 const gold=recs.filter(x=>x.mmSelect==="Gold");
 return `${heading("Curated for you","Recommendations","Mostly your tastes, with one wildcard.")}
 <div class="section-heading"><h2>MM Select Gold</h2></div>
 ${gold.length?`<div class="grid-2">${gold.slice(0,4).map(x=>mediaCard(state,x)).join("")}</div>`:"<div class='empty-state'>Nothing rates an MM Select Gold right now.</div>"}
 <div class="section-heading"><h2>One Wildcard</h2></div>
 <p class="muted">One title chosen deliberately outside your usual lane -- enough taste-match to trust, different enough to surprise you.</p>
 ${wildcard?`<div class="cluster"><span class="badge wildcard">One Wildcard</span></div>${mediaCard(state,wildcard)}`:"<div class='empty-state'>No wildcard pick in this beta's catalog yet.</div>"}`;
}
