import {heading,mediaCard} from "./pageUtils.js";
export function Search(state){
 const q=(state.query||"").trim().toLowerCase();
 const all=[...state.shows,...state.movies];
 const results=q?all.filter(x=>[x.title,...(x.cast||[]),...(x.genre||[])].join(" ").toLowerCase().includes(q)):[];
 return `${heading("The librarian","Search","Find something you already know you want.")}
 <div class="search-box"><input id="search-input" value="${state.query||""}" placeholder="Search shows, movies, actors or genres" aria-label="Search"><button class="btn" id="search-submit">Search</button></div>
 <div class="section-heading"><h2>${q?"Results":"Recent viewing shortcuts"}</h2></div>
 ${q?(results.length?`<div class="stack">${results.map(x=>mediaCard(state,x)).join("")}</div>`:`<div class="empty-state"><h2>We couldn't find that title.</h2><p>Try a broader search.</p></div>`):`<div class="cluster"><button class="btn secondary" data-query="Mystery">Mystery</button><button class="btn secondary" data-query="Political Thriller">Political Thriller</button><button class="btn secondary" data-query="Denzel Washington">Denzel Washington</button></div>`}`;
}
