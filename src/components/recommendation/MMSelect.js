export function MMSelect(level){
  if(!level) return "";
  const key=level.toLowerCase();
  return `<span class="mm-select mm-select-${key}" title="MM Select ${level}">
    <img src="./../assets/branding/mm-select-${key}.svg" alt="MM Select ${level}">
    <span class="sr-only">MM Select ${level}</span>
  </span>`;
}
