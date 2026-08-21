export function Progress(item, current=0){
  const total = item.progressTotal || item.episodes || 1;
  const value = Math.max(0, Math.min(total, Number(current || 0)));
  const next = Math.min(total, value + 1);
  const seasonLabel = item.season ? `Season ${item.season}` : "";
  const label = value === 0
    ? (seasonLabel ? `Not started · ${seasonLabel}` : "Not started")
    : (seasonLabel ? `${seasonLabel} · Episode ${value} of ${total}` : `Episode ${value} of ${total}`);
  return `<div class="progress-control">
    <label for="progress-${item.id}"><strong>${label}</strong></label>
    <select id="progress-${item.id}" data-progress-id="${item.id}" aria-label="Episode progress for ${item.title}${seasonLabel?", "+seasonLabel:""}">
      <option value="0" ${value===0?"selected":""}>Not started</option>
      ${Array.from({length:total},(_,i)=>{const ep=i+1;return `<option value="${ep}" ${ep===value?"selected":""}>Episode ${ep} of ${total}</option>`}).join("")}
    </select>
    <span class="muted">${value >= total ? (seasonLabel?`${seasonLabel} complete`:"Season complete") : `Next: Episode ${next}`}</span>
  </div>`;
}
