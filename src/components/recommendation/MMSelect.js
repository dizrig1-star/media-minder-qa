export function MMSelect(level){
  if(!level) return "";
  const label = String(level).trim();
  const tier = label.toLowerCase();

  const artworkByTier = {
    select: new URL("../../../assets/branding/approved/mm-select-star.svg", import.meta.url).href,
    gold: new URL("../../../assets/branding/approved/mm-select-gold-seal.webp", import.meta.url).href,
    silver: new URL("../../../assets/branding/approved/mm-select-silver-seal.webp", import.meta.url).href
  };

  // Gold/Silver are the approved tier-specific seals. The Select tier uses
  // the approved star seal. Keep the legacy seal as a temporary fallback so
  // a missing binary asset cannot make the recommendation card disappear.
  const artwork = artworkByTier[tier] || new URL("../../../assets/branding/approved/mm-select-star.svg", import.meta.url).href;

  return `<span class="mm-select mm-select-${tier}" title="MM Select ${label}">
    <img src="${artwork}" alt="MM Select ${label}" loading="lazy">
    <span class="sr-only">MM Select ${label}</span>
  </span>`;
}
