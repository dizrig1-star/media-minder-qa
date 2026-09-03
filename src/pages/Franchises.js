import {heading} from "./pageUtils.js";

const ASSET = './assets/branding/approved/';

function nextDatedEntry(state, franchise){
  const media = [...state.shows, ...state.movies];
  const match = media.find(x => x.franchises?.includes(franchise.id) && x.premiere);
  return match ? {date: match.premiere, title: match.title} : null;
}

export function Franchises(state){
  const profile = state.profile || {};
  const favorites = new Set(profile.favoriteFranchises || []);
  const all = [...state.franchises].sort((a,b)=>b.priority-a.priority);
  const featured = all[0];
  const mine = all.filter(f => favorites.has(f.id));
  const upNext = mine
    .map(f => ({franchise:f, next:nextDatedEntry(state,f)}))
    .sort((a,b)=>{
      if(a.next && b.next) return a.next.date.localeCompare(b.next.date);
      if(a.next) return -1;
      if(b.next) return 1;
      return 0;
    });

  return `${heading("Your worlds","Franchises","Stay immersed in the universes you actually care about.")}
  <section class="hero card"><div class="hero-inner">
    <div class="hero-art"><img class="hero-art-icon" src="${ASSET}Icon-transmission-tower.svg" alt="" aria-hidden="true"><span class="hero-art-title">${featured.title}</span><span class="hero-art-footer">MEDIA MINDER</span></div>
    <div class="hero-content"><div class="eyebrow">FEATURED FRANCHISE</div><h2>${featured.title}</h2><p>${featured.description}</p><p><strong>Next:</strong> ${featured.next}</p></div>
  </div></section>

  <div class="section-heading"><h2>My Worlds</h2></div>
  <div class="search-box"><input id="franchise-search" placeholder="Find a franchise to follow" aria-label="Find a franchise"></div>
  <div class="grid-2" style="margin-top:var(--space-3)">${all.map(f=>`
    <article class="card" data-franchise-row data-franchise-text="${(f.title+" "+f.description+" "+f.next).toLowerCase()}">
      <div class="franchise-card">
        <div class="franchise-art"><img class="franchise-art-icon" src="${ASSET}Icon-transmission-tower.svg" alt="" aria-hidden="true"><span class="franchise-art-title">${f.title}</span></div>
        <div class="details">
          <div class="cluster" style="justify-content:space-between">
            <div class="page-kicker">${favorites.has(f.id)?"IN MY WORLDS":"NOT FOLLOWED"}</div>
            <button class="btn small ${favorites.has(f.id)?"secondary":"ghost"}" data-franchise-toggle="${f.id}">${favorites.has(f.id)?"Remove":"Add"}</button>
          </div>
          <h3>${f.title}</h3><p>${f.description}</p><p><strong>Next:</strong> ${f.next}</p>
        </div>
      </div>
    </article>`).join("")}</div>

  <div class="section-heading"><h2>Prepare for What's Next</h2></div>
  ${mine.length?`<div class="stack">${upNext.map(({franchise,next})=>`
    <article class="card media-row"><div class="details">
      <div class="page-kicker">${franchise.title}</div>
      ${next?`<h3>${next.title}</h3><p class="muted">Premieres ${new Date(next.date+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}</p>`
            :`<h3>${franchise.next}</h3><p class="muted">No confirmed date yet -- we'll surface it here as soon as one is set.</p>`}
    </div></article>`).join("")}</div>`
  :`<div class="empty-state">Add a franchise to My Worlds to see what's coming next.</div>`}`;
}
