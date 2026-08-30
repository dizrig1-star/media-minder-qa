import {appState,hydrateLocalState} from "./app/state.js";
import {currentRoute,startRouter,navigate} from "./app/router.js";
import {loadData} from "./services/dataService.js";
import {recommendations,mmChoice,pickWildcard} from "./services/recommendationService.js";
import {buildProfileFromInitialWatches} from "./services/onboardingService.js";
import {isUnlocked,unlock,renderGate} from "./app/accessGate.js";
import {Header} from "./components/layout/Header.js";
import {Navigation} from "./components/navigation/Navigation.js";
import {Footer} from "./components/layout/Footer.js";
import {openDetail} from "./components/media/Modal.js";

import {Landing} from "./pages/Landing.js";
import {Tonight} from "./pages/Tonight.js";
import {RecommendationsVisual as Recommendations} from "./pages/RecommendationsVisual.js";
import {Watchlist} from "./pages/Watchlist.js";
import {Calendar} from "./pages/Calendar.js?v=1.1.0-qa";
import {Premieres} from "./pages/Premieres.js";
import {Movies} from "./pages/Movies.js";
import {Franchises} from "./pages/Franchises.js";
import {Reviews} from "./pages/Reviews.js";
import {Settings} from "./pages/Settings.js";
import {Search} from "./pages/Search.js";

const pages={Landing,Tonight,Recommendations,Watchlist,Calendar,Premieres,Movies,Franchises,Reviews,Settings,Search};

function render(route){
 const state=appState.get();
 const data=[...state.shows,...state.movies];
 const recs=recommendations(data,state.profile,8);
 const choice=mmChoice(data,state.profile);
 const wildcard=pickWildcard(data,state.profile);
 const Page=pages[route==="landing"?"Landing":route[0].toUpperCase()+route.slice(1)];
 document.getElementById("app").innerHTML=`<div class="app-shell"><aside class="sidebar">${Header()}${Navigation(route)}</aside><div class="content-column"><main class="app-main">${Page(state,choice,recs,wildcard)}</main>${Footer()}</div></div>`;
 bind();
}

function bind(){
 document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",event=>{event.preventDefault();navigate(el.dataset.route)}));
 document.querySelectorAll("[data-watch]").forEach(el=>el.onclick=()=>appState.toggleWatchlist(el.dataset.watch));
 document.querySelectorAll("[data-rate-id]").forEach(el=>el.onclick=()=>appState.rate(el.dataset.rateId,Number(el.dataset.rating)));
 document.querySelectorAll("[data-progress-id]").forEach(el=>el.onchange=()=>appState.setProgress(el.dataset.progressId,Number(el.value)));
 document.querySelectorAll("[data-detail]").forEach(el=>{
   el.onclick=()=>{
     const state=appState.get();
     const item=[...state.shows,...state.movies].find(x=>x.id===el.dataset.detail);
     if(item) openDetail(item,state.platforms.find(p=>p.id===item.platform)?.name||item.platform);
   };
 });

 document.querySelectorAll("[data-watched]").forEach(el=>el.onclick=()=>appState.toggleWatched(el.dataset.watched));
 document.querySelectorAll("[data-skip]").forEach(el=>el.onclick=()=>appState.toggleNotInterested(el.dataset.skip));
 document.querySelectorAll("[data-mood]").forEach(el=>el.onclick=()=>appState.set({movieMood: el.dataset.mood || null}));

 document.querySelectorAll("[data-franchise-toggle]").forEach(el=>el.onclick=()=>appState.toggleFranchiseFavorite(el.dataset.franchiseToggle));
 const franchiseSearch=document.getElementById("franchise-search");
 if(franchiseSearch) franchiseSearch.oninput=()=>{
   const needle=franchiseSearch.value.trim().toLowerCase();
   document.querySelectorAll("[data-franchise-row]").forEach(row=>{
     row.hidden=!!needle && !row.dataset.franchiseText.includes(needle);
   });
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
   appState.set({query:input.value});
 };
 document.querySelectorAll("[data-query]").forEach(el=>el.onclick=()=>{
   appState.set({query:el.dataset.query});
 });
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
   appState.set(patch);
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
