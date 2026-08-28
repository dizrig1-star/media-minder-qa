export function Poster(title, className=""){
  return `<div class="poster ${className}" role="img" aria-label="${title} poster">${title}</div>`;
}
