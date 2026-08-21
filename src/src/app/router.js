export const routes = [
  "landing","tonight","recommendations","watchlist","calendar",
  "premieres","movies","franchises","reviews","settings","search"
];

export function currentRoute(){
  const raw = location.hash.replace(/^#/,"").trim().toLowerCase();
  return routes.includes(raw) ? raw : "landing";
}

export function navigate(route){
  const target = routes.includes(route) ? route : "landing";
  if(location.hash !== `#${target}`) location.hash = target;
  window.dispatchEvent(new CustomEvent("mm:navigate",{detail:target}));
}

export function startRouter(onRoute){
  window.addEventListener("hashchange",()=>onRoute(currentRoute()));
  onRoute(currentRoute());
}
