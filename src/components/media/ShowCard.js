import {Poster} from "./Poster.js";
import {Platform} from "./Platform.js";
import {MMSelect} from "../recommendation/MMSelect.js";
import {Rating} from "./Rating.js";
import {Progress} from "./Progress.js";
import {ContentBadges} from "./Badge.js";

export function ShowCard(item, platformName, rating=0, watchlisted=false, progress=0, state=null){
  return `<article class="card media-row">
    ${Poster(item.title,"small")}
    <div class="details">
      <div class="media-meta"><div class="cluster">${MMSelect(item.mmSelect)}${Platform(platformName)}</div>${ContentBadges(item,{progress,watchlisted,state})}</div>
      <h3>${item.title}</h3>
      <p class="muted">${item.genre.join(" · ")} · ${item.runtime} min</p>
      <p>${item.summary}</p>
      ${Progress(item,progress)}
      <div class="cluster">${Rating(rating,true,item.id)}
        <button class="btn small ${watchlisted?"secondary":"ghost"}" data-watch="${item.id}">${watchlisted?"Remove":"Add to Watchlist"}</button>
        <button class="btn small secondary" data-detail="${item.id}">Details</button>
      </div>
    </div>
  </article>`;
}
