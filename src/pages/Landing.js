import {heading,mediaCard,platformName} from "./pageUtils.js";
import {MMSelect} from "../components/recommendation/MMSelect.js";
import {Poster} from "../components/media/Poster.js";
export function Landing(state,choice,recs){
 const hero=choice;
 return `${heading("Media Minder","Good evening, Simon.","A small, well-chosen list is better than a wall of choices.")}
 ${hero?`<section class="hero card"><div class="hero-content"><div class="eyebrow">MM'S CHOICE · TONIGHT</div><h2>${hero.title}</h2><div class="cluster">${MMSelect(hero.mmSelect)}<span class="platform">${platformName(state,hero.platform)}</span></div><p>${hero.summary}</p><p class="editor-note" style="color:white;border-color:var(--mustard)">${hero.why}</p><button class="btn" data-detail="${hero.id}">See the details</button></div></section>`:"<div class='empty-state'>Nothing rates an MM Select Gold right now.</div>"}
 <div class="section-heading"><h2>Tonight's Watch List</h2></div>
 <div class="grid-2"><div class="stack">${recs.slice(0,3).map(x=>mediaCard(state,x)).join("")}</div>
 <aside class="stack"><div class="card"><div class="page-kicker">Coming Soon</div><h3>Two Weeks</h3><p>New and returning series worth having on the radar.</p><a class="btn secondary" href="#premieres" data-route="premieres">See premieres</a></div>
 <div class="card"><div class="page-kicker">Because You Liked...</div><h3>A little more of what works.</h3><p>Curated from your genres, franchises, favorite people and platforms.</p><a class="btn secondary" href="#recommendations" data-route="recommendations">See recommendations</a></div></aside></div>
 <div class="section-heading"><h2>Editor's Note</h2></div>
 <div class="callout">The goal isn't to fill your queue. It's to make the next choice a good one.</div>`;
}
