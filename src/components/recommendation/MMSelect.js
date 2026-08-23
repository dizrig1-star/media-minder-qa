export function MMSelect(level){
  if(!level) return "";
  const label = String(level).trim();
  const tier = label.toLowerCase();

  const artworkByTier = {
    select: new URL("../../../assets/branding/approved/mm-select-star.svg", import.meta.url).href,
    gold: new URL("../../../assets/branding/approved/mm-select-gold-seal.svg", import.meta.url).href,
    silver: new URL("../../../assets/branding/approved/mm-select-silver-seal.svg", import.meta.url).href
  };

  const artwork = artworkByTier[tier];
  if(!artwork) return "";

  return `<span class="mm-select mm-select-${tier}" title="MM Select ${label}">
    <img src="${artwork}" alt="MM Select ${label}" loading="lazy">
    <span class="sr-only">MM Select ${label}</span>
  </span>`;
}
