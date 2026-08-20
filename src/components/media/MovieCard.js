import {Poster} from "./Poster.js";
import {Platform} from "./Platform.js";
import {MMSelect} from "../recommendation/MMSelect.js";
import {Rating} from "./Rating.js";
export function MovieCard(item, platformName, rating=0, watched=false, skipped=false){
 return `<article class="card media-row">
   ${Poster(item.title,"small",item.posterUrl)}
   <div class="details"><div class="cluster">${MMSelect(item.mmSelect)}${Platform(platformName)}</div>
   <h3>${item.link?`<a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>`:item.title}</h3>
   <p class="muted">${item.runtime} min · ${item.genre.join(" · ")}</p>
   <p>${item.summary}</p>
   <div class="cluster">${Rating(rating,true,item.id)}
   <button class="btn small ${watched?"secondary":"ghost"}" data-watched="${item.id}">${watched?"Watched ✓":"Mark watched"}</button>
   <button class="btn small ${skipped?"secondary":"ghost"}" data-skip="${item.id}">${skipped?"Not for me ✓":"Not for me"}</button>
   <button class="btn small secondary" data-detail="${item.id}">Details</button></div></div>
 </article>`;
}
