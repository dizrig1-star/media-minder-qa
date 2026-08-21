const VALID={useful:["yes","no"]};

export function createFeedback({itemId, value, note="", surface="recommendation", profileId=""}){
  if(!itemId || !VALID.useful.includes(value)) throw new Error("Invalid feedback");
  return {
    itemId,
    value,
    note:String(note).trim(),
    surface,
    profileId,
    createdAt:new Date().toISOString()
  };
}

export function applyFeedback(profile, feedback){
  return {
    ...profile,
    feedback:[...(profile.feedback||[]), feedback]
  };
}
