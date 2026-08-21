import {heading} from "./pageUtils.js";
export function Franchises(state){
 const mine=state.franchises.filter(f=>state.profile.favoriteFranchises.includes(f.id)).sort((a,b)=>b.priority-a.priority).slice(0,4);
 const featured=state.franchises.sort((a,b)=>b.priority-a.priority)[0];
 return `${heading("Your worlds","Franchises","Stay immersed in the universes you actually care about.")}
 <section class="hero card"><div class="hero-content"><div class="eyebrow">FEATURED FRANCHISE</div><h2>${featured.title}</h2><p>${featured.description}</p><p><strong>Next:</strong> ${featured.next}</p></div></section>
 <div class="section-heading"><h2>Your Franchises</h2></div>
 <div class="grid-2">${mine.map(f=>`<article class="card"><div class="page-kicker">NEXT UP</div><h3>${f.title}</h3><p>${f.description}</p><p><strong>${f.next}</strong></p></article>`).join("")}</div>`;
}
