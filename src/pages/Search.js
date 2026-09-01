import {heading,mediaCard,platformName} from "./pageUtils.js";

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

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Live results come from TMDB + OMDb, not the curated catalog, so they don't
// carry watchlist/rating controls -- an "add to watchlist" tap on a title
// that isn't in state.shows/state.movies would silently do nothing useful.
// This renders them as read-only discovery cards instead, reusing the same
// card/media-row classes the franchise-connections list below already uses.
function liveResultCard(state, item){
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

export function Search(state){
  const q=(state.query||"").trim().toLowerCase();
  const media=[...state.shows,...state.movies];
  const results=q?media.filter(x=>matches(x,q)):[];
  const franchiseResults=q?state.franchises.filter(f=>matches({
    title:f.title, summary:f.description, next:f.next,
    franchises:[f.next]
  },q)):[];

  const liveEnabled = !!(state.apiKeys && state.apiKeys.tmdb);
  const liveMatchesCurrentQuery = state.liveSearchQuery === (state.query||"").trim();
  const showLiveLoading = liveEnabled && q && state.liveSearchLoading && liveMatchesCurrentQuery;
  const liveResults = (liveEnabled && q && liveMatchesCurrentQuery && !state.liveSearchLoading) ? (state.liveSearchResults||[]) : [];

  const liveSection = !q ? '' : showLiveLoading
    ? `<div class="section-heading"><h2>Searching further afield&hellip;</h2></div><p class="muted">Checking TMDB and OMDb for titles beyond your library.</p>`
    : liveResults.length
      ? `<div class="section-heading"><h2>Beyond your library</h2></div><div class="stack">${liveResults.map(x=>liveResultCard(state,x)).join("")}</div>`
      : liveEnabled
        ? ''
        : `<div class="section-heading"><h2>Beyond your library</h2></div><p class="muted">Add a free TMDB API key in Settings to also search titles you haven't added yet.</p>`;

  return `${heading("The librarian","Search","Find something you already know you want.")}
  <div class="search-box"><input id="search-input" value="${state.query||""}" placeholder="Search shows, movies, actors or genres" aria-label="Search"><button class="btn" id="search-submit">Search</button></div>
  <div class="section-heading"><h2>${q?"Results":"Recent viewing shortcuts"}</h2></div>
  ${q?`${results.length?`<div class="stack">${results.map(x=>mediaCard(state,x)).join("")}</div>`:""}${franchiseResults.length?`<div class="section-heading"><h2>Franchise connections</h2></div><div class="stack">${franchiseResults.map(f=>`<article class="card media-row"><div class="details"><div class="page-kicker">${f.title}</div><h3>${f.next}</h3><p>${f.description}</p><p class="muted">Franchise connection</p></div></article>`).join("")}</div>`:""}${!results.length&&!franchiseResults.length&&!liveResults.length&&!showLiveLoading?`<div class="empty-state"><h2>We couldn't find that title.</h2><p>Try a broader search.</p></div>`:""}${liveSection}`:`<div class="cluster"><button class="btn secondary" data-query="Mystery">Mystery</button><button class="btn secondary" data-query="Political Thriller">Political Thriller</button><button class="btn secondary" data-query="Denzel Washington">Denzel Washington</button></div>`}`;
}
