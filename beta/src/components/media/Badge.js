import {getUpcomingPremiereRows} from "../../services/scheduleService.js";

function isTonight(item){
  const today=new Date().toISOString().slice(0,10);
  return item.episodeDrops?.some(drop=>drop.date===today);
}

function isUpcomingPremiere(item,state){
  if(!state) return false;
  return getUpcomingPremiereRows(state).some(row=>String(row.show?.id)===String(item.id));
}

export function ContentBadges(item,{progress=0,watchlisted=false,state=null}={}){
  const badges=[];
  if(isTonight(item)) badges.push(`<span class="badge tonight">Tonight</span>`);
  if(progress>0) badges.push(`<span class="badge watching">Watching</span>`);
  if(isUpcomingPremiere(item,state)) badges.push(`<span class="badge premiere">Premiere</span>`);
  if(item.status==="new") badges.push(`<span class="badge new">New</span>`);
  return badges.length?`<div class="content-badges" aria-label="Media status">${badges.join("")}</div>`:"";
}
