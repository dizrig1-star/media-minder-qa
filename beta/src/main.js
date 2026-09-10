import {appState,hydrateLocalState} from "./app/state.js";
import {currentRoute,startRouter,navigate} from "./app/router.js";
import {loadData} from "./services/dataService.js";
import {recommendations,mmChoice,resolveWildcard} from "./services/recommendationService.js";
import {buildProfileFromInitialWatches} from "./services/onboardingService.js";
import {isUnlocked,unlock,renderGate} from "./app/accessGate.js";
import {Header} from "./components/layout/Header.js";
import {Navigation} from "./components/navigation/Navigation.js";
import {Footer} from "./components/layout/Footer.js";
import {openDetail} from "./components/media/Modal.js";
import {liveSearch, discoverExceptional, TMDB_MOVIE_GENRE_IDS, fetchSeasonEpisodeDrops, discoverWildcardCandidates} from "./lib/liveSearch.mjs";
import {activeMedia} from "./pages/pageUtils.js";

import {Landing} from "./pages/Landing.js";
import {Tonight} from "./pages/Tonight.js";
import {RecommendationsVisual as Recommendations} from "./pages/RecommendationsVisual.js";
import {Watchlist} from "./pages/Watchlist.js";
import {Calendar} from "./pages/Calendar.js?v=1.1.0-qa";
import {Premieres} from "./pages/Premieres.js";
import {Movies} from "./pages/Movies.js";
import {Franchises} from "./pages/Franchises.js?v=1.1.0-qa";
import {Reviews} from "./pages/Reviews.js";
import {Settings} from "./pages/Settings.js";
import {Search} from "./pages/Search.js?v=1.1.0-qa";

const pages={Landing,Tonight,Recommendations,Watchlist,Calendar,Premieres,Movies,Franchises,Reviews,Settings,Search};

function render(route){
 const state=appState.get();
 // activeMedia() excludes anything already marked watched or "not for me"
 // -- otherwise a dismissed title could keep resurfacing as a recommendation
 // or tonight's pick indefinitely.
 const data=activeMedia(state);
 const recs=recommendations(data,state.profile,8);
 const choice=mmChoice(data,state.profile);
 const wildcard=resolveWildcard(state,data);
 const Page=pages[route==="landing"?"Landing":route[0].toUpperCase()+route.slice(1)];
 document.getElementById("app").innerHTML=`<div class="app-shell"><aside class="sidebar">${Header()}${Navigation(route)}</aside><div class="content-column"><main class="app-main">${Page(state,choice,recs,wildcard)}</main>${Footer()}</div></div>`;
 bind();
}

// Runs a search: shows local catalog results instantly (via the query state
// change), and separately kicks off a live TMDB/OMDb search in the
// background if the person has entered a TMDB key in Settings. liveSearchQuery
// doubles as a guard against stale results -- if the person searches again
// before this resolves, Search.js will simply ignore whichever response
// lands with an outdated liveSearchQuery.
function triggerSearch(rawQuery){
 const trimmed=(rawQuery||"").trim();
 const state=appState.get();
 const hasTmdbKey=!!(state.apiKeys && state.apiKeys.tmdb && trimmed);
 appState.set({
   query: rawQuery,
   liveSearchQuery: trimmed,
   liveSearchLoading: hasTmdbKey,
   liveSearchResults: []
 });
 if(!hasTmdbKey) return;
 liveSearch(trimmed, {tmdbApiKey: state.apiKeys.tmdb, omdbApiKey: state.apiKeys.omdb})
   .then(results => appState.set({liveSearchResults: results, liveSearchLoading: false}))
   .catch(() => appState.set({liveSearchResults: [], liveSearchLoading: false}));
}

// Maps a Movie Desk mood to TMDB's own genre ids so "beyond your library"
// can browse by genre (discoverExceptional) without a free-text query.
// Moods that don't map cleanly to any real TMDB genre (light/epic mix
// several loosely) fall back to the closest single genre rather than
// guessing at a combination that might return nothing.
const MOOD_TMDB_GENRES = {
  mystery: [TMDB_MOVIE_GENRE_IDS.Mystery],
  light: [TMDB_MOVIE_GENRE_IDS.Comedy],
  epic: [TMDB_MOVIE_GENRE_IDS.Adventure],
  drama: [TMDB_MOVIE_GENRE_IDS.Drama],
  fantasy: [TMDB_MOVIE_GENRE_IDS.Fantasy],
  documentary: [TMDB_MOVIE_GENRE_IDS.Documentary],
  romance: [TMDB_MOVIE_GENRE_IDS.Romance]
};

// Runs when a Movie Desk mood is picked: shows the local catalog match
// instantly (via the movieMood state change), and separately asks TMDB for
// a small number of exceptional (high-rated, well-voted) titles in that
// genre that aren't already part of the curated library -- same
// stale-response guard pattern as triggerSearch above, keyed on mood instead
// of query text.
function triggerMoodDiscovery(mood){
 const state=appState.get();
 if(!mood || !MOOD_TMDB_GENRES[mood]){
   appState.set({movieMoodLiveKey: null, movieMoodLiveLoading: false, movieMoodLiveResults: []});
   return;
 }
 const hasTmdbKey=!!(state.apiKeys && state.apiKeys.tmdb);
 appState.set({movieMoodLiveKey: mood, movieMoodLiveLoading: hasTmdbKey, movieMoodLiveResults: []});
 if(!hasTmdbKey) return;
 const excludeTitles = state.movies.map(m=>m.title);
 discoverExceptional(MOOD_TMDB_GENRES[mood], {tmdbApiKey: state.apiKeys.tmdb, excludeTitles})
   .then(results => appState.set({movieMoodLiveResults: results, movieMoodLiveLoading: false}))
   .catch(() => appState.set({movieMoodLiveResults: [], movieMoodLiveLoading: false}));
}

function bind(){
 document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",event=>{event.preventDefault();navigate(el.dataset.route)}));
 // Mobile only (see .return-to-menu in layout.css): on narrow widths the
 // sidebar nav collapses into a strip pinned to the top of the page, so
 // after scrolling through a long page there's no way back to it without
 // this. Smooth-scrolls the whole page back to the top, where the nav lives.
 const returnToMenu=document.querySelector("[data-return-to-menu]");
 if(returnToMenu) returnToMenu.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
 document.querySelectorAll("[data-watch]").forEach(el=>el.onclick=async ()=>{
   const id=el.dataset.watch;
   const state=appState.get();
   const knownToCatalog=state.shows.some(s=>s.id===id)||state.movies.some(m=>m.id===id);
   if(!knownToCatalog){
     // Not in the curated catalog -- this is a live TMDB/OMDb search result
     // (see liveResultCard in pageUtils.js). Adopting it merges it into the
     // catalog and watchlist together; plain toggleWatchlist would just
     // write an id nothing resolves to. See adoptLiveResult in state.js.
     const liveItem=[...(state.liveSearchResults||[]),...(state.movieMoodLiveResults||[])].find(x=>x.id===id);
     if(liveItem){
       // A live series has no episodeDrops (TMDB search only gives a season
       // count, not air dates), so it could never show up on Calendar --
       // fetch the current season's real air dates now, at adoption time,
       // rather than for every search result. Best-effort: if there's no
       // TMDB key, the fetch fails, or nothing comes back, it still adopts
       // -- just without Calendar support, same as before this existed.
       let episodeDrops;
       const tmdbIdMatch = liveItem.type==="series" ? /^live-tv-(\d+)$/.exec(liveItem.id) : null;
       if(tmdbIdMatch && liveItem.season && state.apiKeys?.tmdb){
         el.disabled = true;
         const originalLabel = el.textContent;
         el.textContent = "Adding…";
         episodeDrops = await fetchSeasonEpisodeDrops(tmdbIdMatch[1], liveItem.season, state.apiKeys.tmdb);
         el.disabled = false;
         el.textContent = originalLabel;
       }
       appState.adoptLiveResult(episodeDrops?.length ? {...liveItem, episodeDrops} : liveItem);
       return;
     }
   }
   appState.toggleWatchlist(id);
 });
 document.querySelectorAll("[data-rate-id]").forEach(el=>el.onclick=()=>{
   appState.rate(el.dataset.rateId,Number(el.dataset.rating));
   triggerWildcardDiscovery();
 });
 document.querySelectorAll("[data-progress-id]").forEach(el=>el.onchange=()=>appState.setProgress(el.dataset.progressId,Number(el.value)));
 document.querySelectorAll("[data-detail]").forEach(el=>{
   el.onclick=()=>{
     const state=appState.get();
     const id=el.dataset.detail;
     // The Wildcard card (see resolveWildcard/triggerWildcardDiscovery) can
     // be a live TMDB-correlation candidate that was never adopted into the
     // catalog -- its id (e.g. "live-movie-12345") won't resolve against
     // state.shows/state.movies, so Details would silently do nothing.
     // openDetail only needs title/summary/cast/etc, which live candidates
     // already carry (see buildWildcardCandidate in liveSearch.mjs), so fall
     // back to the live pools the same way the data-watch handler does.
     const item=[...state.shows,...state.movies].find(x=>x.id===id)
       || [...(state.wildcardCandidates||[]),...(state.liveSearchResults||[]),...(state.movieMoodLiveResults||[])].find(x=>x.id===id);
     if(item) openDetail(item,state.platforms.find(p=>p.id===item.platform)?.name||item.platform);
   };
 });

 document.querySelectorAll("[data-watched]").forEach(el=>el.onclick=()=>appState.toggleWatched(el.dataset.watched));
 document.querySelectorAll("[data-skip]").forEach(el=>el.onclick=()=>appState.toggleNotInterested(el.dataset.skip));
 document.querySelectorAll("[data-mood]").forEach(el=>el.onclick=()=>{
   const mood=el.dataset.mood || null;
   appState.set({movieMood: mood});
   triggerMoodDiscovery(mood);
 });

 document.querySelectorAll("[data-franchise-toggle]").forEach(el=>el.onclick=()=>appState.toggleFranchiseFavorite(el.dataset.franchiseToggle));
 const franchiseSearch=document.getElementById("franchise-search");
 if(franchiseSearch) franchiseSearch.oninput=()=>{
   const needle=franchiseSearch.value.trim().toLowerCase();
   let anyVisible=false;
   document.querySelectorAll("[data-franchise-row]").forEach(row=>{
     const matches=!needle || row.dataset.franchiseText.includes(needle);
     row.hidden=!matches;
     if(matches) anyVisible=true;
   });
   // Mirrors Search.js: only show the "nothing found" message once there's an
   // actual query with zero matches, not on page load with an empty box.
   const emptyState=document.getElementById("franchise-search-empty");
   if(emptyState) emptyState.hidden=!needle || anyVisible;
 };

 document.querySelectorAll("[data-genre-toggle]").forEach(el=>el.onclick=()=>appState.toggleFavoriteGenre(el.dataset.genreToggle));
 document.querySelectorAll("[data-platform-toggle]").forEach(el=>el.onclick=()=>appState.toggleFavoritePlatform(el.dataset.platformToggle));

 document.querySelectorAll("[data-reviews-sort]").forEach(el=>el.onclick=()=>appState.set({reviewsSort: el.dataset.reviewsSort}));

 const onboardingSearch=document.getElementById("onboarding-search");
 if(onboardingSearch) onboardingSearch.oninput=()=>{
   const needle=onboardingSearch.value.trim().toLowerCase();
   document.querySelectorAll("[data-onboarding-item]").forEach(row=>{
     row.hidden=!!needle && !row.dataset.onboardingText.includes(needle);
   });
 };
 document.querySelectorAll("[data-onboarding-star]").forEach(el=>el.onclick=()=>{
   const id=el.dataset.onboardingStar;
   const rating=Number(el.dataset.rating);
   const checkbox=document.querySelector(`[data-onboarding-watch="${id}"]`);
   const hidden=document.querySelector(`[data-onboarding-rating="${id}"]`);
   const label=document.querySelector(`[data-onboarding-rating-label="${id}"]`);
   if(checkbox) checkbox.checked=true;
   if(hidden) hidden.value=String(rating);
   if(label) label.textContent=`${rating} star${rating===1?"":"s"}`;
   document.querySelectorAll(`[data-onboarding-star="${id}"]`).forEach(star=>star.classList.toggle("selected",Number(star.dataset.rating)<=rating));
 });
 const onboardingButton=document.querySelector("[data-onboarding-complete]");
 if(onboardingButton) onboardingButton.onclick=()=>{
   const selected=[...document.querySelectorAll("[data-onboarding-watch]:checked")].map(el=>el.dataset.onboardingWatch);
   if(!selected.length) return;
   const ratings={};
   selected.forEach(id=>{
     const input=document.querySelector(`[data-onboarding-rating="${id}"]`);
     ratings[id]=Number(input?.value||0);
   });
   const state=appState.get();
   const items=selected.map(id=>state.shows.find(show=>show.id===id)).filter(Boolean);
   const profile=buildProfileFromInitialWatches(state.profile,items,ratings);
   appState.completeOnboarding(selected,ratings,profile);
 };

 const search=document.getElementById("search-submit");
 if(search) search.onclick=()=>{
   const input=document.getElementById("search-input");
   triggerSearch(input.value);
 };
 document.querySelectorAll("[data-query]").forEach(el=>el.onclick=()=>{
   triggerSearch(el.dataset.query);
 });
 // Returns the Search page to its pre-search state: clears the input, the
 // catalog-match results (query-driven, so this alone empties them), and
 // the live TMDB/OMDb search state, so a stale "Searching further afield"
 // or old results can't linger once the box is empty again.
 const searchClear=document.getElementById("search-clear");
 if(searchClear) searchClear.onclick=()=>{
   appState.set({query:"", liveSearchQuery:"", liveSearchLoading:false, liveSearchResults:[]});
 };

 // "Find a franchise to follow" mirrors the main Search page: the instant
 // oninput filter above only ever covers the handful of curated franchises,
 // so this button runs the same TMDB/OMDb live search Search.js uses, via
 // the same triggerSearch/query state -- a franchise like Doctor Who that
 // isn't in franchises.json can still turn up under "Beyond your worlds."
 const franchiseSearchSubmit=document.getElementById("franchise-search-submit");
 if(franchiseSearchSubmit) franchiseSearchSubmit.onclick=()=>{
   const input=document.getElementById("franchise-search");
   triggerSearch(input.value);
 };

 const saveApiKeys=document.getElementById("settings-save-api-keys");
 if(saveApiKeys) saveApiKeys.onclick=()=>{
   const tmdbInput=document.getElementById("settings-tmdb-key");
   const omdbInput=document.getElementById("settings-omdb-key");
   appState.setApiKeys(tmdbInput?.value, omdbInput?.value);
   const savedLabel=document.getElementById("settings-api-keys-saved");
   if(savedLabel){
     savedLabel.hidden=false;
     setTimeout(()=>{savedLabel.hidden=true;}, 2000);
   }
 };
}

// The wildcard's own 5-star-correlation pool (see resolveWildcard,
// recommendationService.js): keyed on the sorted set of 5-star-rated ids so
// a new (or removed) 5-star rating triggers a fresh pull, but re-rendering
// or navigating around the app doesn't re-fetch on every render. Runs once
// at startup (if a TMDB key + 5-star ratings already exist) and again
// whenever a rating changes. Best-effort: no key, no 5-star ratings yet, or
// a failed fetch all just leave wildcardCandidates empty, and resolveWildcard
// falls back to the static curated pool.
function fiveStarKey(state){
 return Object.entries(state.ratings||{}).filter(([,r])=>r===5).map(([id])=>id).sort().join(",");
}
async function triggerWildcardDiscovery(){
 const state=appState.get();
 const key=fiveStarKey(state);
 if(key===state.wildcardCandidatesKey && !state.wildcardCandidatesLoading) return;
 if(!key || !state.apiKeys?.tmdb){
   appState.set({wildcardCandidates:[], wildcardCandidatesKey:key, wildcardCandidatesLoading:false});
   return;
 }
 appState.set({wildcardCandidatesLoading:true});
 // Most-recent 5 five-star ratings only -- bounds how many TMDB calls one
 // adoption/rating spree can trigger; a title's own "recommendations" don't
 // meaningfully improve by also querying a 20th 5-star rating.
 const fiveStarIds=key.split(",").slice(-5);
 const fiveStarItems=fiveStarIds.map(id=>[...state.shows,...state.movies].find(x=>x.id===id)).filter(Boolean);
 const excludeTitles=[...state.shows,...state.movies].map(m=>m.title);
 const candidates=await discoverWildcardCandidates(fiveStarItems,{tmdbApiKey:state.apiKeys.tmdb,omdbApiKey:state.apiKeys.omdb,excludeTitles});
 appState.set({wildcardCandidates:candidates, wildcardCandidatesKey:key, wildcardCandidatesLoading:false});
}

async function init(){
 hydrateLocalState();
 document.getElementById("app").innerHTML="<div class='app-main'><div class='card'><h1>Media Minder</h1><p>Setting the table...</p></div></div>";
 try{
   const data=await loadData();
   // A profile hydrated from localStorage represents real, saved user edits
   // (Settings, franchise favorites, taste mode, etc.). profile.json is only
   // the seed/demo profile for first-time users -- once someone has their own
   // saved profile, loadData()'s fresh copy of profile.json must not clobber it.
   const hydratedProfile = appState.get().profile;
   const patch = {...data, dataReady:true};
   if(hydratedProfile) patch.profile = hydratedProfile;
   // Titles adopted from live search (see adoptLiveResult in state.js) live
   // only in the persisted adoptedTitles list -- shows/movies always reload
   // fresh from JSON above and would otherwise "forget" them every visit,
   // leaving their id in watchlist pointing at nothing.
   const adopted = appState.get().adoptedTitles || [];
   for(const item of adopted){
     const bucket = item.type === "series" ? "shows" : "movies";
     if(!patch[bucket].some(x=>x.id===item.id)) patch[bucket]=[...patch[bucket], item];
   }
   appState.set(patch);
   triggerWildcardDiscovery();
   startRouter(render);
 }catch(error){
   document.getElementById("app").innerHTML=`<main class="app-main"><div class="empty-state"><h1>Media Minder couldn't load.</h1><p>Please run the application through a local web server.</p></div></main>`;
   console.error(error);
 }
}
if(isUnlocked()){
 appState.subscribe(()=>render(currentRoute()));
 init();
}else{
 renderGate(()=>{
   unlock();
   appState.subscribe(()=>render(currentRoute()));
   init();
 });
}
