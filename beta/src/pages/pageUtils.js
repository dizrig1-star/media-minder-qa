import { EditorialCard } from '../components/recommendation/EditorialCard.js';

export function platformName(state,id){ return state.platforms.find(p=>p.id===id)?.name || id; }
export function allMedia(state){ return [...state.shows,...state.movies]; }
export function findMedia(state,id){ return allMedia(state).find(x=>x.id===id); }

export function mediaCard(state, item, kindOverride, tierOverride){
  const platform = platformName(state, item.platform);
  const inWatchlist = state.watchlist.includes(item.id);
  const kind = kindOverride || (inWatchlist ? 'watching' : 'library');
  const tier = tierOverride || (kind === 'library' ? 'compact' : undefined);
  return EditorialCard(item, platform, kind, state, tier);
}

export function heading(kicker,title,desc=''){return `<div class="page-header"><div><div class="page-kicker">${kicker}</div><h1 class="page-title">${title}</h1>${desc?`<p class="muted">${desc}</p>`:''}</div></div>`;}
