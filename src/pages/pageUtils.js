import {ShowCard} from "../components/media/ShowCard.js";
import {MovieCard} from "../components/media/MovieCard.js";

export function platformName(state,id){ return state.platforms.find(p=>p.id===id)?.name || id; }
export function allMedia(state){ return [...state.shows,...state.movies]; }
export function findMedia(state,id){ return allMedia(state).find(x=>x.id===id); }
export function mediaCard(state,item){
 const p=platformName(state,item.platform), r=state.ratings[item.id]||0;
 return item.type==="series"
   ? ShowCard(item,p,r,state.watchlist.includes(item.id),state.progress[item.id]||0)
   : MovieCard(item,p,r);
}
export function heading(kicker,title,desc=""){return `<div class="page-header"><div><div class="page-kicker">${kicker}</div><h1 class="page-title">${title}</h1>${desc?`<p class="muted">${desc}</p>`:""}</div></div>`;}
