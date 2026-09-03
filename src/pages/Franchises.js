import {heading,liveSearchSection} from "./pageUtils.js";

const ASSET = './assets/branding/approved/';

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function nextDatedEntry(state, franchise){
  const media = [...state.shows, ...state.movies];
  const match = media.find(x => x.franchises?.includes(franchise.id) && x.premiere);
  return match ? {date: match.premiere, title: match.title} : null;
}

// Real key art where we have it, with the same gradient-overlay treatment
// EditorialCard uses for posters (background image + poster class that drops
// the scanline texture). The transmission-tower mark still appears on every
// card -- as a small placed accent in the corner, the same idiom already
// used by .coming-soon-aside -- rather than as the dominant image, which is
// what was standing in for real art before any franchise had a poster.
function artPanel(item, className, accentClass, titleClass){
  const hasPoster = !!item.poster;
  const style = hasPoster
    ? ` style="background-image:linear-gradient(180deg, rgba(15,45,51,.15) 0%, rgba(15,45,51,.55) 55%, rgba(10,10,10,.72) 100%), url('${escapeHtml(item.poster)}');background-size:cover;background-position:center;"`
    : '';
  return `<div class="${className}${hasPoster ? ` ${className}--poster` : ''}"${style}>
    <img class="${accentClass}" src="${ASSET}Icon-transmission-tower.svg" alt="" aria-hidden="true">
    <span class="${titleClass}">${escapeHtml(item.title)}</span>
  </div>`;
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
    ${artPanel(featured, "hero-art", "hero-art-accent", "hero-art-title")}
    <div class="hero-content"><div class="eyebrow">FEATURED FRANCHISE</div><h2>${featured.title}</h2><p>${featured.description}</p><p><strong>Next:</strong> ${featured.next}</p></div>
  </div></section>

  <div class="section-heading"><h2>My Worlds</h2></div>
  <div class="search-box"><input id="franchise-search" value="${escapeHtml(state.query||"")}" placeholder="Find a franchise to follow" aria-label="Find a franchise"><button class="btn" id="franchise-search-submit">Search</button></div>
  <div class="grid-2" style="margin-top:var(--space-3)">${all.map(f=>`
    <article class="card" data-franchise-row data-franchise-text="${(f.title+" "+f.description+" "+f.next).toLowerCase()}">
      <div class="franchise-card">
        ${artPanel(f, "franchise-art", "franchise-art-accent", "franchise-art-title")}
        <div class="details">
          <div class="cluster" style="justify-content:space-between">
            <div class="page-kicker">${favorites.has(f.id)?"IN MY WORLDS":"NOT FOLLOWED"}</div>
            <button class="btn small ${favorites.has(f.id)?"secondary":"ghost"}" data-franchise-toggle="${f.id}">${favorites.has(f.id)?"Remove":"Add"}</button>
          </div>
          <h3>${f.title}</h3><p>${f.description}</p><p><strong>Next:</strong> ${f.next}</p>
        </div>
      </div>
    </article>`).join("")}</div>
  <div class="empty-state" id="franchise-search-empty" hidden><h2>We couldn't find that franchise.</h2><p>Try a broader search, or check back as we add more worlds to follow.</p></div>
  ${liveSearchSection(state,"Beyond your worlds")}

  <div class="section-heading"><h2>Prepare for What's Next</h2></div>
  ${mine.length?`<div class="stack">${upNext.map(({franchise,next})=>`
    <article class="card media-row"><div class="details">
      <div class="page-kicker">${franchise.title}</div>
      ${next?`<h3>${next.title}</h3><p class="muted">Premieres ${new Date(next.date+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric"})}</p>`
            :`<h3>${franchise.next}</h3><p class="muted">No confirmed date yet -- we'll surface it here as soon as one is set.</p>`}
    </div></article>`).join("")}</div>`
  :`<div class="empty-state">Add a franchise to My Worlds to see what's coming next.</div>`}`;
}
