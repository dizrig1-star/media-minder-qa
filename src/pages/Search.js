import {heading,mediaCard} from "./pageUtils.js";

function haystack(item){
  return [
    item.title, ...(item.cast||[]), ...(item.genre||[]), ...(item.franchises||[]),
    item.summary, item.why, item.type
  ].filter(Boolean).join(" ").toLowerCase();
}

function matches(item, query){
  const tokens=query.split(/\s+/).filter(Boolean);
  const text=haystack(item);
  return tokens.every(token=>text.includes(token));
}

export function Search(state){
  const q=(state.query||"").trim().toLowerCase();
  const media=[...state.shows,...state.movies];
  const results=q?media.filter(x=>matches(x,q)):[];
  const franchiseResults=q?state.franchises.filter(f=>matches({
    title:f.title, summary:f.description, next:f.next,
    franchises:[f.next]
  },q)):[];
  return `${heading("The librarian","Search","Find something you already know you want.")}
  <div class="search-box"><input id="search-input" value="${state.query||""}" placeholder="Search shows, movies, actors or genres" aria-label="Search"><button class="btn" id="search-submit">Search</button></div>
  <div class="section-heading"><h2>${q?"Results":"Recent viewing shortcuts"}</h2></div>
  ${q?`${results.length?`<div class="stack">${results.map(x=>mediaCard(state,x)).join("")}</div>`:""}${franchiseResults.length?`<div class="section-heading"><h2>Franchise connections</h2></div><div class="stack">${franchiseResults.map(f=>`<article class="card media-row"><div class="details"><div class="page-kicker">${f.title}</div><h3>${f.next}</h3><p>${f.description}</p><p class="muted">Franchise connection</p></div></article>`).join("")}</div>`:""}${!results.length&&!franchiseResults.length?`<div class="empty-state"><h2>Not in our beta picks -- yet.</h2><p>This search only covers Media Minder's curated beta catalog, not everything on your platforms. Try Mystery, Political Thriller, or a title from Tonight or Recommendations.</p></div>`:""}`:`<div class="cluster"><button class="btn secondary" data-query="Mystery">Mystery</button><button class="btn secondary" data-query="Political Thriller">Political Thriller</button><button class="btn secondary" data-query="Denzel Washington">Denzel Washington</button></div>`}`;
}
