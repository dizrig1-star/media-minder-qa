export async function loadData(){
  const files = ["profile","shows","movies","franchises","platforms","onboardingShows"];
  const entries = await Promise.all(files.map(async name=>{
    const url = new URL(`../data/${name}.json`, import.meta.url);
    const response = await fetch(url);
    if(!response.ok) throw new Error(`Unable to load ${name}.json`);
    return [name, await response.json()];
  }));
  const data=Object.fromEntries(entries);
  data.shows=[...(data.shows||[]), ...(data.onboardingShows||[])];
  delete data.onboardingShows;
  return data;
}
