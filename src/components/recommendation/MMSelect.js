export function MMSelect(level){
  if(!level) return "";
  const key=level.toLowerCase();
  const artwork=new URL(`../../../assets/branding/mm-select-${key}.svg`, import.meta.url).href;
  return `<span class="mm-select mm-select-${key}" title="MM Select ${level}">
    <img src="${artwork}" alt="MM Select ${level}">
    <span class="sr-only">MM Select ${level}</span>
  </span>`;
}
