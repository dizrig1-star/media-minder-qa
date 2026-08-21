import {heading,mediaCard} from "./pageUtils.js";
export function Movies(state){
 return `${heading("Feature Presentation","Movie Night Picks","Recommendations for the mood you're in.")}
 <div class="grid-2"><section class="stack">${state.movies.map(x=>mediaCard(state,x)).join("")}</section>
 <aside class="card"><div class="page-kicker">MM's Movie Desk</div><h2>Pick a mood.</h2><p>Mystery. Suspense. Clever crime. A little danger without a two-hour search.</p></aside></div>`;
}
