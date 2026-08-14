export function Progress(item, current=0){
  const total = item.progressTotal || item.episodes || 1;
  const next = Math.min(total, Number(current || 0) + 1);
  return `<div class="progress-control">
    <label for="progress-${item.id}"><strong>Episode ${current || 0} of ${total}</strong></label>
    <select id="progress-${item.id}" data-progress-id="${item.id}" aria-label="Episode progress for ${item.title}">
      ${Array.from({length:total+1},(_,i)=>`<option value="${i}" ${i===Number(current||0)?"selected":""}>Episode ${i} of ${total}</option>`).join("")}
    </select>
    <span class="muted">${current >= total ? "Season complete" : `Next: Episode ${next}`}</span>
  </div>`;
}
