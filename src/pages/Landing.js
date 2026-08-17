import {heading,mediaCard,platformName} from "./pageUtils.js";
import {MMSelect} from "../components/recommendation/MMSelect.js";
import {getOnboardingCandidates} from "../services/onboardingService.js";

function onboarding(state){
 const candidates=getOnboardingCandidates(state.shows);
 return `<section class="card onboarding-card">
   <div class="page-kicker">FIRST-TIME SETUP</div>
   <h2>Start with what you're already watching.</h2>
   <p class="muted">Search for a few current shows and rate them. Four or five stars become strong preference signals; the shows are added to your Watchlist so Calendar can follow them.</p>
   <label class="field"><span class="muted">Find a show</span><input id="onboarding-search" type="search" placeholder="Try Lioness or Reacher" autocomplete="off"></label>
   <div class="stack" id="onboarding-results">${candidates.map(item=>`<div class="cluster onboarding-choice" data-onboarding-item="${item.id}" data-onboarding-text="${[item.title,...(item.genre||[]),...(item.cast||[]),...(item.franchises||[])].join(" ").toLowerCase()}">
     <label class="cluster"><input type="checkbox" data-onboarding-watch="${item.id}"><strong>${item.title}</strong></label>
     <div class="onboarding-rating" role="group" aria-label="Rate ${item.title}">
       ${[1,2,3,4,5].map(rating=>`<button type="button" class="star-button" data-onboarding-star="${item.id}" data-rating="${rating}" aria-label="${rating} star${rating===1?"":"s"} for ${item.title}">${rating}★</button>`).join("")}
       <span class="muted" data-onboarding-rating-label="${item.id}">Not rated</span>
     </div>
     <input type="hidden" data-onboarding-rating="${item.id}" value="0">
   </div>`).join("")}</div>
   <button class="btn" data-onboarding-complete>Use these to curate my edition</button>
 </section>`;
}

export function Landing(state,choice,recs){
 const hero=choice;
 return `${heading("Media Minder",`Good evening, ${state.profile?.name||"there"}.`,"A small, well-chosen list is better than a wall of choices.")}
 ${state.onboardingComplete===true?"":onboarding(state)}
 ${hero?`<section class="hero card"><div class="hero-content"><div class="eyebrow">MM'S CHOICE · TONIGHT</div><h2>${hero.title}</h2><div class="cluster">${MMSelect(hero.mmSelect)}<span class="platform">${platformName(state,hero.platform)}</span></div><p>${hero.summary}</p><p class="editor-note" style="color:white;border-color:var(--mustard)">${hero.why}</p><button class="btn" data-detail="${hero.id}">See the details</button></div></section>`:"<div class='empty-state'>Nothing rates an MM Select Gold right now.</div>"}
 <div class="section-heading"><h2>Tonight's Watch List</h2></div>
 <div class="grid-2"><div class="stack">${recs.slice(0,3).map(x=>mediaCard(state,x)).join("")}</div>
 <aside class="stack"><div class="card"><div class="page-kicker">Coming Soon</div><h3>Two Weeks</h3><p>New and returning series worth having on the radar.</p><a class="btn secondary" href="#premieres" data-route="premieres">See premieres</a></div>
 <div class="card"><div class="page-kicker">Because You Liked...</div><h3>A little more of what works.</h3><p>Curated from your genres, franchises, favorite people and platforms.</p><a class="btn secondary" href="#recommendations" data-route="recommendations">See recommendations</a></div></aside></div>
 <div class="section-heading"><h2>Editor's Note</h2></div>
 <div class="callout">The goal isn't to fill your queue. It's to make the next choice a good one.</div>`;
}
