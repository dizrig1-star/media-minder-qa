export const routes=[
  "landing","tonight","recommendations","watchlist","calendar",
  "premieres","movies","franchises","reviews","settings","search"
];
export function currentRoute(){
  const raw=location.hash.replace(/^#/,"").trim().toLowerCase();
  return routes.includes(raw)?raw:"landing";
}
let routeHandler=null;
export function navigate(route){
  const target=routes.includes(route)?route:"landing";
  if(location.hash!==`#${target}`) history.pushState({}, "", `#${target}`);
  routeHandler?.(target);
}
export function startRouter(onRoute){
  routeHandler=onRoute;
  window.addEventListener("popstate",()=>onRoute(currentRoute()));
  window.addEventListener("hashchange",()=>onRoute(currentRoute()));
  onRoute(currentRoute());
}
