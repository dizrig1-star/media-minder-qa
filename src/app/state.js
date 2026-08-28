const STORAGE_KEY = "media-minder-state-v3";

// Orphaned keys from earlier, pre-consolidation schema versions. Nothing in this
// app has read or written these since state moved to one consolidated object --
// they only ever survive as leftover browser data.
const LEGACY_KEYS = ["media-minder-watchlist-v1", "media-minder-ratings-v1"];

const initialState = {
page: "landing",
profile: null,
shows: [],
movies: [],
franchises: [],
platforms: [],
watchlist: [],
watched: [],
notInterested: [],
progress: {},
ratings: {},
onboardingComplete: false,
query: "",
movieMood: null,
reviewsSort: "rating",
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
// Watching it settles the question either way -- clear any earlier "not for me".
const notInterested = state.notInterested.filter(x => x !== id);
this.set({watched: next, notInterested});
},
toggleNotInterested(id){
const next = state.notInterested.includes(id)
? state.notInterested.filter(x => x !== id)
: [...state.notInterested, id];
const watched = state.watched.filter(x => x !== id);
this.set({notInterested: next, watched});
},
toggleFranchiseFavorite(id){
const profile = state.profile || {};
const current = Array.isArray(profile.favoriteFranchises) ? profile.favoriteFranchises : [];
const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
this.set({profile:{...profile, favoriteFranchises: next}});
},
toggleFavoriteGenre(genre){
const profile = state.profile || {};
const current = Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres : [];
const next = current.includes(genre) ? current.filter(x => x !== genre) : [...current, genre];
this.set({profile:{...profile, favoriteGenres: next}});
},
toggleFavoritePlatform(id){
const profile = state.profile || {};
const current = Array.isArray(profile.platforms) ? profile.platforms : [];
const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
this.set({profile:{...profile, platforms: next}});
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
notInterested:state.notInterested,
progress:state.progress,
ratings:state.ratings,
onboardingComplete:state.onboardingComplete
}));
}

function removeLegacyKeys(){
for(const key of LEGACY_KEYS){
try{ localStorage.removeItem(key); }catch{}
}
}

export function hydrateLocalState(){
try{
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
state = {...state, ...saved};
state.watchlist = Array.isArray(state.watchlist) ? state.watchlist : [];
state.watched = Array.isArray(state.watched) ? state.watched : [];
state.notInterested = Array.isArray(state.notInterested) ? state.notInterested : [];
state.progress = state.progress && typeof state.progress === "object" ? state.progress : {};
state.ratings = state.ratings && typeof state.ratings === "object" ? state.ratings : {};
state.onboardingComplete = saved.onboardingComplete === true;
state.profile = state.profile && typeof state.profile === "object" ? state.profile : null;
for(const [id,value] of Object.entries(state.progress)){
const n = Number(value);
state.progress[id] = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
}catch{
state = {...initialState};
}
removeLegacyKeys();
}

export function normalizeProgressValue(value,total=Infinity){
const n=Number(value);
if(!Number.isFinite(n) || n<0) return 0;
return Math.min(Math.floor(n),Number.isFinite(total)?Number(total):n);
}
