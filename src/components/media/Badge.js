function daysUntil(date){
  if(!date) return Infinity;
  const today=new Date();
  today.setHours(0,0,0,0);
  const target=new Date(`${date}T00:00:00`);
  return Math.ceil((target-today)/86400000);
}

function isTonight(item){
  const today=new Date().toISOString().slice(0,10);
  return item.episodeDrops?.some(drop=>drop.date===today);
}

function isUpcomingPremiere(item){
  const days=daysUntil(item.premiere);
  return days>=0 && days<=14;
}

export function ContentBadges(item,{progress=0,watchlisted=false}={}){
  const badges=[];
  if(isTonight(item)) badges.push(`<span class="badge tonight">Tonight</span>`);
  if(progress>0) badges.push(`<span class="badge watching">Watching</span>`);
  if(isUpcomingPremiere(item)) badges.push(`<span class="badge premiere">Premiere</span>`);
  if(item.status==="new") badges.push(`<span class="badge new">New</span>`);
  return badges.length?`<div class="content-badges" aria-label="Media status">${badges.join("")}</div>`:"";
}
