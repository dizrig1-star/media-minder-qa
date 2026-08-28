import { Rating } from '../media/Rating.js';
import { Progress } from '../media/Progress.js';

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const ASSET = './assets/branding/approved/';

function imageAsset(file, alt, className){
  return `<img class="${className}" src="${ASSET}${file}" alt="${alt}" />`;
}

export function EditorialCard(item, platformName, kind='select', state={}, tier){
  const title = escapeHtml(item.title);
  const platform = escapeHtml(platformName);
  const id = escapeHtml(item.id);
  const genres = (item.genre||[]).join(' · ');
  const progress = (state.progress||{})[item.id] || 0;
  const rating = (state.ratings||{})[item.id] || 0;
  const inWatchlist = (state.watchlist||[]).includes(item.id);
  const isSelect = kind === 'select';
  const isTonight = kind === 'tonight';
  const isWatching = kind === 'watching';
  const isPremiere = kind === 'premiere';
  const isLibrary = kind === 'library';
  const isMovie = item.type !== 'series';
  const isWatched = (state.watched||[]).includes(item.id);
  const isSkipped = (state.notInterested||[]).includes(item.id);
  const resolvedTier = tier || (isSelect ? 'hero' : (isPremiere || isLibrary) ? 'compact' : 'secondary');
  const label = isLibrary ? '' : isSelect ? 'MM SELECT GOLD' : isTonight ? 'TONIGHT' : isWatching ? 'WATCHING' : 'COMING SOON';
  const tone = isLibrary ? 'teal' : isSelect ? 'gold' : isTonight ? 'coral' : isWatching ? 'teal' : 'gold';
  const date = (item.episodeDrops||[]).find(e=>e.date)?.date;
  const dateText = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
  const scheduleText = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}) : '';
  const timeText = item.episodeTime ? ` · ${item.episodeTime}` : '';
  const premiereText = isPremiere && date ? `<span>${dateText}</span>` : '';
  const badgeAsset = isLibrary ? ''
    : isSelect ? imageAsset('mm-select-seal.svg','MM Select','editorial-select-badge')
    : isTonight ? imageAsset('badge-tonight.svg','Tonight','editorial-status-art editorial-status-art--tonight')
    : isWatching ? imageAsset('badge-watching.svg','Watching','editorial-status-art editorial-status-art--watching')
    : isPremiere ? imageAsset('badge-premiere.svg','Premiere','editorial-status-art editorial-status-art--premiere')
    : imageAsset('badge-new.svg','New','editorial-status-art editorial-status-art--new');
  const artAsset = isSelect ? 'Icon-mainframe.svg' : isTonight ? 'Icon-transmission-tower.svg' : isWatching ? 'Icon-test-pattern.svg' : 'Icon-countdown.svg';
  const kicker = isLibrary ? '' : isWatching ? 'CURRENTLY WATCHING' : isPremiere ? 'PREMIERE' : isTonight ? "TONIGHT'S DROP" : 'CURATED FOR YOU';
  const hasPoster = !!item.poster;
  const artStyle = hasPoster ? ` style="background-image:linear-gradient(180deg, rgba(15,45,51,.15) 0%, rgba(15,45,51,.55) 55%, rgba(10,10,10,.72) 100%), url('${escapeHtml(item.poster)}');background-size:cover;background-position:center;"` : '';
  return `<article class="editorial-card editorial-card--${kind} editorial-card--${resolvedTier} editorial-card--${tone}">
    ${label ? `<div class="editorial-banner"><span class="editorial-banner-mark">✦</span>${label}<span class="editorial-banner-mark">✦</span></div>` : ''}
    <div class="editorial-card-inner">
      <div class="editorial-art${hasPoster ? ' editorial-art--poster' : ''}" aria-label="${title} visual"${artStyle}>
        ${hasPoster ? '' : `<img class="editorial-art-icon" src="${ASSET}${artAsset}" alt="" aria-hidden="true" />`}
        <div class="editorial-art-title">${title}</div>
        <div class="editorial-art-footer">MEDIA MINDER</div>
      </div>
      <div class="editorial-card-content">
        <div class="editorial-topline">
          ${badgeAsset ? `<div class="editorial-badge-wrap">${badgeAsset}</div>` : ''}
          <span class="editorial-platform">${platform}</span>
        </div>
        ${kicker ? `<div class="editorial-kicker">${kicker}</div>` : ''}
        <h3>${title}</h3>
        <p class="editorial-meta">${escapeHtml(genres)}${item.runtime ? ` · ${item.runtime} min` : ''}${premiereText ? ` · ${premiereText}` : ''}</p>
        ${item.summary ? `<p class="editorial-summary">${escapeHtml(item.summary)}</p>` : ''}
        ${isWatching && item.episodes ? `<div class="editorial-progress">${Progress(item, progress)}</div>` : ''}
        ${isPremiere ? `<p class="editorial-schedule"><strong>${item.status==='new' ? 'Series Premiere' : 'Season Premiere'}</strong>${date ? ` · ${scheduleText}${timeText}` : ''}</p>` : ''}
        <div class="editorial-actions">
          <button class="btn" data-detail="${id}">Details</button>
          <button class="btn secondary" data-watch="${id}">${inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</button>
          ${isLibrary && isMovie ? `<button class="btn small ${isWatched ? 'secondary' : 'ghost'}" data-watched="${id}">${isWatched ? 'Watched ✓' : 'Mark watched'}</button><button class="btn small ${isSkipped ? 'secondary' : 'ghost'}" data-skip="${id}">${isSkipped ? 'Not for me ✓' : 'Not for me'}</button>` : ''}
          ${Rating(rating, true, item.id)}
        </div>
      </div>
    </div>
  </article>`;
}
