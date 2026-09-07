import { EditorialCard } from '../components/recommendation/EditorialCard.js';

export function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function platformName(state,id){ return state.platforms.find(p=>p.id===id)?.name || id; }
export function allMedia(state){ return [...state.shows,...state.movies]; }
export function findMedia(state,id){ return allMedia(state).find(x=>x.id===id); }

// Everything eligible to be recommended or suggested for tonight: allMedia()
// minus anything the person has already marked watched or "not for me".
// findMedia/allMedia stay unfiltered on purpose -- Details, My Reviews, and
// the detail modal all need to resolve a title regardless of that status.
// This is what feeds recommendations()/mmChoice()/pickWildcard() so a title
// you've dismissed stops being suggested, on top of toggleWatched/
// toggleNotInterested (state.js) already dropping it from the Watchlist.
export function activeMedia(state){
  const watched = state.watched||[];
  const notInterested = state.notInterested||[];
  return allMedia(state).filter(x => !watched.includes(x.id) && !notInterested.includes(x.id));
}

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

// A live result can already be effectively on the Watchlist -- either the
// exact live item was adopted before (its own id landed in state.shows/
// state.movies -- see adoptLiveResult in state.js), or it matches an
// existing curated title by name and that curated entry is watchlisted
// instead (adoptLiveResult's own title-match dedup). Mirrors that same
// matching so the button doesn't offer to "Add" something already added.
function liveResultInWatchlist(state, item){
  if((state.watchlist||[]).includes(item.id)) return true;
  const title = (item.title||"").trim().toLowerCase();
  if(!title) return false;
  return [...(state.shows||[]), ...(state.movies||[])]
    .some(x => (state.watchlist||[]).includes(x.id) && (x.title||"").trim().toLowerCase() === title);
}

// Live results come from TMDB + OMDb, not the curated catalog, so they carry
// no rating/progress controls of their own -- but a person still needs a way
// to act on one, so "Add to Watchlist" adopts it into the catalog (see
// data-watch handling in main.js / adoptLiveResult in state.js), same
// button/attribute the curated cards use. Shared between Search.js and
// Franchises.js so both search boxes behave identically.
export function liveResultCard(state, item){
  const platform = item.platform ? platformName(state, item.platform) : null;
  const ratingLabel = item.mmRating !== null && item.mmRating !== undefined
    ? `MM Rating ${item.mmRating}/10${item.ratingSources ? ` <span class="muted">(IMDb ${item.ratingSources.imdb ?? '—'}, RT ${item.ratingSources.rottenTomatoes !== null && item.ratingSources.rottenTomatoes !== undefined ? item.ratingSources.rottenTomatoes + '%' : '—'})</span>` : ''}`
    : 'Not yet rated';
  const poster = item.poster
    ? `<img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)} poster" class="poster-img" loading="lazy">`
    : `<div class="poster" role="img" aria-label="${escapeHtml(item.title)} poster"></div>`;
  const inWatchlist = liveResultInWatchlist(state, item);
  const watchAction = inWatchlist
    ? `<span class="btn secondary" aria-disabled="true">Added to Watchlist ✓</span>`
    : `<button class="btn secondary" data-watch="${escapeHtml(item.id)}">Add to Watchlist</button>`;
  return `<article class="card media-row">
    ${poster}
    <div class="details">
      <div class="page-kicker">Live search &middot; not yet in your library</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="muted">${(item.genre||[]).join(' &middot; ')}${item.season ? ' &middot; Season ' + item.season : ''}${item.cast?.length ? ' &middot; ' + item.cast.map(escapeHtml).join(', ') : ''}</p>
      ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
      <p class="muted">${platform ? escapeHtml(platform) : 'Platform not confirmed'}${item.link ? ` &middot; <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Where to watch</a>` : ''}</p>
      <p>${ratingLabel}</p>
      <div class="cluster" style="margin-top:.6rem">${watchAction}</div>
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

// Movie Desk mood discovery: same shape as the search-page "beyond your
// library" section above, but keyed by movieMoodLiveKey (which mood the
// results belong to) instead of a free-text query, since a mood pick has no
// query string to match against.
export function movieMoodLiveSection(state, label){
  const mood = state.movieMood;
  const liveEnabled = !!(state.apiKeys && state.apiKeys.tmdb);
  if(!mood || !liveEnabled) return '';
  const matchesCurrentMood = state.movieMoodLiveKey === mood;
  const showLoading = !!(state.movieMoodLiveLoading && matchesCurrentMood);
  const results = (matchesCurrentMood && !state.movieMoodLiveLoading) ? (state.movieMoodLiveResults||[]) : [];
  if(showLoading) return `<div class="section-heading"><h2>Seeking out the best of this mood&hellip;</h2></div><p class="muted">Checking TMDB for exceptional titles beyond your library.</p>`;
  if(results.length) return `<div class="section-heading"><h2>${label}</h2></div><div class="stack">${results.map(x=>liveResultCard(state,x)).join("")}</div>`;
  return '';
}
