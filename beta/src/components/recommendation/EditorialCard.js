function escapeHtml(value){return String(value??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}

export function EditorialCard(item, platformName, kind="select", state={}, tier){
  const title=escapeHtml(item.title);
  const platform=escapeHtml(platformName);
  const id=escapeHtml(item.id);
  const genres=(item.genre||[]).join(" · ");
  const progress=state.progress?.[item.id]||0;
  const watched=progress>0;
  const inWatchlist=state.watchlist?.includes(item.id);
  const isSelect=kind==="select";
  const isTonight=kind==="tonight";
  const isWatching=kind==="watching";
  const isPremiere=kind==="premiere";
  const resolvedTier=tier||(isSelect?"hero":isPremiere?"compact":"secondary");
  const label=isSelect?"MM SELECT GOLD":isTonight?"TONIGHT":isWatching?"WATCHING":"COMING SOON";
  const tone=isSelect?"gold":isTonight?"coral":isWatching?"teal":"gold";
  const date=item.episodeDrops?.find(e=>e.date)?.date;
  const dateText=date?new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"";
  const scheduleText=date?new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}):"";
const timeText=item.episodeTime?` · ${item.episodeTime}`:"";
  const premiereText=isPremiere&&date?`<span>${dateText}</span>`:"";
  return `<article class="editorial-card editorial-card--${kind} editorial-card--${resolvedTier} editorial-card--${tone}">
    <div class="editorial-banner"><span class="editorial-banner-mark">✦</span>${label}<span class="editorial-banner-mark">✦</span></div>
    <div class="editorial-card-inner">
      <div class="editorial-art" aria-label="Artwork placeholder for ${title}">
        <div class="editorial-art-screen"><span>✦</span></div>
        <div class="editorial-art-title">${title}</div>
        <div class="editorial-art-footer">MEDIA MINDER</div>
      </div>
      <div class="editorial-card-content">
        <div class="editorial-topline">
          ${isSelect?`<img class="editorial-select-badge" src="./assets/branding/mm-select-approved.svg" alt="MM Select" />`:""}
          <span class="editorial-platform">${platform}</span>
        </div>
        <div class="editorial-kicker">${isWatching?"CURRENTLY WATCHING":isPremiere?"PREMIERE":isTonight?"TONIGHT'S DROP":"CURATED FOR YOU"}</div>
        <h3>${title}</h3>
        <p class="editorial-meta">${escapeHtml(genres)}${item.runtime?` · ${item.runtime} min`:""}${premiereText?` · ${premiereText}`:""}</p>
        ${item.summary?`<p class="editorial-summary">${escapeHtml(item.summary)}</p>`:""}
        ${isWatching?`<div class="editorial-progress"><div class="editorial-progress-label"><span>Progress</span><strong>${Math.round(progress)}%</strong></div><div class="editorial-progress-track"><span style="width:${Math.min(100,Math.max(0,progress))}%"></span></div></div>`:""}
        ${isPremiere?`<p class="editorial-schedule"><strong>${item.status==="new"?"Series Premiere":"Season Premiere"}</strong>${date?` · ${scheduleText}${timeText}`:""}</p>`:""}
        <div class="editorial-actions">
          <button class="btn" data-detail="${id}">Details</button>
          <button class="btn secondary" data-watch="${id}">${inWatchlist?"Remove from Watchlist":"Add to Watchlist"}</button>
        </div>
      </div>
    </div>
  </article>`;
}
