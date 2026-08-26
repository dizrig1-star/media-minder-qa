const items = [
  ["landing","Home"],["tonight","Tonight"],["recommendations","Recommendations"],
  ["watchlist","Watchlist"],["calendar","Calendar"],["premieres","Premieres"],
  ["movies","Movies"],["franchises","Franchises"],["reviews","My Reviews"],["settings","Settings"],["search","Search"]
];
const icons = {
  landing: new URL('../../../assets/branding/approved/icon-tv-teal-pod.svg', import.meta.url).href,
  tonight: new URL('../../../assets/branding/approved/icon-tv-coral-stripe.svg', import.meta.url).href,
  watchlist: new URL('../../../assets/branding/approved/icon-tv-cream-trim.svg', import.meta.url).href
};
export function Navigation(active){
  return `<nav class="sidebar-nav" aria-label="Primary navigation">
    ${items.map(([id,label])=>`<a class="nav-item ${id===active?"active":""}" href="#${id}" data-route="${id}">${icons[id]?`<img class="nav-icon" src="${icons[id]}" alt="" aria-hidden="true">`:""}<span>${label}</span></a>`).join("")}
  </nav>`;
}
