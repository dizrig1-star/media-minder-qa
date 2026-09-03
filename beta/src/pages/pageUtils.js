import { EditorialCard } from '../components/recommendation/EditorialCard.js';

export function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function platformName(state,id){ return state.platforms.find(p=>p.id===id)?.name || id; }
export function allMedia(state){ return [...state.shows,...state.movies]; }
export function findMedia(state,id){ return allMedia(state).find(x=>x.id===id); }

export function mediaCard(state, item, kindOverride, tierOverride){
  const platform = platformName(state, item.platform);
  const inWatchlist = state.watchlist.includes(item.id);
  const kind = kindOverride || (inWatchlist ? 'watching' : 'library');
  const tier = tierOverride || (kind === 'library' ? 'compact' : undefined);
  const extraBadges = (kind !== 'select' && item.mmSelect) ? ['select'] : [];
  return EditorialCard(item, platform, kind, state, tier, extraBadges);
}

export function heading(kicker,title,desc=''){return `<div class="page-header"><div><div class="page-kicker">${kicker}</div><h1 class="page-title">${title}</h1>${desc?`<p class="muted">${desc}</p>`:''}</div></div>`;}
export function timeGreeting(date=new Date()){
  const hour=date.getHours();
  if(hour<5) return "Good night";
  if(hour<12) return "Good morning";
  if(hour<17) return "Good afternoon";
  return "Good evening";
}

// Live results come from TMDB + OMDb, not the curated catalog, so they don't
// carry watchlist/rating controls -- an "add to watchlist" tap on a title
// that isn't in state.shows/state.movies would silently do nothing useful.
// This renders them as read-only discovery cards instead, reusing the same
// card/media-row classes the rest of the app already uses. Shared between
// Search.js and Franchises.js so both search boxes behave identically.
export function liveResultCard(state, item){
  const platform = item.platform ? platformName(state, item.platform) : null;
  const ratingLabel = item.mmRating !== null && item.mmRating !== undefined
    ? `MM Rating ${item.mmRating}/10${item.ratingSources ? ` <span class="muted">(IMDb ${item.ratingSources.imdb ?? '—'}, RT ${item.ratingSources.rottenTomatoes !== null && item.ratingSources.rottenTomatoes !== undefined ? item.ratingSources.rottenTomatoes + '%' : '—'})</span>` : ''}`
    : 'Not yet rated';
  const poster = item.poster
    ? `<img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)} poster" class="poster-img" loading="lazy">`
    : `<div class="poster" role="img" aria-label="${escapeHtml(item.title)} poster"></div>`;
  return `<article class="card media-row">
    ${poster}
    <div class="details">
      <div class="page-kicker">Live search &middot; not yet in your library</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="muted">${(item.genre||[]).join(' &middot; ')}${item.cast?.length ? ' &middot; ' + item.cast.map(escapeHtml).join(', ') : ''}</p>
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
      <p class="muted">${platform ? escapeHtml(platform) : 'Platform not confirmed'}${item.link ? ` &middot; <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Where to watch</a>` : ''}</p>
      <p>${ratingLabel}</p>
    </div>
  </article>`;
}

// Both Search.js and Franchises.js run the same "beyond your library" logic
// against state.query/liveSearchQuery/liveSearchResults -- computed once here
// so the gating conditions (query present, key configured, response matches
// the current query, still loading) can't drift between the two pages.
export function getLiveSearchState(state){
  const q=(state.query||"").trim();
  const liveEnabled = !!(state.apiKeys && state.apiKeys.tmdb);
  const liveMatchesCurrentQuery = state.liveSearchQuery === q;
  const showLiveLoading = !!(liveEnabled && q && state.liveSearchLoading && liveMatchesCurrentQuery);
  const liveResults = (liveEnabled && q && liveMatchesCurrentQuery && !state.liveSearchLoading) ? (state.liveSearchResults||[]) : [];
  return {q, liveEnabled, showLiveLoading, liveResults};
}

// The "beyond your library"/"beyond your worlds" section itself -- same
// markup wherever it appears, just a different section label.
export function liveSearchSection(state, label){
  const {q, liveEnabled, showLiveLoading, liveResults} = getLiveSearchState(state);
  if(!q) return '';
  if(showLiveLoading) return `<div class="section-heading"><h2>Searching further afield&hellip;</h2></div><p class="muted">Checking TMDB and OMDb for titles beyond your library.</p>`;
  if(liveResults.length) return `<div class="section-heading"><h2>${label}</h2></div><div class="stack">${liveResults.map(x=>liveResultCard(state,x)).join("")}</div>`;
  if(liveEnabled) return '';
  return `<div class="section-heading"><h2>${label}</h2></div><p class="muted">Add a free TMDB API key in Settings to also search titles you haven't added yet.</p>`;
}
