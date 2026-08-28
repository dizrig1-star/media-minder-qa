import {getUpcomingPremiereRows} from "../../services/scheduleService.js";

const ASSET="./assets/branding/approved/";

function isTonight(item){
  const today=new Date().toISOString().slice(0,10);
  return item.episodeDrops?.some(drop=>drop.date===today);
}

function isUpcomingPremiere(item,state){
  if(!state) return false;
  return getUpcomingPremiereRows(state).some(row=>String(row.show?.id)===String(item.id));
}

function badgeAsset(file,alt,kind){
  return `<img class="badge badge-image badge-image--${kind}" src="${ASSET}${file}" alt="${alt}" />`;
}

export function ContentBadges(item,{progress=0,watchlisted=false,state=null}={}){
  const badges=[];
  if(isTonight(item)) badges.push(badgeAsset("badge-tonight.svg","Tonight","tonight"));
  if(progress>0) badges.push(badgeAsset("badge-watching.svg","Watching","watching"));
  if(isUpcomingPremiere(item,state)) badges.push(badgeAsset("badge-premiere.svg","Premiere","premiere"));
  if(item.status==="new") badges.push(badgeAsset("badge-new.svg","New","new"));
  return badges.length?`<div class="content-badges" aria-label="Media status">${badges.join("")}</div>`:"";
}
