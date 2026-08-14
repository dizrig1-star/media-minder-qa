const items = [
 ["landing","Home"],["tonight","Tonight"],["recommendations","Recommendations"],
 ["watchlist","Watchlist"],["calendar","Calendar"],["premieres","Premieres"],
 ["movies","Movies"],["franchises","Franchises"],["reviews","My Reviews"],["settings","Settings"],["search","Search"]
];
export function Navigation(active){
  return `<div class="nav-wrap"><nav class="nav-inner" aria-label="Primary navigation">
    ${items.map(([id,label])=>`<a class="nav-item ${id===active?"active":""}" href="#${id}" data-route="${id}">${label}</a>`).join("")}
  </nav></div>`;
}
