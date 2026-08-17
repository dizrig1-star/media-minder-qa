const STORAGE_KEY = "media-minder-state-v3";
const LEGACY_WATCHLIST_KEY = "media-minder-watchlist-v1";

const initialState = {
  page: "landing",
  profile: null,
  shows: [],
  movies: [],
  franchises: [],
  platforms: [],
  watchlist: [],
  watched: [],
  progress: {},
  ratings: {},
  onboardingComplete: false,
  query: "",
  dataReady: false
};

let state = structuredClone(initialState);
const listeners = new Set();

export const appState = {
  get: () => state,
  subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); },
  set(patch){
    state = {...state, ...patch};
    persist();
    listeners.forEach(fn => fn(state));
  },
  toggleWatchlist(id){
    const next = state.watchlist.includes(id)
      ? state.watchlist.filter(x => x !== id)
      : [...state.watchlist, id];
    this.set({watchlist: next});
  },
  rate(id, rating){
    this.set({ratings:{...state.ratings,[id]:rating}});
  },
  setProgress(id, episode){
    this.set({progress:{...state.progress,[id]:Number(episode)}});
  },
  toggleWatched(id){
    const next = state.watched.includes(id)
      ? state.watched.filter(x => x !== id)
      : [...state.watched, id];
    this.set({watched: next});
  },
  completeOnboarding(watchingIds, ratings, profile){
    const selected = Array.isArray(watchingIds) ? watchingIds.map(String) : [];
    const nextWatchlist = [...new Set([...state.watchlist.map(String), ...selected])];
    this.set({
      watchlist: nextWatchlist,
      ratings: {...state.ratings, ...ratings},
      profile,
      onboardingComplete: true
    });
  }
};

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    profile:state.profile,
    watchlist:state.watchlist,
    watched:state.watched,
    progress:state.progress,
    ratings:state.ratings,
    onboardingComplete:state.onboardingComplete
  }));
}

export function hydrateLocalState(){
  try{
    localStorage.removeItem(LEGACY_WATCHLIST_KEY);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state = {...state, ...saved};
    state.watchlist = Array.isArray(state.watchlist) ? state.watchlist : [];
    state.watched = Array.isArray(state.watched) ? state.watched : [];
    state.progress = state.progress && typeof state.progress === "object" ? state.progress : {};
    state.ratings = state.ratings && typeof state.ratings === "object" ? state.ratings : {};
    state.onboardingComplete = saved.onboardingComplete === true;
    for(const [id,value] of Object.entries(state.progress)){
      const n = Number(value);
      state.progress[id] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    }
  }catch{
    state = {...initialState};
  }
}

export function normalizeProgressValue(value,total=Infinity){
  const n=Number(value);
  if(!Number.isFinite(n) || n<0) return 0;
  return Math.min(Math.floor(n),Number.isFinite(total)?Number(total):n);
}
