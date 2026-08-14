import {heading,mediaCard} from "./pageUtils.js";
export function Premieres(state){
 const items=[...state.shows].sort((a,b)=>a.premiere.localeCompare(b.premiere));
 return `${heading("The searchlights","Premieres","New series, returning seasons and special events coming into view.")}
 <div class="retro-rule" style="margin-bottom:1.5rem"></div>
 <div class="grid-2"><section class="stack">${items.map(x=>mediaCard(state,x)).join("")}</section>
 <aside class="card"><div class="page-kicker">Coming Soon</div><h2>Next two weeks</h2><p>Major returns and niche debuts get equal consideration here.</p></aside></div>`;
}
