import {appState,hydrateLocalState} from "./app/state.js";
import {currentRoute,startRouter,navigate} from "./app/router.js";
import {loadData} from "./services/dataService.js";
import {recommendations,mmChoice} from "./services/recommendationService.js";
import {buildProfileFromInitialWatches} from "./services/onboardingService.js";
import {Header} from "./components/layout/Header.js";
import {Navigation} from "./components/navigation/Navigation.js";
import {Footer} from "./components/layout/Footer.js";
import {openDetail} from "./components/media/Modal.js";

import {Landing} from "./pages/Landing.js";
import {Tonight} from "./pages/Tonight.js";
import {Recommendations} from "./pages/Recommendations.js";
import {Watchlist} from "./pages/Watchlist.js";
import {Calendar} from "./pages/Calendar.js?v=1.0.11";
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
 const recs=state.onboardingComplete===true?recommendations(data,state.profile,8):[];
 const choice=state.onboardingComplete===true?mmChoice(data,state.profile):null;
 const Page=pages[route==="landing"?"Landing":route[0].toUpperCase()+route.slice(1)];
 document.getElementById("app").innerHTML=`<div class="app-shell">${Header()}${Navigation(route)}<main class="app-main">${Page(state,choice,recs)}</main>${Footer()}</div>`;
 bind();
}

function bind(){
 document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",event=>{event.preventDefault();navigate(el.dataset.route)}));
 document.querySelectorAll("[data-watch]").forEach(el=>el.onclick=()=>appState.toggleWatchlist(el.dataset.watch));
 document.querySelectorAll("[data-rate-id]").forEach(el=>el.onclick=()=>appState.rate(el.dataset.rateId,Number(el.dataset.rating))); document.querySelectorAll("[data-progress-id]").forEach(el=>el.onchange=()=>appState.setProgress(el.dataset.progressId,Number(el.value)));
 document.querySelectorAll("[data-detail]").forEach(el=>{
   el.onclick=()=>{
     const state=appState.get();
     const item=[...state.shows,...state.movies].find(x=>x.id===el.dataset.detail);
     if(item) openDetail(item,state.platforms.find(p=>p.id===item.platform)?.name||item.platform);
   };
 });
 const search=document.getElementById("search-submit");
 if(search) search.onclick=()=>{
   const input=document.getElementById("search-input");
   appState.set({query:input.value});
 };
 document.querySelectorAll("[data-query]").forEach(el=>el.onclick=()=>{
   appState.set({query:el.dataset.query});
 });

 const onboardingSearch=document.getElementById("onboarding-search");
 if(onboardingSearch) onboardingSearch.oninput=()=>{
   const needle=onboardingSearch.value.trim().toLowerCase();
   document.querySelectorAll("[data-onboarding-item]").forEach(row=>{
     row.hidden=!!needle && !row.dataset.onboardingText.includes(needle);
   });
 };
 const onboardingButton=document.querySelector("[data-onboarding-complete]");
 if(onboardingButton) onboardingButton.onclick=()=>{
   const state=appState.get();
   const rated=Object.entries(state.ratings).filter(([,value])=>Number(value)>0);
   if(!rated.length){
     if(!document.querySelector("[data-onboarding-hint]")){
       onboardingButton.insertAdjacentHTML("beforebegin","<p class='muted' data-onboarding-hint>Rate at least one show to continue.</p>");
     }
     return;
   }
   const items=rated.map(([id])=>[...state.shows,...state.movies].find(x=>x.id===id)).filter(Boolean);
   const platforms=[...document.querySelectorAll("[data-onboarding-platform]:checked")].map(el=>el.dataset.onboardingPlatform);
   const name=document.getElementById("onboarding-name")?.value.trim();
   const profile=buildProfileFromInitialWatches(items,state.ratings,platforms,name);
   appState.set({profile,onboardingComplete:true});
 };
}

async function init(){
 hydrateLocalState();
 document.getElementById("app").innerHTML="<div class='app-main'><div class='card'><h1>Media Minder</h1><p>Setting the table...</p></div></div>";
 try{
   const data=await loadData();
   const state=appState.get();
   // A saved per-browser profile (built during onboarding) always wins over the
   // shared default profile.json -- profile.json is only a starting point for a
   // browser that hasn't onboarded yet, so it never overwrites a real tester's taste.
   const profile=state.onboardingComplete===true?state.profile:null;
   appState.set({...data,profile,dataReady:true});
   startRouter(render);
 }catch(error){
   document.getElementById("app").innerHTML=`<main class="app-main"><div class="empty-state"><h1>Media Minder couldn't load.</h1><p>Please run the application through a local web server.</p></div></main>`;
   console.error(error);
 }
}
appState.subscribe(()=>render(currentRoute()));
init();
