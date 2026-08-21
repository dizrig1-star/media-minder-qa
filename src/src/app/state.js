const STORAGE_KEY = "media-minder-state-v2";

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
  }
};

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    watchlist:state.watchlist,
    watched:state.watched,
    progress:state.progress,
    ratings:state.ratings
  }));
}

export function hydrateLocalState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state = {...state, ...saved};
  }catch{}
}
