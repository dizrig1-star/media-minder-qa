function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Was text-only (title in a colored box) from before real poster art existed
// in the catalog -- every other card (EditorialCard, Calendar, Reviews,
// live search results) was updated to show real key art when available, but
// the Details modal (Modal.js) still called this with just a title string,
// so every Details view showed the placeholder even for titles with a
// poster everywhere else in the app. Now takes the item (or a bare title
// string, for backward compatibility) and renders the real image via the
// existing .poster.has-image CSS rule when one is available.
export function Poster(itemOrTitle, className=""){
  const item = (itemOrTitle && typeof itemOrTitle === "object") ? itemOrTitle : {title: itemOrTitle};
  const title = escapeHtml(item.title);
  if(item.poster){
    return `<div class="poster has-image ${className}" role="img" aria-label="${title} poster"><img src="${escapeHtml(item.poster)}" alt="${title} poster" loading="lazy"></div>`;
  }
  return `<div class="poster ${className}" role="img" aria-label="${title} poster">${title}</div>`;
}
