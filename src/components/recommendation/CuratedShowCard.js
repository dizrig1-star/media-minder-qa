export function CuratedShowCard(item, platformName, rating=0){
  return `<article class="card curated-show-card">
    <div class="curated-art" aria-label="Artwork placeholder for ${item.title}">
      <div class="curated-art-screen"><span class="curated-art-star">✦</span></div>
      <div class="curated-art-title">${item.title}</div>
      <div class="curated-art-rule"></div>
      <div class="curated-art-note">MEDIA MINDER</div>
    </div>
    <div class="curated-show-details">
      <div class="curated-topline">
        <div class="mm-select-art" aria-label="MM Select">
          <img src="./assets/branding/mm-select-approved.svg" alt="MM Select" />
        </div>
        <div class="curated-platform">${platformName}</div>
      </div>
      <div class="curated-kicker">MM SELECT GOLD</div>
      <h3>${item.title}</h3>
      <p class="curated-meta">${item.genre.join(" · ")} · ${item.runtime} min</p>
      <p class="curated-summary">${item.summary}</p>
      <p class="curated-editor-note">A carefully chosen match for your viewing profile.</p>
      <div class="cluster curated-actions">
        <button class="btn" data-detail="${item.id}">See the details</button>
        <button class="btn secondary" data-watch="${item.id}">Add to Watchlist</button>
      </div>
    </div>
  </article>`;
}
