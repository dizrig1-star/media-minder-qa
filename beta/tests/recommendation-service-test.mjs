import assert from "assert";
import { pickWildcard, selectRotatingWildcard, resolveWildcard } from "../src/services/recommendationService.js";

// Wildcard v2: rotating picks instead of always the same highest-scoring
// hand-tagged title. See the "why should this rotate at all" discussion
// with Simon -- the whole point was that the old pickWildcard was
// deterministic (same pick every visit until the catalog or profile
// changed), which doesn't read as a "wildcard" at all.

// 1. selectRotatingWildcard is stable for a given seed (same day -> same
// pick, no flicker on re-render) but varies across different seeds (so it
// actually rotates day to day, rather than being disguised determinism).
{
  const candidates = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const pickToday = selectRotatingWildcard(candidates, "2026-09-05");
  const pickTodayAgain = selectRotatingWildcard(candidates, "2026-09-05");
  assert.equal(pickToday.id, pickTodayAgain.id, "same seed must always produce the same pick");

  const seeds = ["2026-09-01","2026-09-02","2026-09-03","2026-09-04","2026-09-05","2026-09-06","2026-09-07","2026-09-08"];
  const picks = new Set(seeds.map(s => selectRotatingWildcard(candidates, s).id));
  assert.ok(picks.size > 1, "across a week of different seeds, the pick should actually vary, not stay fixed");
}
{
  assert.equal(selectRotatingWildcard([], "2026-09-05"), null);
  assert.equal(selectRotatingWildcard(null, "2026-09-05"), null);
}
console.log("PASS -- selectRotatingWildcard is stable per seed but rotates across different seeds");

// 2. pickWildcard still only considers hand-curated "deliberate wildcard"
// titles (the static-pool fallback), but now rotates among them by seed
// instead of always returning the single highest-scoring one.
{
  const items = [
    { id: "w1", why: "A deliberate wildcard: pick one." },
    { id: "w2", why: "A deliberate wildcard: pick two." },
    { id: "normal", why: "Just a regular recommendation." }
  ];
  const seeds = ["2026-09-01","2026-09-02","2026-09-03","2026-09-04","2026-09-05","2026-09-06"];
  const picks = new Set(seeds.map(s => pickWildcard(items, {}, s).id));
  assert.ok([...picks].every(id => id === "w1" || id === "w2"), "should only ever pick from titles tagged as a deliberate wildcard");
  assert.ok(picks.size === 2, "with two candidates and varying seeds, both should get picked eventually");
}
{
  assert.equal(pickWildcard([], {}, "2026-09-05"), null);
  assert.equal(pickWildcard([{ id: "x", why: "nothing special" }], {}, "2026-09-05"), null);
}
console.log("PASS -- pickWildcard rotates among the static curated pool instead of always the top scorer");

// 3. resolveWildcard prefers the live TMDB-correlation pool
// (state.wildcardCandidates) when it has anything, and only falls back to
// the static curated pool when it's empty (no 5-star ratings yet, no TMDB
// key, or discovery hasn't produced anything).
{
  const staticItems = [{ id: "static-1", why: "A deliberate wildcard: the old pool." }];
  const withLivePool = { wildcardCandidates: [{ id: "live-1" }, { id: "live-2" }], profile: {} };
  const pick1 = resolveWildcard(withLivePool, staticItems, "2026-09-05");
  assert.ok(pick1.id === "live-1" || pick1.id === "live-2", "should prefer the live correlation pool when it has candidates");

  const withoutLivePool = { wildcardCandidates: [], profile: {} };
  const pick2 = resolveWildcard(withoutLivePool, staticItems, "2026-09-05");
  assert.equal(pick2.id, "static-1", "should fall back to the static curated pool when the live pool is empty");

  const withNeither = { wildcardCandidates: [], profile: {} };
  assert.equal(resolveWildcard(withNeither, [], "2026-09-05"), null);
}
console.log("PASS -- resolveWildcard prefers the live 5-star-correlation pool, falls back to the static pool");
