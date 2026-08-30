import {heading,mediaCard} from "./pageUtils.js";
export function Watchlist(state){
 const items=state.watchlist.map(id=>state.shows.find(x=>x.id===id)||state.movies.find(x=>x.id===id)).filter(Boolean);
 return `${heading("Your queue","Watchlist","Keep the list useful. Remove what no longer earns a place.")}
 ${items.length?`<div class="stack watchlist-grid">${items.map(x=>mediaCard(state,x)).join("")}</div>`:`<div class="empty-state"><h2>Your watchlist is empty.</h2><p>Media Minder will keep the good stuff easy to find.</p><button class="btn" data-route="recommendations">See recommendations</button></div>`}`;
}
