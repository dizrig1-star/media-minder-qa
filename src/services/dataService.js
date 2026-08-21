export async function loadData(){
  const files = ["profile","shows","movies","franchises","platforms"];
  const entries = await Promise.all(files.map(async name=>{
    const url = new URL(`../data/${name}.json`, import.meta.url);
    const response = await fetch(url);
    if(!response.ok) throw new Error(`Unable to load ${name}.json`);
    return [name, await response.json()];
  }));
  return Object.fromEntries(entries);
}
