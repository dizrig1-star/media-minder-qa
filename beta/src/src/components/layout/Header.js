export function Header(){
  const logo=new URL("../../../assets/branding/mm-logo.svg", import.meta.url).href;
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand-link" href="#landing" aria-label="Media Minder home"><img class="brand-mark" src="${logo}" alt="Media Minder"></a>
    </div>
  </header>`;
}
