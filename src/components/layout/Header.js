export function Header(){
  const logo=new URL("../../assets/branding/mm-logo.svg", import.meta.url).href;
  return `<header class="site-header">
    <div class="header-inner">
      <a href="#landing" aria-label="Media Minder home"><img class="brand-mark" src="${logo}" alt="Media Minder"></a>
      <div class="header-tagline">Magical Movies, Mysteries & More</div>
    </div>
  </header>`;
}
