import {heading} from "./pageUtils.js";
export function Settings(state){
 const profile=state.profile||{};
 const allGenres=[...new Set([...state.shows,...state.movies].flatMap(x=>x.genre||[]))].sort();
 const favGenres=new Set(profile.favoriteGenres||[]);
 const favPlatforms=new Set(profile.platforms||[]);
 const apiKeys=state.apiKeys||{tmdb:"",omdb:""};
 return `${heading("Your edition","Settings","Personalize Media Minder without turning it into a control panel.")}
 <div class="grid-2"><section class="card"><h2>Viewing Profile</h2>
 <p><strong>Favorite genres</strong></p>
 <div class="cluster">${allGenres.map(g=>`<button class="btn small ${favGenres.has(g)?"":"secondary"}" data-genre-toggle="${g}">${g}</button>`).join("")}</div>
 <p><strong>Preferred platforms</strong></p>
 <div class="cluster">${state.platforms.map(p=>`<button class="btn small ${favPlatforms.has(p.id)?"":"secondary"}" data-platform-toggle="${p.id}">${p.name}</button>`).join("")}</div>
 <p><strong>Recommendation mode</strong><br><span class="muted">Mostly your tastes with one wildcard.</span></p></section>
 <section class="card"><h2>Live Search</h2>
 <p class="muted">Enter your own free TMDB and OMDb API keys to let Search find titles beyond your curated library -- with real artwork, ratings, and platform availability. Stored only in this browser, never uploaded anywhere.</p>
 <p><label for="settings-tmdb-key"><strong>TMDB API key</strong></label><br>
 <input id="settings-tmdb-key" type="text" placeholder="Paste your TMDB API key" value="${apiKeys.tmdb||""}" autocomplete="off" spellcheck="false"></p>
 <p><label for="settings-omdb-key"><strong>OMDb API key</strong></label><br>
 <input id="settings-omdb-key" type="text" placeholder="Paste your OMDb API key" value="${apiKeys.omdb||""}" autocomplete="off" spellcheck="false"></p>
 <button class="btn small" id="settings-save-api-keys">Save keys</button>
 <span id="settings-api-keys-saved" class="muted" hidden> Saved.</span>
 <p class="muted">Don't have keys yet? Free sign-up at themoviedb.org/settings/api and omdbapi.com/apikey.aspx.</p></section></div>`;
}
