import {Poster} from "./Poster.js";
import {Platform} from "./Platform.js";
import {MMSelect} from "../recommendation/MMSelect.js";

export function openDetail(item, platformName){
 const overlay=document.createElement("div");
 overlay.className="modal-backdrop";
 const drops = item.episodeDrops?.length
   ? `<div class="section-heading"><h3>Episode Drops</h3></div><div class="list">${item.episodeDrops.map(e=>`
       <div class="card flat media-row"><strong>Episode ${e.episode}</strong><div class="details"><strong>${e.title}</strong><span class="muted">${e.date} · ${e.time}</span></div></div>`).join("")}</div>`
   : "";
 overlay.innerHTML=`<div class="modal card" role="dialog" aria-modal="true" aria-label="${item.title}">
   <button class="btn ghost small modal-close">Close</button>
   <div class="grid-2"><div>${Poster(item.title)}</div><div>
   <div class="cluster">${MMSelect(item.mmSelect)}${Platform(platformName||"")}</div>
   <h2>${item.title}</h2><p>${item.summary}</p>
   ${item.cast?.length?`<p><strong>Cast:</strong> ${item.cast.join(", ")}</p>`:""}
   ${item.episodeTitle?`<p><strong>Next drop:</strong> ${item.episodeTitle} · ${item.episodeTime}</p>`:""}
   ${item.releasePattern?`<p class="muted">${item.releasePattern === "weekly" ? "Weekly episode release" : item.releasePattern}</p>`:""}
   ${item.why?`<p class="editor-note"><strong>Why you'll like it:</strong> ${item.why}</p>`:""}
   </div></div>${drops}</div>`;
 document.body.appendChild(overlay);
 overlay.querySelector(".modal-close").onclick=()=>overlay.remove();
 overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
}
