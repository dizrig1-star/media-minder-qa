import {heading,mediaCard,platformName} from "./pageUtils.js";
import {MMSelect} from "../components/recommendation/MMSelect.js";
import {Poster} from "../components/media/Poster.js";
import {Rating} from "../components/media/Rating.js";
import {getOnboardingCandidates} from "../services/onboardingService.js";

function onboarding(state){
  const candidates = getOnboardingCandidates(state.shows);
  return `${heading("First-time setup","Let's build your edition.","Pick your platforms and rate a few shows so recommendations reflect your taste, not anyone else's.")}
  <section class="card stack">
    <div class="search-box"><input id="onboarding-name" type="text" placeholder="Your name (optional)" autocomplete="off"></div>
    <div class="stack">
      <span class="muted">Platforms you have</span>
      <div class="cluster">${(state.platforms || []).map(p => `<label class="cluster"><input type="checkbox" data-onboarding-platform="${p.id}"> ${p.name}</label>`).join("")}</div>
    </div>
    <div class="search-box"><input id="onboarding-search" type="search" placeholder="Search for a show you know, e.g. Slow Horses" autocomplete="off"></div>
    <div class="stack" id="onboarding-results">${candidates.map(item => `<div class="cluster media-row" data-onboarding-item="${item.id}" data-onboarding-text="${[item.title,...(item.genre||[])].join(" ").toLowerCase()}">
      <div class="details" style="min-width:200px"><strong>${item.title}</strong><p class="muted" style="margin:0">${(item.genre||[]).join(" · ")}</p></div>
      ${Rating(state.ratings[item.id] || 0, true, item.id)}
    </div>`).join("")}</div>
    <p class="muted">Rate at least one show 4 or 5 stars so we have something to work with.</p>
    <button class="btn" data-onboarding-complete>Build my edition</button>
  </section>`;
}

export function Landing(state,choice,recs){
 if(state.onboardingComplete!==true) return onboarding(state);
 const hero=choice;
 return `${heading("Media Minder",`Good evening, ${state.profile?.name||"there"}.`,"A small, well-chosen list is better than a wall of choices.")}
 ${hero?`<section class="hero card"><div class="hero-content"><div class="eyebrow">MM'S CHOICE · TONIGHT</div><h2>${hero.title}</h2><div class="cluster">${MMSelect(hero.mmSelect)}<span class="platform">${platformName(state,hero.platform)}</span></div><p>${hero.summary}</p><p class="editor-note" style="color:white;border-color:var(--mustard)">${hero.why}</p><button class="btn" data-detail="${hero.id}">See the details</button></div></section>`:"<div class='empty-state'>Nothing rates an MM Select Gold right now.</div>"}
 <div class="section-heading"><h2>Tonight's Watch List</h2></div>
 <div class="grid-2"><div class="stack">${recs.slice(0,3).map(x=>mediaCard(state,x)).join("")}</div>
 <aside class="stack"><div class="card"><div class="page-kicker">Coming Soon</div><h3>Two Weeks</h3><p>New and returning series worth having on the radar.</p><a class="btn secondary" href="#premieres" data-route="premieres">See premieres</a></div>
 <div class="card"><div class="page-kicker">Because You Liked...</div><h3>A little more of what works.</h3><p>Curated from your genres, franchises, favorite people and platforms.</p><a class="btn secondary" href="#recommendations" data-route="recommendations">See recommendations</a></div></aside></div>
 <div class="section-heading"><h2>Editor's Note</h2></div>
 <div class="callout">The goal isn't to fill your queue. It's to make the next choice a good one.</div>`;
}
