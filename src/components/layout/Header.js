export function Header(){
  const logo = new URL('../../../assets/branding/approved/mm-logo-header.svg', import.meta.url).href;
  const tvIcon = new URL('../../../assets/branding/approved/icon-tv-teal-pod.svg', import.meta.url).href;
  return `<div class="sidebar-header">
    <a href="#landing" aria-label="Media Minder home"><img class="brand-mark" src="${logo}" alt="Media Minder"></a>
    <div class="header-tagline">
      <img class="header-tagline-icon" src="${tvIcon}" alt="" aria-hidden="true">
      <span>Your guide to what's worth watching</span>
    </div>
  </div>`;
}
