import {heading,mediaCard,movieMoodLiveSection} from "./pageUtils.js";

const MOOD_GENRES = {
  mystery: ["Mystery","Crime Thriller","Political Thriller"],
  light: ["Romantic Comedy","Romance","Comedy","Animated Comedy"],
  epic: ["Sci-Fi","Adventure","Family","War Drama"],
  drama: ["Drama","War Drama","Political Thriller"],
  fantasy: ["Fantasy","Sci-Fi","Adventure"],
  documentary: ["Documentary"],
  romance: ["Romance","Romantic Comedy"]
};
const MOOD_LABEL = {
  mystery:"Mystery & Suspense",
  light:"Something Lighter",
  epic:"Big & Adventurous",
  drama:"Drama",
  fantasy:"Fantasy",
  documentary:"Documentary",
  romance:"Romance"
};

export function Movies(state){
 const mood=state.movieMood;
 const base=state.movies.filter(x=>!state.watched.includes(x.id) && !state.notInterested.includes(x.id));
 const visible=mood && MOOD_GENRES[mood] ? base.filter(x=>x.genre?.some(g=>MOOD_GENRES[mood].includes(g))) : base;
 return `${heading("Feature Presentation","Movie Night Picks","Recommendations for the mood you're in.")}
 <div class="grid-2"><section class="stack">${visible.length?visible.map(x=>mediaCard(state,x)).join(""):"<div class='empty-state'>Nothing currently meets the mark in this category, clear a mood filter or check back soon.</div>"}</section>
 <aside class="card icon-corner icon-corner--woodgrain"><div class="page-kicker">MM's Movie Desk</div><h2>Pick a mood.</h2>
 <div class="cluster">
 ${Object.entries(MOOD_LABEL).map(([key,label])=>`<button class="btn small ${mood===key?"":"secondary"}" data-mood="${key}">${label}</button>`).join("")}
 ${mood?`<button class="btn small ghost" data-mood="">Clear</button>`:""}
 </div>
 <p class="muted">${mood?`Showing movies that fit ${MOOD_LABEL[mood].toLowerCase()}.`:"Mystery. Suspense. Clever crime. A little danger without a two-hour search."}</p>
 </aside></div>
 ${movieMoodLiveSection(state,"Also worth seeking out")}`;
}
