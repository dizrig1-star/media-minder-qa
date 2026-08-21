import {Poster} from "./Poster.js";
import {Platform} from "./Platform.js";
import {MMSelect} from "../recommendation/MMSelect.js";
import {Rating} from "./Rating.js";
import {ContentBadges} from "./Badge.js";
export function MovieCard(item, platformName, rating=0){
 return `<article class="card media-row">
   ${Poster(item.title,"small")}
   <div class="details"><div class="media-meta"><div class="cluster">${MMSelect(item.mmSelect)}${Platform(platformName)}</div>${ContentBadges(item)}</div>
   <h3>${item.title}</h3><p class="muted">${item.runtime} min · ${item.genre.join(" · ")}</p>
   <p>${item.summary}</p><div class="cluster">${Rating(rating,true,item.id)}
   <button class="btn small secondary" data-detail="${item.id}">Details</button></div></div>
 </article>`;
}
