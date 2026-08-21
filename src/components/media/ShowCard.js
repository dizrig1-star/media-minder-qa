import {Poster} from "./Poster.js";
import {Platform} from "./Platform.js";
import {MMSelect} from "../recommendation/MMSelect.js";
import {Rating} from "./Rating.js";
import {Progress} from "./Progress.js";

export function ShowCard(item, platformName, rating=0, watchlisted=false, progress=0){
  return `<article class="card media-row">
    ${Poster(item.title,"small",item.posterUrl)}
    <div class="details">
      <div class="cluster">${MMSelect(item.mmSelect)}${Platform(platformName)}</div>
      <h3>${item.link?`<a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>`:item.title}</h3>
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
