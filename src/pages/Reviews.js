import {heading} from "./pageUtils.js";
import {Rating} from "../components/media/Rating.js";

function reviewPoster(item){
  return item.poster
    ? `<div class="poster small has-image" role="img" aria-label="${item.title} poster"><img src="${item.poster}" alt="${item.title} poster" loading="lazy"></div>`
    : `<div class="poster small" role="img" aria-label="${item.title} poster">${item.title}</div>`;
}

export function Reviews(state){
 const sort=state.reviewsSort||"rating";
 const rated=Object.entries(state.ratings).map(([id,r])=>({item:state.shows.find(x=>x.id===id)||state.movies.find(x=>x.id===id),rating:r})).filter(x=>x.item);
 const sorted=[...rated].sort((a,b)=> sort==="title" ? a.item.title.localeCompare(b.item.title) : b.rating-a.rating);
 return `${heading("Your notebook","My Reviews","A private viewing record, not a social feed.")}
 <div class="callout"><strong>Looking Back</strong> · Your next quarterly edition will collect the highlights of the last 13 weeks.</div>
 <div class="section-heading"><h2>My Ratings</h2>
   <div class="cluster">
     <button class="btn small ${sort==="rating"?"":"secondary"}" data-reviews-sort="rating">Sort by rating</button>
     <button class="btn small ${sort==="title"?"":"secondary"}" data-reviews-sort="title">Sort by title</button>
   </div>
 </div>
 ${sorted.length?`<div class="stack">${sorted.map(x=>`<article class="editorial-card editorial-card--compact review-row">
   <div class="editorial-banner"><span class="editorial-banner-mark">✦</span>YOUR RATING<span class="editorial-banner-mark">✦</span></div>
   <div class="media-row curated-row-body">${reviewPoster(x.item)}<div class="details"><h3>${x.item.link?`<a href="${x.item.link}" target="_blank" rel="noopener">${x.item.title}</a>`:x.item.title}</h3>${Rating(x.rating,false)}<p class="muted">Your rating is saved locally in this beta.</p></div></div>
 </article>`).join("")}</div>`:`<div class="empty-state">Rate something and it will appear here.</div>`}`;
}
