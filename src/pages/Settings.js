import {heading} from "./pageUtils.js";
export function Settings(state){
 const profile=state.profile||{};
 return `${heading("Your edition","Settings","Personalize Media Minder without turning it into a control panel.")}
 <div class="grid-2"><section class="card"><h2>Viewing Profile</h2>
 <p><strong>Favorite celebrations</strong></p><div class="cluster">${(profile.favoriteCelebrations||[]).map(x=>`<span class="platform">${x}</span>`).join("")}</div>
 <p><strong>Preferred platforms</strong></p><div class="cluster">${(profile.platforms||[]).map(x=>`<span class="platform">${state.platforms.find(p=>p.id===x)?.name||x}</span>`).join("")}</div>
 <p><strong>Recommendation mode</strong><br><span class="muted">Mostly your tastes with one wildcard.</span></p></section></div>`;
}
