import {heading,mediaCard,platformName} from './pageUtils.js';
import {EditorialCard} from '../components/recommendation/EditorialCard.js';
export function RecommendationsVisual(state,choice,recs,wildcard){
 const gold = recs.filter(x=>x.mmSelect==='Gold');
 const prototype = gold[0];
 const remaining = gold.slice(1,4);
 const wildcardPick = wildcard || recs.find(x=>x.mmSelect!=='Gold');
 return `${heading('Curated for you','Recommendations','Mostly your tastes, with one wildcard.')}
 <div class="section-heading"><h2>MM Select Gold</h2></div>
 ${prototype?`<div class="curated-prototype">${EditorialCard(prototype,platformName(state,prototype.platform),'select',state)}</div>`:`<div class="empty-state">Nothing rates an MM Select Gold right now.</div>`}
 ${remaining.length?`<div class="prototype-following-grid">${remaining.map(x=>mediaCard(state,x,'select','secondary')).join('')}</div>`:''}
 <div class="section-heading"><h2>One Wildcard</h2></div>
 ${wildcardPick?mediaCard(state,wildcardPick,'select','secondary'):''}`;
}
