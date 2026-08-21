import {heading,mediaCard} from "./pageUtils.js";
import {Rating} from "../components/media/Rating.js";
export function Reviews(state){
 const rated=Object.entries(state.ratings).map(([id,r])=>({item:state.shows.find(x=>x.id===id)||state.movies.find(x=>x.id===id),rating:r})).filter(x=>x.item);
 return `${heading("Your notebook","My Reviews","A private viewing record, not a social feed.")}
 <div class="callout"><strong>Looking Back</strong> · Your next quarterly edition will collect the highlights of the last 13 weeks.</div>
 <div class="section-heading"><h2>My Ratings</h2></div>
 ${rated.length?`<div class="stack">${rated.map(x=>`<article class="card media-row"><div class="details"><h3>${x.item.title}</h3>${Rating(x.rating,false)}<p class="muted">Your rating is saved locally in this beta.</p></div></article>`).join("")}</div>`:`<div class="empty-state">Rate something and it will appear here.</div>`}`;
}
