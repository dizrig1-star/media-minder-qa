export function Header(){
  const logo = new URL('../../../assets/branding/approved/mm-logo-header.svg', import.meta.url).href;
  return `<header class="site-header">
    <div class="header-inner">
      <a href="#landing" aria-label="Media Minder home"><img class="brand-mark" src="${logo}" alt="Media Minder"></a>
      <div class="header-tagline">Your guide to what's worth watching</div>
    </div>
  </header>`;
}
