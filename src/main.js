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
 const recs=recommendations(data,state.profile,8);
 const choice=mmChoice(data,state.profile);
 const Page=pages[route==="landing"?"Landing":route[0].toUpperCase()+route.slice(1)];
 document.getElementById("app").innerHTML=`<div class="app-shell">${Header()}${Navigation(route)}<main class="app-main">${Page(state,choice,recs)}</main>${Footer()}</div>`;
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
 const onboardingButton=document.querySelector("[data-onboarding-complete]");
 if(onboardingButton) onboardingButton.onclick=()=>{
   const selected=[...document.querySelectorAll("[data-onboarding-watch]:checked")].map(el=>el.dataset.onboardingWatch);
   if(!selected.length) return;
   const ratings={};
   selected.forEach(id=>{
     const select=document.querySelector(`[data-onboarding-rating="${id}"]`);
     ratings[id]=Number(select?.value||0);
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
   appState.set({...data,dataReady:true});
   startRouter(render);
 }catch(error){
   document.getElementById("app").innerHTML=`<main class="app-main"><div class="empty-state"><h1>Media Minder couldn't load.</h1><p>Please run the application through a local web server.</p></div></main>`;
   console.error(error);
 }
}
appState.subscribe(()=>render(currentRoute()));
init();
