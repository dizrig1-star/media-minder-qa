export function Poster(title, className="", posterUrl=""){
  if(posterUrl){
    return `<div class="poster ${className} has-image" role="img" aria-label="${title} poster"><img src="${posterUrl}" alt="${title} poster" loading="lazy"></div>`;
  }
  return `<div class="poster ${className}" role="img" aria-label="${title} poster">${title}</div>`;
}
