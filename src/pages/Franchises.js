import {heading,liveSearchSection} from "./pageUtils.js?v=1.1.0-qa";

const ASSET = './assets/branding/approved/';

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function nextDatedEntry(state, franchise){
  const media = [...state.shows, ...state.movies];
  const match = media.find(x => x.franchises?.includes(franchise.id) && x.premiere);
  return match ? {date: match.premiere, title: match.title} : null;
}

// Hero art (Featured Franchise): real key art where we have it, same
// gradient-overlay treatment EditorialCard uses for posters. The
// transmission-tower mark is a fallback accent for franchises with no key
// art (mirrors Landing.js/EditorialCard.js) -- it must use the -icon class
// (sized/positioned in components.css), not -accent, which has no matching
// rule and rendered at native SVG size, oversized and on top of real posters.
function heroArt(item){
  const hasPoster = !!item.poster;
  const style = hasPoster
    ? ` style="background-image:linear-gradient(180deg, rgba(15,45,51,.15) 0%, rgba(15,45,51,.55) 55%, rgba(10,10,10,.72) 100%), url('${escapeHtml(item.poster)}');background-size:cover;background-position:center;"`
    : '';
  return `<div class="hero-art${hasPoster ? ' hero-art--poster' : ''}" aria-label="${escapeHtml(item.title)} visual"${style}>
    ${hasPoster ? '' : `<img class="hero-art-icon" src="${ASSET}Icon-transmission-tower.svg" alt="" aria-hidden="true">`}
    <span class="hero-art-title">${escapeHtml(item.title)}</span>
    <span class="hero-art-footer">MEDIA MINDER</span>
  </div>`;
}

// My Worlds cards: the same editorial-card markup/classes Tonight's cards
// use (banner strip, art panel with MEDIA MINDER footer, Playfair title),
// hand-authored rather than routed through EditorialCard() -- franchises
// don't have cast/rating/watchlist/episode data, so the component's media-
// item assumptions don't fit, but the visual language should still match.
function franchiseCard(f, isFollowing){
  const hasPoster = !!f.poster;
  const style = hasPoster
    ? ` style="background-image:linear-gradient(180deg, rgba(15,45,51,.15) 0%, rgba(15,45,51,.55) 55%, rgba(10,10,10,.72) 100%), url('${escapeHtml(f.poster)}');background-size:cover;background-position:center;"`
    : '';
  const text = (f.title+" "+f.description+" "+f.next).toLowerCase();
  return `<article class="editorial-card editorial-card--secondary" data-franchise-row data-franchise-text="${escapeHtml(text)}">
    <div class="editorial-banner"><span class="editorial-banner-mark">✦</span>${isFollowing?"IN MY WORLDS":"NOT FOLLOWED"}<span class="editorial-banner-mark">✦</span></div>
    <div class="editorial-card-inner">
      <div class="editorial-art${hasPoster ? ' editorial-art--poster' : ''}" aria-label="${escapeHtml(f.title)} visual"${style}>
        ${hasPoster ? '' : `<img class="editorial-art-icon" src="${ASSET}Icon-transmission-tower.svg" alt="" aria-hidden="true">`}
        <div class="editorial-art-title">${escapeHtml(f.title)}</div>
        <div class="editorial-art-footer">MEDIA MINDER</div>
      </div>
      <div class="editorial-card-content">
        <h3>${escapeHtml(f.title)}</h3>
        <p class="editorial-summary">${escapeHtml(f.description)}</p>
        <p class="editorial-meta"><strong>Next:</strong> ${escapeHtml(f.next)}</p>
        <div class="editorial-actions">
          <button class="btn small ${isFollowing?"secondary":"ghost"}" data-franchise-toggle="${escapeHtml(f.id)}">${isFollowing?"Remove":"Add"}</button>
        </div>
      </div>
    </div>
  </article>`;
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
    ${heroArt(featured)}
    <div class="hero-content"><div class="eyebrow">FEATURED FRANCHISE</div><h2>${featured.title}</h2><p>${featured.description}</p><p><strong>Next:</strong> ${featured.next}</p></div>
  </div></section>

  <div class="section-heading"><h2>My Worlds</h2></div>
  <div class="search-box"><input id="franchise-search" value="${escapeHtml(state.query||"")}" placeholder="Find a franchise to follow" aria-label="Find a franchise"><button class="btn" id="franchise-search-submit">Search</button></div>
  <div class="stack editorial-stack" style="margin-top:var(--space-3)">${all.map(f=>franchiseCard(f, favorites.has(f.id))).join("")}</div>
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
