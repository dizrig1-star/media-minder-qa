export function Rating(value=0, interactive=false, id=""){
  return `<span class="rating" aria-label="${value} out of 5 stars">
    ${interactive?`<span class="rating-label">What's your rating?</span>`:""}
    ${[1,2,3,4,5].map(n=>interactive
      ? `<button class="star ${n<=value?"on":""}" data-rate-id="${id}" data-rating="${n}" aria-label="Rate ${n} stars">★</button>`
      : `<span class="star ${n<=value?"on":""}">★</span>`).join("")}
  </span>`;
}
