export function MMSelect(level){
  if(!level) return "";
  const label=String(level).trim();
  const artwork=new URL("../../../assets/branding/approved/mm-select-seal.svg", import.meta.url).href;
  return `<span class="mm-select mm-select-${label.toLowerCase()}" title="MM Select ${label}">
    <img src="${artwork}" alt="MM Select ${label}">
    <span class="sr-only">MM Select ${label}</span>
  </span>`;
}
