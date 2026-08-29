const items = [
  ["landing","Home"],["tonight","Tonight"],["recommendations","Recommendations"],
  ["watchlist","Watchlist"],["calendar","Calendar"],["premieres","Premieres"],
  ["movies","Movies"],["franchises","Franchises"],["reviews","My Reviews"],["settings","Settings"],["search","Search"]
];
const icons = {
  landing: new URL('../../../assets/branding/approved/mm-logo-header.svg', import.meta.url).href,
  tonight: new URL('../../../assets/branding/approved/icon-nav-tonight.png', import.meta.url).href,
  recommendations: new URL('../../../assets/branding/approved/icon-nav-recommendations.png', import.meta.url).href,
  watchlist: new URL('../../../assets/branding/approved/icon-nav-watchlist.png', import.meta.url).href,
  calendar: new URL('../../../assets/branding/approved/date-badge-blank-tile.svg', import.meta.url).href,
  premieres: new URL('../../../assets/branding/approved/icon-nav-premieres.png', import.meta.url).href,
  movies: new URL('../../../assets/branding/approved/icon-nav-movies.png', import.meta.url).href,
  franchises: new URL('../../../assets/branding/approved/icon-nav-franchises.png', import.meta.url).href,
  settings: new URL('../../../assets/branding/approved/icon-nav-settings.png', import.meta.url).href,
  search: new URL('../../../assets/branding/approved/icon-nav-search.png', import.meta.url).href
};
export function Navigation(active){
  return `<nav class="sidebar-nav" aria-label="Primary navigation">
    ${items.map(([id,label])=>`<a class="nav-item ${id===active?"active":""}" href="#${id}" data-route="${id}">${icons[id]?`<img class="nav-icon" src="${icons[id]}" alt="" aria-hidden="true">`:""}<span>${label}</span></a>`).join("")}
  </nav>`;
}
