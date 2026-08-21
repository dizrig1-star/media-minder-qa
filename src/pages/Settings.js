import {heading} from "./pageUtils.js";
export function Settings(state){
 const profile=state.profile||{};
 const allGenres=[...new Set([...state.shows,...state.movies].flatMap(x=>x.genre||[]))].sort();
 const favGenres=new Set(profile.favoriteGenres||[]);
 const favPlatforms=new Set(profile.platforms||[]);
 return `${heading("Your edition","Settings","Personalize Media Minder without turning it into a control panel.")}
 <div class="grid-2"><section class="card"><h2>Viewing Profile</h2>
 <p><strong>Favorite genres</strong></p>
 <div class="cluster">${allGenres.map(g=>`<button class="btn small ${favGenres.has(g)?"":"secondary"}" data-genre-toggle="${g}">${g}</button>`).join("")}</div>
 <p><strong>Preferred platforms</strong></p>
 <div class="cluster">${state.platforms.map(p=>`<button class="btn small ${favPlatforms.has(p.id)?"":"secondary"}" data-platform-toggle="${p.id}">${p.name}</button>`).join("")}</div>
 <p><strong>Recommendation mode</strong><br><span class="muted">Mostly your tastes with one wildcard.</span></p></section></div>`;
}
